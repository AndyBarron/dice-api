import fs from 'fs';
import jison from 'jison';
import Expr from './Expr';

const GRAMMAR = fs.readFileSync('grammar.jison', 'utf8'); // eslint-disable-line no-sync

export default class Parser {
  constructor() {
    this.jisonParser = new jison.Parser(GRAMMAR);
  }
  parse(input) {
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
