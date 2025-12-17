function sockets(io, socket, data) {
  socket.on('getUILabels', function(lang) {
   socket.emit('uiLabels', data.getUILabels(lang));
 });


 socket.on('createGame', function(d) {
   data.createGame(d.lobbyID,
   d.lang,
   d.playerName,
   d.numberOfQuestions,
   d.continent,
   d.cities,
   d.round,
  );
  

   socket.emit('gameData', data.getGame(d.lobbyID));
   console.log("gameData sent for", d.lobbyID);

 });


 socket.on('addQuestion', function(d) {
   data.addQuestion(d.lobbyID, {q: d.q, a: d.a});
   socket.emit('questionUpdate', data.activateQuestion(d.lobbyID));
 });


 socket.on('joinGame', function(lobbyID) {
   socket.join(lobbyID);
   socket.emit('gameData', data.getGame(lobbyID));
   socket.emit('questionUpdate', data.activateQuestion(lobbyID));
   socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(lobbyID));
   socket.emit('participantsUpdate', data.getParticipants(lobbyID));

 });


 socket.on('participateInGame', function(d) {
  const lobby = data.getGame(d.lobbyID);

  if (lobby.participants.length >= 5) {
    socket.emit("lobbyError", "Lobby is full (max 5 players).");
    console.log("Lobby full:", d.lobbyID);
    return;
  }

  // kolla om namnet redan används (nu är p ett objekt)
  const nameTaken = lobby.participants.some(p => p.playerName === d.playerName);

  if (!nameTaken) {
    // lägg till spelaren (Data.participateInGame ger färg)
    data.participateInGame(d.lobbyID, d.playerName);
    socket.emit("playerJoined");
    socket.join(d.lobbyID);
  } else {
    socket.emit("lobbyError", "Name taken");
    console.log("name taken:", d.playerName, "in", d.lobbyID);
    return;
  }

  console.log("adding participant", d.playerName, "to", d.lobbyID);
  io.to(d.lobbyID).emit('participantsUpdate', data.getParticipants(d.lobbyID));
});

 socket.on('runQuestion', function(d) {
   let question = data.activateQuestion(d.lobbyID, d.questionNumber);
   io.to(d.lobbyID).emit('questionUpdate', question);
   io.to(d.lobbyID).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.lobbyID));
 });


 socket.on('submitAnswer', function(d) {
   data.submitAnswer(d.lobbyID, d.answer);
   io.to(d.lobbyID).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.lobbyID));
 });


  socket.on('validateLobbyID', (lobbyID, callback) => {
   console.log('[sockets] validateLobbyID received:', lobbyID);
   if (typeof lobbyID !== 'string' || lobbyID.trim() === '') {
     console.log('[sockets] validateLobbyID invalid input');
     return callback(false);
   }
   const gameExists = data.gameExists(lobbyID);
    console.log('[sockets] validateLobbyID result for', lobbyID, '=', gameExists);
  
   callback(gameExists);
 });


 socket.on("startGame", lobbyID => { //starta spelet
  const lobby = data.getGame(lobbyID);
   console.log("startGame to server", lobbyID); //check
   io.to(lobbyID).emit("gameStart", lobby); //ändrat från io.to(lobbyID).emit("gameStart", lobbyID)
 });

 socket.on("finalClick", ({ lobbyID, playerName, locationGuess }) => {
  const lobby = data.getGame(lobbyID);
  const player = lobby.participants.find(p => p.playerName === playerName);
  player.latestClick = locationGuess;
  io.to(lobbyID).emit("participantsUpdate", data.getParticipants(lobbyID));
});

socket.on('startNextRound', function(d) {
  const lobby = data.getGame(d.lobbyID);

  if (!lobby) return;

  // Ta bort första staden/frågan
  if (lobby.cities && lobby.round <= lobby.cities.length ) {
    lobby.round += 1;
  }

  // Skicka uppdaterad gameData till alla i lobbyn
  io.to(d.lobbyID).emit('gameData', data.getGame(d.lobbyID));
});


}



export { sockets };
