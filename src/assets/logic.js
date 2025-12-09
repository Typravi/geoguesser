//Denna filen tänkte jag kunde innehålla logik (typ funktioner och beräkningar)
//Dessa kan sedan användas flera gånger och globalt i projektet (hurra för inte så kladdig kod)

export function calculateDistance(guess, corr) {
  // pyth sats för att beräkna avstånd mellan två punkter
  const A = guess.x - corr.x;
  const B = guess.y - corr.y;
  return Math.hypot(A, B);
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot
