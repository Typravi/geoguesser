"use strict";
import { readFileSync } from "fs";

/*************** CONSTANTS ***************/

const continentData = JSON.parse(
  readFileSync(new URL("./data/maps.json", import.meta.url), "utf-8")
);


const playerColors = [
  "#e6194b", // röd
  "#00d0ffff", // ljusblå
  "#ff00ddff", // rosa
  "#f58231", // orange
  "#911eb4", // lila
];

/*************** Help functions ***************/
function randomInt(max) {
  return Math.floor(Math.random() * max);
}

/*************** DATA CLASS ***************/

function Data() {
  this.lobbies = {};
}
/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/

/*************** UI LABELS ***************/

Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some((el) => el === lang)) lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
};

/*************** LOBBY ACCESS (EXISTS / GET) ***************/

Data.prototype.gameExists = function (lobbyID) {
  return typeof this.lobbies[lobbyID] !== "undefined";
};

Data.prototype.getGame = function (lobbyID) {
  if (this.gameExists(lobbyID)) {
    return this.lobbies[lobbyID];
  }
  return [];
};

/*************** LOBBY CREATION ***************/

Data.prototype.createGame = function (
  lobbyID,
  lang = "en",
  hostName = null,
  numberOfQuestions = 0,
  continent = null,
  round = null,
  time = 0
) {
  if (!this.gameExists(lobbyID)) {
    const lobby = {
      lang: lang,
      hostName: hostName,
      numberOfQuestions: numberOfQuestions,
      continent: continent,
      cities: [],
      round: round,
      participants: [
        {
          playerName: hostName,
          color: playerColors[0],
          latestClick: null,
          totalScore: 0,
          roundScore: 0,
        },
      ],
      currentQuestion: 0,
      time: time,

      //nedan är mitt påbörjade försök till att låsa lobbyn från nya joiners efter att hosten klickat på start game mvh ronja
      locked: false,
      started: false,
    };
    this.lobbies[lobbyID] = lobby;
  }
  return this.lobbies[lobbyID];
};

/*************** PARTICIPANTS (ADD/GET/REMOVE) ***************/

Data.prototype.participateInGame = function (lobbyID, playerName) {
  const lobby = this.lobbies[lobbyID];

  if (this.gameExists(lobbyID)) {
    // Ta fram upptagna färger
    const takenColors = lobby.participants.map((p) => p.color);

    // Hitta en ledig färg
    let availableColor = playerColors.find((c) => !takenColors.includes(c));

    // Fallbackbasera på index
    if (!availableColor) {
      const index = lobby.participants.length;
      availableColor = playerColors[index % playerColors.length];
    }

    const player = {
      playerName: playerName,
      color: availableColor,
      latestClick: null,
      totalScore: 0,
      roundScore: 0,
    };

    // 5. Lägg till i lobbyn
    lobby.participants.push(player);
  }
};


Data.prototype.getParticipants = function (lobbyID) {
  if (this.gameExists(lobbyID)) {
    return this.lobbies[lobbyID].participants;
  }
  return [];
};

Data.prototype.removeParticipant = function (lobbyID, playerName) {
  if (!this.gameExists(lobbyID)) return;

  const lobby = this.lobbies[lobbyID];
  lobby.participants = lobby.participants.filter(
    (p) => p.playerName !== playerName
  );
};

/*************** CITIES (GENERATE/ASSIGN) ***************/

Data.prototype.generateCitiesForLobby = function (
  continent,
  numberOfQuestions
) {
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
  lobby.cities = this.generateCitiesForLobby(
    lobby.continent,
    lobby.numberOfQuestions
  );
};

/*************** GAME RESET  ***************/

Data.prototype.resetGame = function (lobbyID) {
  const lobby = this.lobbies[lobbyID];

  if (!lobby) {
    return null;
  }
  //Nollställ runda och status
  lobby.round = 1;
  lobby.started = false;
  lobby.locked = false;

  //Nollställ poängen
  lobby.participants.forEach((player) => {
    player.totalScore = 0;
    player.roundScore = 0;
    player.latestClick = null;
  });

  // Slumpa nya städer
  this.assignCities(lobbyID);

  return lobby;
};

export { Data };
