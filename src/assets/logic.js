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
