'use strict';
import {readFileSync} from "fs";

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

Data.prototype.lobbyExists = function (lobbyID) {
  return typeof this.lobbies[lobbyID] !== "undefined"
}

Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.createLobby = function(lobbyID, lang = "en", hostName = null, numberOfQuestions = 0) {
  if (!this.lobbyExists(lobbyID)) {
    const lobby = {
      lang: lang,
      hostName: hostName,
      numberOfQuestions: numberOfQuestions,
      questions: [],
      answers: [],
      participants: [],
      currentQuestion: 0
    };
    this.lobbies[lobbyID] = lobby;
    console.log("lobby created", lobbyID, lobby);
  }
  return this.lobbies[lobbyID];
};

Data.prototype.getLobby = function(lobbyID) {
  if (this.lobbyExists(lobbyID)) {
    return this.lobbies[lobbyID];
  }
  return {};
}

Data.prototype.participateInGame = function(lobbyID, userName) {
  console.log("participant will be added to", lobbyID, userName);
  if (this.lobbyExists(lobbyID)) {
    this.lobbies[lobbyID].participants.push({name: userName, answers: []})
  }
}

Data.prototype.getParticipants = function(lobbyID) {
  const lobby = this.lobbies[lobbyID];
  console.log("participants requested for", lobbyID);
  if (this.lobbyExists(lobbyID)) { 
    return this.lobbies[lobbyID].participants
  }
  return [];
}

Data.prototype.addQuestion = function(lobbyID, q) {
  if (this.lobbyExists(lobbyID)) {
    this.lobbies[lobbyID].questions.push(q);
  }
}

Data.prototype.activateQuestion = function(lobbyID, qId = null) {
  if (this.lobbyExists(lobbyID)) {
    const poll = this.lobbies[lobbyID];
    if (qId !== null) {
      poll.currentQuestion = qId;
    }
    return poll.questions[poll.currentQuestion];
  }
  return {}
}

Data.prototype.getSubmittedAnswers = function(lobbyID) {
  if (this.lobbyExists(lobbyID)) {
    const poll = this.lobbies[lobbyID];
    const answers = poll.answers[poll.currentQuestion];
    if (typeof poll.questions[poll.currentQuestion] !== 'undefined') {
      return answers;
    }
  }
  return {}
}

Data.prototype.submitAnswer = function(lobbyID, answer) {
  if (this.lobbyExists(lobbyID)) {
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



