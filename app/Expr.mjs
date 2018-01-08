import assert from 'assert';
import { generateRandomInteger } from './random';

const SYMBOL_STATS = Symbol('Expr cached stats');
const FUNCTION_NAME_SET = new Set([
  'max',
  'min',
]);

const throwFunctionNameError = (name) => {
  const error = new Error(`Unrecognized function name: "${name}"`);
  error.expose = true;
  error.statusCode = 400;
  throw error;
};

export default class Expr {
  static create(data) {
    return new Expr(data);
  }
  constructor(data) {
    this.kind = data.kind;
    switch (this.kind) {
      case 'ADD':
      case 'SUB':
      case 'MUL':
      case 'DIV':
      case 'POW':
        this.left = new Expr(data.left);
        this.right = new Expr(data.right);
        break;
      case 'NEG':
      case 'PARENS':
        this.inner = new Expr(data.inner);
        break;
      case 'NUMBER':
        this.value = data.value;
        break;
      case 'ROLL':
        this.count = data.count;
        this.sides = data.sides;
        break;
      case 'FUNCTION':
        this.name = data.name;
        this.params = data.params.map(Expr.create);
        if (!FUNCTION_NAME_SET.has(this.name)) {
          return throwFunctionNameError(this.name);
        }
        break;
      default:
        throw new Error(`Unrecognized Expr kind in constructor: "${this.kind}"`);
    }
  }
  roll(seed) {
    assert(typeof seed !== 'undefined');
    switch (this.kind) {
      case 'ADD':
        return this.left.roll(seed) + this.right.roll(seed);
      case 'SUB':
        return this.left.roll(seed) - this.right.roll(seed);
      case 'MUL':
        return this.left.roll(seed) * this.right.roll(seed);
      case 'DIV':
        return this.left.roll(seed) / this.right.roll(seed);
      case 'NEG':
        return -this.inner.roll(seed);
      case 'PARENS':
        return this.inner.roll(seed);
      case 'NUMBER':
        return this.value;
      case 'ROLL': {
        let total = 0;
        for (let i = 0; i < this.count; i++) {
          total += generateRandomInteger(1, this.sides, seed);
        }
        return total;
      }
      case 'FUNCTION': {
        switch (this.name) {
          case 'max':
            return Math.max(...this.params.map((expr) => expr.roll(seed)));
          case 'min':
            return Math.min(...this.params.map((expr) => expr.roll(seed)));
          default:
            return throwFunctionNameError(this.name);
        }
      }
      default:
        throw new Error(`Unrecognized Expr kind in roll: "${this.kind}"`);
    }
  }
  get stats() {
    if (!(SYMBOL_STATS in this)) {
      this[SYMBOL_STATS] = this.computeStats();
    }
    return this[SYMBOL_STATS];
  }
  computeStats() {
    switch (this.kind) {
      case 'ADD':
        return {
          max: this.left.stats.max + this.right.stats.max,
          min: this.left.stats.min + this.right.stats.min,
        };
      case 'SUB':
        return {
          max: this.left.stats.max - this.right.stats.min,
          min: this.left.stats.min - this.right.stats.max,
        };
      case 'MUL': { // TODO: Clean this up
        const leftMax = this.left.stats.max;
        const leftMin = this.left.stats.min;
        const rightMax = this.right.stats.max;
        const rightMin = this.right.stats.min;
        const possible = [
          leftMax * rightMax,
          leftMax * rightMin,
          leftMin * rightMax,
          leftMin * rightMin,
        ];
        return {
          max: Math.max(...possible),
          min: Math.min(...possible),
        };
      }
      case 'DIV': { // TODO: Clean this up
        const leftMax = this.left.stats.max;
        const leftMin = this.left.stats.min;
        const rightMax = this.right.stats.max;
        const rightMin = this.right.stats.min;
        const possible = [
          leftMax / rightMax,
          leftMax / rightMin,
          leftMin / rightMax,
          leftMin / rightMin,
        ];
        return {
          max: Math.max(...possible),
          min: Math.min(...possible),
        };
      }
      case 'NEG':
        return {
          max: -this.inner.stats.min,
          min: -this.inner.stats.max,
        };
      case 'PARENS':
        return this.inner.stats;
      case 'NUMBER':
        return {
          max: this.value,
          min: this.value,
        };
      case 'ROLL':
        return {
          max: this.count * this.sides,
          min: this.count,
        };
      case 'FUNCTION': {
        switch (this.name) {
          case 'max': {
            const paramStats = this.params.map((expr) => expr.stats);
            return {
              max: Math.max(...paramStats.map((stats) => stats.max)),
              min: Math.max(...paramStats.map((stats) => stats.min)),
            };
          }
          case 'min': {
            const paramStats = this.params.map((expr) => expr.stats);
            return {
              max: Math.min(...paramStats.map((stats) => stats.max)),
              min: Math.min(...paramStats.map((stats) => stats.min)),
            };
          }
          default:
            return throwFunctionNameError(this.name);
        }
      }
      default:
        throw new Error(`Unrecognized Expr kind in computeStats: "${this.kind}"`);
    }
  }
}
