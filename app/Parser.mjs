import fs from 'fs';
import jison from 'jison';
import LRU from 'lru-cache';
import Expr from './Expr';

const GRAMMAR = fs.readFileSync('grammar.jison', 'utf8'); // eslint-disable-line no-sync
const LRU_CACHE_OPTIONS = {
  max: 1000,
};

export default class Parser {
  constructor() {
    this.jisonCache = new LRU(LRU_CACHE_OPTIONS);
    this.jisonParser = new jison.Parser(GRAMMAR);
  }
  parse(input) {
    const cacheKey = input;
    if (!this.jisonCache.has(cacheKey)) {
      try {
        const result = this.parseWithoutCache(input);
        this.jisonCache.set(cacheKey, {
          result,
          success: true,
        });
      } catch (error) {
        this.jisonCache.set(cacheKey, {
          error,
          success: false,
        });
      }
    }
    const cached = this.jisonCache.get(cacheKey);
    if (cached.success) {
      return cached.result;
    } else {
      return cached.error;
    }
  }
  parseWithoutCache(input) {
    let data;
    try {
      data = this.jisonParser.parse(input);
    } catch (error) {
      error.statusCode = 400;
      error.expose = true;
      throw error;
    }
    return new Expr(data);
  }
}
