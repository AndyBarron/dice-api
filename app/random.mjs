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
  return Math.floor(generateRandomNumber(Math.ceil(min), Math.floor(max), seed));
};
