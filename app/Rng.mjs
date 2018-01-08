import assert from 'assert';
import randomstring from 'randomstring';
import seedrandom from 'seedrandom';

export default class Rng {
  static fromSeed(seed) {
    return new Rng(seed);
  }
  static withRandomSeed() {
    return new Rng(randomstring.generate());
  }
  static fromOptionalSeed(seed) {
    return seed === undefined ? this.withRandomSeed() : this.fromSeed(seed);
  }
  constructor(seed) {
    assert(typeof seed === 'string');
    this.seed = seed;
    this.generator = seedrandom(this.seed);
  }
  generateRandomNumber(min, max) {
    assert(min <= max);
    const alpha = this.generator();
    return (alpha * (max - min)) + min;
  }
  generateRandomInteger(min, max) {
    // Add 1 to max because it's exclusive in this equation. Math is hard!
    return Math.floor(this.generateRandomNumber(Math.ceil(min), Math.floor(max + 1)));
  }
}
