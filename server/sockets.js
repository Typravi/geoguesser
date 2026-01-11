function sockets(io, socket, data) {

  /*************** UI LABELS ***************/
  socket.on("getUILabels", function (lang) {
    socket.emit("uiLabels", data.getUILabels(lang));
  });

  /*************** Lobbby setup / create / join ***************/
  socket.on("createGame", function (d) {
    data.createGame(
      d.lobbyID,
      d.lang,
      d.playerName,
      d.numberOfQuestions,
      d.continent,
      d.round,
      d.time
    );
    data.assignCities(d.lobbyID);
    // Join room and emit data
    socket.join(d.lobbyID);
    io.to(d.lobbyID).emit("gameData", data.getGame(d.lobbyID));
    console.log("gameData sent for", d.lobbyID);
  });

  socket.on("joinGame", function (lobbyID) {
    socket.join(lobbyID);
    const lobby = data.getGame(lobbyID);
    socket.emit("gameData", {...lobby}); // ... "kopierar" innehållet så att timeStamp blir samma för alla
    socket.emit("participantsUpdate", data.getParticipants(lobbyID)); //skicka med time stamp till join
  });

  socket.on("participateInGame", function (d) {
    const lobby = data.getGame(d.lobbyID);
    
    if (lobby.locked) {
      socket.emit(
        "lobbyError",
        "Lobbyn är låst (spelet har redan startats av hosten)"
      );
      return;
    }
    //Kollar så att max antal (5) spelare ej är uppnått, ifall det är uppnåt får man nt gå med
    if (lobby.participants.length >= 5) {
      socket.emit("lobbyError", "Lobby is full (max 5 players)");
      console.log("Lobby full:", d.lobbyID);
      return;
    }
    //Kollar så att ingen spelare försöker ha samma playerName som en annan
    const nameTaken = lobby.participants.some(
      (p) => p.playerName === d.playerName
    );
    if (nameTaken) {
      socket.emit("lobbyError", "Name already taken");
      console.log(
        "Name taken:",
        d.playerName,
        "is already used in lobby:",
        d.lobbyID
      );
      return;
    }
    //Lägger till spelaren i participants om inte något av de ovan har nekat/låst ute spelaren
    data.participateInGame(d.lobbyID, d.playerName);
    socket.join(d.lobbyID);
    socket.emit("playerJoined");
    console.log("adding participant", d.playerName, "to", d.lobbyID);
    io.to(d.lobbyID).emit(
      "participantsUpdate",
      data.getParticipants(d.lobbyID)
    );
  });

/*************** Validation ***************/
  socket.on("validateLobbyID", (lobbyID, callback) => {
    console.log("[sockets] validateLobbyID received:", lobbyID);
    if (typeof lobbyID !== "string" || lobbyID.trim() === "") {
      console.log("[sockets] validateLobbyID invalid input");
      return callback(false);
    }
    const gameExists = data.gameExists(lobbyID);
    console.log(
      "[sockets] validateLobbyID result for",
      lobbyID,
      "=",
      gameExists
    );
    callback(gameExists);
  });

  /*************** Game flow (start / next round/ results/ play again)***************/
  socket.on("startGame", (lobbyID) => {
    //starta spelet
    const lobby = data.getGame(lobbyID);
    console.log("startGame to server", lobbyID); //check
    lobby.roundEndsAt = Date.now() + lobby.time * 1000; //timestamp som gör att timern inte tickar ner utan "slutar" vid ett exakt klockslag
    lobby.locked = true;
    lobby.started = true;
    io.to(lobbyID).emit("gameStart", {...lobby}); //ändrat från io.to(lobbyID).emit("gameStart", lobbyID)
  });

  socket.on("startNextRound", (d) => {
    const lobby = data.getGame(d.lobbyID);
    if (!lobby) return;
    if (lobby.cities && lobby.round < lobby.cities.length) {
      lobby.round += 1;
    lobby.roundEndsAt = Date.now() + lobby.time * 1000; //ny timestamp för nästa runda 
      io.to(d.lobbyID).emit("gameData", {...lobby});
    } else {
      io.to(d.lobbyID).emit("resultsView", data.getGame(d.lobbyID));
    }
  });

  socket.on("playAgain", (lobbyID) => {
    const lobby = data.resetGame(lobbyID);

    if (lobby) {
      io.to(lobbyID).emit("gameReset", lobby);
      io.to(lobbyID).emit("participantsUpdate", lobby.participants);
    }
  });

  /*************** Player action / scoring ***************/
  socket.on(
    "finalClick",
    ({ lobbyID, playerName, locationGuess, roundScore }) => {
      const lobby = data.getGame(lobbyID);
      const player = lobby.participants.find(
        (p) => p.playerName === playerName
      );
      player.latestClick = locationGuess ?? null;
      player.totalScore += roundScore;
      player.roundScore = roundScore;
      io.to(lobbyID).emit("participantsUpdate", data.getParticipants(lobbyID));
    }
  );

  /*************** Discard / leave Lobby ***************/  

  socket.on("discardLobby", (lobbyID) => {
    console.log("Host discarded lobby", lobbyID);
    io.to(lobbyID).emit("lobbyDiscardedByHost");
  });

  socket.on("playerLeaveLobby", ({ lobbyID, playerName }) => {
    data.removeParticipant(lobbyID, playerName);
    socket.leave(lobbyID);
    io.to(lobbyID).emit("participantsUpdate", data.getParticipants(lobbyID));
    io.to(lobbyID).emit("playerLeft", { playerName });
  });

}
export { sockets };
