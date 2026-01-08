function sockets(io, socket, data) {
  socket.on("getUILabels", function (lang) {
    socket.emit("uiLabels", data.getUILabels(lang));
  });

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
    socket.emit("gameData", data.getGame(lobbyID));
    socket.emit("participantsUpdate", data.getParticipants(lobbyID));
  });
socket.on("participateInGame", function (d) {

  const lobby = data.getGame(d.lobbyID);

  //Kollar om playerName redan finns i participate och släpper isf igenom (så man kan refresh/reconnect utan att blockas av låst lobby)
  const existing = lobby.participants.find((p) => p.playerName === d.playerName);
  if (existing) {
    socket.join(d.lobbyID);
    socket.emit("playerJoined");
    io.to(d.lobbyID).emit("participantsUpdate", data.getParticipants(d.lobbyID));
    return;
  }

  //Låser ute nya spelare ifall lobbyn är låst
  if (lobby.locked) {
    socket.emit("lobbyError", "Lobbyn är låst (spelet har redan startats av hosten)");
    return;
  }

  //Kollar så att max antal (5) spelare ej är uppnått, ifall det är uppnåt får man nt gå med 
  if (lobby.participants.length >= 5) {
    socket.emit("lobbyError", "Lobby is full (max 5 players)");
    console.log("Lobby full:", d.lobbyID);
    return;
  }

  //Kollar så att ingen spelare försöker ha samma playerName som en annan
  const nameTaken = lobby.participants.some((p) => p.playerName === d.playerName);
  if (nameTaken) {
    socket.emit("lobbyError", "Name already taken");
    console.log("Name taken:", d.playerName, "is already used in lobby:", d.lobbyID);
    return;
  }

  //Lägger till spelaren i participants om inte något av de ovan har nekat/låst ute spelaren
  data.participateInGame(d.lobbyID, d.playerName);
  socket.join(d.lobbyID);
  socket.emit("playerJoined");
  console.log("adding participant", d.playerName, "to", d.lobbyID);
  io.to(d.lobbyID).emit("participantsUpdate", data.getParticipants(d.lobbyID));
});

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

  socket.on("startGame", (lobbyID) => {
    //starta spelet
    const lobby = data.getGame(lobbyID);
    console.log("startGame to server", lobbyID); //check
    lobby.locked = true;
    lobby.started = true;

    io.to(lobbyID).emit("gameStart", lobby); //ändrat från io.to(lobbyID).emit("gameStart", lobbyID)
  });

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

  socket.on("startNextRound", (d) => {
    const lobby = data.getGame(d.lobbyID);
    if (!lobby) return;

    if (lobby.cities && lobby.round < lobby.cities.length) {
      lobby.round += 1;

      io.to(d.lobbyID).emit("gameData", data.getGame(d.lobbyID));
    } else {
      io.to(d.lobbyID).emit("resultsView", data.getGame(d.lobbyID));
    }
  });

  socket.on("discardLobby", (lobbyID) => {
    console.log("Host discarded lobby", lobbyID);

    io.to(lobbyID).emit("lobbyDiscardedByHost");
  });

  socket.on("playerLeaveLobby", ({ lobbyID, playerName }) => {
    data.removeParticipant(lobbyID, playerName);
    socket.leave(lobbyID);

    io.to(lobbyID).emit("participantsUpdate", data.getParticipants(lobbyID));
  });
}

export { sockets };
