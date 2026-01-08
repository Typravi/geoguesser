'use strict';
import {readFileSync} from "fs";

const continentData = JSON.parse(
  readFileSync(new URL("./data/maps.json", import.meta.url), "utf-8")
);
function randomInt(max) {
  return Math.floor(Math.random() * max);
}

const playerColors = [
  "#e6194b", // röd
  "#00d0ffff", // ljusblå
  "#ff00ddff", // rosa
  "#f58231", // orange
  "#911eb4"  // lila
];


// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
 this.lobbies = {};
 this.lobbies['test'] = {
   lang: "en",
   questions: [],
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


Data.prototype.createGame = function(lobbyID, lang = "en", hostName = null, numberOfQuestions = 0, continent = null, round = null, time = 0) {
 if (!this.gameExists(lobbyID)) {
   const lobby = {
     lang: lang,
     hostName: hostName,
     numberOfQuestions: numberOfQuestions,
     continent: continent,
     cities: [],
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
Data.prototype.generateCitiesForLobby = function (continent, numberOfQuestions) {
  const isPlanetEarth = continent === "Planet earth";

  const allContinents = Object.keys(continentData);

  const citiesOut = [];

  // helper to pick one city from a specific continent
  const pickOneFromContinent = (continentKey) => {
    const entry = continentData[continentKey];
    if (!entry || !entry.cities) return null;

    const cityNames = Object.keys(entry.cities);
    if (cityNames.length === 0) return null;

    const name = cityNames[randomInt(cityNames.length)];
    const coords = entry.cities[name]; // {x,y}

    return {
      name,
      coordinates: { x: coords.x, y: coords.y },
      continent: continentKey,
    };
  };

  // ensure uniqueness by (continent + name) so Planet earth can still avoid duplicates
  const used = new Set();

  while (citiesOut.length < numberOfQuestions) {
    const continentKey = isPlanetEarth
      ? allContinents[randomInt(allContinents.length)]
      : String(continent).toLowerCase();

    const city = pickOneFromContinent(continentKey);
    if (!city) break;

    const key = `${city.continent}:${city.name}`;
    if (used.has(key)) continue;

    used.add(key);
    citiesOut.push(city);
  }

  return citiesOut;
};

Data.prototype.assignCities = function (lobbyID) {
  if (!this.gameExists(lobbyID)) return;

  const lobby = this.lobbies[lobbyID];
  lobby.cities = this.generateCitiesForLobby(lobby.continent, lobby.numberOfQuestions);
};



Data.prototype.getParticipants = function(lobbyID) {
 const lobby = this.lobbies[lobbyID];
 console.log("participants requested for", lobbyID);
 if (this.gameExists(lobbyID)) {
   return this.lobbies[lobbyID].participants
 }
 return [];
}

Data.prototype.removeParticipant = function(lobbyID, playerName){
  if (!this.gameExists(lobbyID)) return;

  const lobby = this.lobbies[lobbyID];
  lobby.participants = lobby.participants.filter(p => p.playerName !== playerName)
}


export { Data };


