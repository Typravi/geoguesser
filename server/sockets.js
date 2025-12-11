function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('createLobby', function(d) {
    data.createLobby(d.lobbyID,
    d.lang,
    d.name,
    d.numberOfQuestions);
    data.participateInGame(d.lobbyID, d.name);
    socket.emit('lobbyData', data.getLobby(d.lobbyID));
    console.log("lobbyData sent for", d.lobbyID);
    socket.emit('participantsUpdate', data.getParticipants(d.lobbyID));



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
    console.log("adding participant", d.userName, "to", d.lobbyID);
    data.participateInGame(d.lobbyID, d.userName);
    io.to(d.lobbyID).emit('participantsUpdate', data.getParticipants(d.lobbyID));
  });
  socket.on('startPoll', function(lobbyID) {
    io.to(lobbyID).emit('startPoll');
  })
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
}

export { sockets };