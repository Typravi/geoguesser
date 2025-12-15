import { Socket } from "socket.io-client";

function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('createLobby', function(d) {
    data.createLobby(
      d.lobbyID,
      d.lang,
      d.playerName,
      d.numberOfQuestions,
      socket.id); //la till socket id här

    socket.join(d.lobbyID); //hosten joinar rummet direkt
    
    // skicka data till hosten
    const lobby = data.getLobby(d.lobbyID);
    
    // skicka lobby detalijer tex HostName, Questions
    socket.emit('lobbyData', lobby); 
    
    //participants list med hosten som första deltagare
    socket.emit('participantsUpdate', lobby.participants);
    
    //berätta för client att de är 'Host'
    socket.emit('playerRoleAssigned', 'Host'); 
    
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

  /*
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
 });*/

 
 socket.on('participateInGame', function(d) {
    const { lobbyID, playerName, lang } = d;
    const currentSocketId = socket.id;

    // 1. Input Validation
    if (!lobbyID || !playerName) {
        return socket.emit('lobbyError', data.getUILabels(lang).invalidData || 'Invalid join data provided.');
    }

    // 2. Lobby Existence Check
    const lobby = data.getLobby(lobbyID);
    if (!lobby || !lobby.participants) {
        return socket.emit('lobbyError', data.getUILabels(lang).lobbyNotFound || "Lobby does not exist.");
    }
    
    // --- Role Assignment (Focusing only on New Players) ---
    
    let assignedRole = null;
    let participantData = null;

    // Define all available roles/slots
    const availableRoles = ["Player 1", "Player 2", "Player 3", "Player 4"]; // Adjust max players here
    
    // Find the first role that isn't currently assigned to a participant
    assignedRole = availableRoles.find(role => 
        !lobby.participants.some(p => p.role === role)
    );

    if (!assignedRole) {
        // Lobby Full: Signal failure to the client
        return socket.emit('lobbyError', data.getUILabels(lang).lobbyFull || "The lobby is full.");
    }

    // 3. Create New Participant Object
    participantData = {
        playerName: playerName,
        socketID: currentSocketId, // We still use socketID for targeted messaging
        role: assignedRole,
        playerColor: assignedRole === "Player 1" ? "red" : "blue", // Simple color assignment
        isHost: false // Host should have been set during createLobby
    };

    // Add the new participant to the data model (Data.js needs to handle the push)
    data.participateInGame(lobbyID, participantData);
    console.log(`New player ${playerName} joined lobby ${lobbyID}. Role: ${assignedRole}`);
    
    
    // 4. Success Communication
    
    // Join the current socket to the lobby room
    socket.join(lobbyID);

    // Send immediate updates to the joining client (specific to this socket)
    socket.emit('playerRoleAssigned', assignedRole); 
    socket.emit('lobbyData', data.getLobby(lobbyID));

    // Broadcast updated participants list to everyone in the room
    io.to(lobbyID).emit('participantsUpdate', data.getParticipants(lobbyID));
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