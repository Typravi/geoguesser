//Denna filen tänkte jag kunde innehålla logik (typ funktioner och beräkningar)
//Dessa kan sedan användas flera gånger och globalt i projektet (hurra för inte så kladdig kod)

export function calculateDistance(guess, corr) {
  // pyth sats för att beräkna avstånd mellan två punkter
  const A = guess.x - corr.x;
  const B = guess.y - corr.y;
  return Math.hypot(A, B);
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot

export function getRandomCity(continent) {
  const continentsCities = Object.keys(continent.cities);
  const randomCity =
    continentsCities[Math.floor(Math.random() * continentsCities.length)];
  //raden ovan hämtar värdet på continentsCities[index], och index ges av ett random heltal från/mellan [0,(antalstäder-1)] från randomiseringen
  //kort å gott: de är raden ovan där den random staden väljs
  return { name: randomCity, coordinates: continent.cities[randomCity] };
}

export function getRandomContinent(allContinents) {
  const continentNames = Object.keys(allContinents);
  const randomContinent =
    continentNames[Math.floor(Math.random() * continentNames.length)];
  return { name: randomContinent, map: allContinents[randomContinent] };
}

//Straffet vid uteblivet klick avrundas uppåt till närmsta steg 1000,1500,2000 osv
// Notera att maxDistance måste räknas ut i GeoMapView som de ser ut nu
export function calculatePunishment (maxDistance) {
  const minPunishment = 1000;
  const extraProcentPunishment = 1.1;
  const step = 500;

  const extraTimesMax = extraProcentPunishment*maxDistance

  const punishmentRoundedUpToNextStep =
  Math.ceil(extraTimesMax/step)*step;
  return Math.max(minPunishment, punishmentRoundedUpToNextStep);
}

//Funktion för planet earth 
export function getCityPlanetEarth(allContinents) {
  const continentNames = Object.keys(allContinents);
  const randomContinent =
    continentNames[Math.floor(Math.random() * continentNames.length)];
  const city = getRandomCity(allContinents[randomContinent]);

  return { name: city.name, coordinates: city.coordinates,continent: randomContinent };
  };
