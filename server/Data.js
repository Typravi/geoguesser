'use strict';
import {readFileSync} from "fs";

const playerColors = [
  "#e6194b", // röd
  "#3cb44b", // grön
  "#4363d8", // blå
  "#f58231", // orange
  "#911eb4"  // lila
];


// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
 this.lobbies = {};
 this.lobbies['test'] = {
   lang: "en",
   questions: [
     {q: "How old are you?",
      a: ["0-13", "14-18", "19-25", "26-35", "36-45","45-"]
     },
     {q: "How much do you enjoy coding?",
      a: ["1", "2", "3", "4", "5"]
     }
   ],
   answers: [],
   currentQuestion: 0,
   participants: []
 }
}


/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/


Data.prototype.gameExists = function (lobbyID) {
 return typeof this.lobbies[lobbyID] !== "undefined"
}


Data.prototype.getUILabels = function (lang) {
 //check if lang is valid before trying to load the dictionary file
 if (!["en", "sv"].some( el => el === lang))
   lang = "en";
 const labels = readFileSync("./server/data/labels-" + lang + ".json");
 return JSON.parse(labels);
}


Data.prototype.createGame = function(lobbyID, lang = "en", hostName = null, numberOfQuestions = 0, continent = null, cities = [], round = null, time = 0) {
 if (!this.gameExists(lobbyID)) {
   const lobby = {
     lang: lang,
     hostName: hostName,
     numberOfQuestions: numberOfQuestions,
     continent: continent,
     cities: cities,
     round: round,
     questions: [],
     answers: [],
     participants: [{
      playerName: hostName,
      color: playerColors[0], 
      latestClick: null,
      totalScore: 0,
      roundScore: 0,
}] ,
     currentQuestion: 0, 
     time: time, 
  
   };
   this.lobbies[lobbyID] = lobby;
   console.log("lobby created", lobbyID, lobby);
 }
 return this.lobbies[lobbyID];
};


Data.prototype.getGame = function(lobbyID) {
 if (this.gameExists(lobbyID)) {
   return this.lobbies[lobbyID];
 }
 return {};
}


Data.prototype.participateInGame = function (lobbyID, playerName) {
  console.log("participant will be added to", lobbyID, playerName);
  const lobby = this.lobbies[lobbyID];

  if (this.gameExists(lobbyID)) {
    const index = lobby.participants.length; // 0,1,2,...
    const color = playerColors[index % playerColors.length];

    const player = {
      playerName: playerName,
      color: color, 
      latestClick: null,
      totalScore: 0,
      roundScore: 0,
    };

    lobby.participants.push(player);
  }
}




Data.prototype.getParticipants = function(lobbyID) {
 const lobby = this.lobbies[lobbyID];
 console.log("participants requested for", lobbyID);
 if (this.gameExists(lobbyID)) {
   return this.lobbies[lobbyID].participants
 }
 return [];
}


Data.prototype.addQuestion = function(lobbyID, q) {
 if (this.gameExists(lobbyID)) {
   this.lobbies[lobbyID].questions.push(q);
 }
}


Data.prototype.activateQuestion = function(lobbyID, qId = null) {
 if (this.gameExists(lobbyID)) {
   const poll = this.lobbies[lobbyID];
   if (qId !== null) {
     poll.currentQuestion = qId;
   }
   return poll.questions[poll.currentQuestion];
 }
 return {}
}


Data.prototype.getSubmittedAnswers = function(lobbyID) {
 if (this.gameExists(lobbyID)) {
   const poll = this.lobbies[lobbyID];
   const answers = poll.answers[poll.currentQuestion];
   if (typeof poll.questions[poll.currentQuestion] !== 'undefined') {
     return answers;
   }
 }
 return {}
}


Data.prototype.submitAnswer = function(lobbyID, answer) {
 if (this.gameExists(lobbyID)) {
   const poll = this.lobbies[lobbyID];
   let answers = poll.answers[poll.currentQuestion];
   // create answers object if no answers have yet been submitted
   if (typeof answers !== 'object') {
     answers = {};
     answers[answer] = 1;
     poll.answers.push(answers);
   }
   // create answer property if that specific answer has not yet been submitted
   else if (typeof answers[answer] === 'undefined') {
     answers[answer] = 1;
   }
   // if the property already exists, increase the number
   else
     answers[answer] += 1
   console.log("answers looks like ", answers, typeof answers);
 }
}


export { Data };


