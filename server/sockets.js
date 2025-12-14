function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('createLobby', function(d) {
    data.createLobby(d.lobbyID,
    d.lang,
    d.playerName,
    d.numberOfQuestions);
    

    socket.emit('lobbyData', data.getLobby(d.lobbyID));
    console.log("lobbyData sent for", d.lobbyID);


  });

  socket.on('addQuestion', function(d) {
    data.addQuestion(d.lobbyID, {q: d.q, a: d.a});
    socket.emit('questionUpdate', data.activateQuestion(d.lobbyID));
  });

  socket.on('joinLobby', function(lobbyID) {
    socket.join(lobbyID);
    socket.emit('lobbyData', data.getLobby(lobbyID));
    socket.emit('questionUpdate', data.activateQuestion(lobbyID));
    socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(lobbyID));
    socket.emit('participantsUpdate', data.getParticipants(lobbyID));

  });

  socket.on('participateInGame', function(d) {
    const lobby = data.getLobby(d.lobbyID);
    
     if (!lobby.participants.some((p) => p.role === "Player 1")) {
     // Assign Player 1
     data.participateInGame(d.lobbyID, {playerName :d.playerName , role: "Player 1" ,playerColor: "red"});
     socket.emit("playerRoleAssigned", "Player 1");
     socket.join(d.lobbyID);
   } else if (!lobby.participants.some((p) => p.role === "Player 2")) {
     // Assign Player 2
     data.participateInGame(d.lobbyID,{playerName: d.playerName , role: "Player 2" ,playerColor: "blue"});
     socket.emit("playerRoleAssigned", "Player 2");
     socket.join(d.lobbyID);
   } else {
     // Reject additional players
     socket.emit("lobbyError", "The game already has five players.");
     console.log("lobby full, cannot add", d.playerName, "to", d.lobbyID);
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
    const lobbyExists = data.lobbyExists(lobbyID);
     console.log('[sockets] validateLobbyID result for', lobbyID, '=', lobbyExists);
    
    callback(lobbyExists);
  });

  socket.on("startGame", lobbyID => { //starta spelet 
    console.log("startGame to server", lobbyID); //check
    io.to(lobbyID).emit("gameStart", lobbyID); //skickar gameStart till alla i lobbyn
  });
}

export { sockets };