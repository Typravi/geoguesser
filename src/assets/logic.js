
export function calculateDistance(guess, corr) {
  const A = guess.x - corr.x;
  const B = guess.y - corr.y;
  return Math.hypot(A, B);
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

