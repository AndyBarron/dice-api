import assert from 'assert';
import seedrandom from 'seedrandom';

export const generateRandomNumber = (min, max, seed) => {
  assert(min <= max);
  assert(typeof seed !== 'undefined');
  const stringSeed = JSON.stringify(seed);
  const rng = seedrandom(stringSeed);
  const alpha = rng();
  return (alpha * (max - min)) + min;
};

export const generateRandomInteger = (min, max, seed) => {
  // Add 1 to max because it's exclusive in this equation. Math is hard!
  return Math.floor(generateRandomNumber(Math.ceil(min), Math.floor(max + 1), seed));
};
