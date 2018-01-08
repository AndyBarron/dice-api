
/* description: Parses and executes mathematical expressions. */

/* lexical grammar */
%lex
%options case-insensitive
%%

\s+ /* skip whitespace */
(\d+"."?|"."\d+|\d+"."\d+)\b return 'NUMBER'
\d*\s*"d"\s*(0*[1-9]\d*) return 'ROLL'
"max"|"min" return 'FUNCTION'
"," return ','
"*" return '*'
"/" return '/'
"-" return '-'
"+" return '+'
"(" return '('
")" return ')'
<<EOF>> return 'EOF'

/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
  : e EOF
    { return $1; }
  ;

params
  : e
    {{
      $$ = [$1];
    }}
  | params ',' e
    {{
      $$ = [...$1, $3];
    }}
  ;

e
  : e '+' e
    {{
      $$ = {
        kind: 'ADD',
        left: $1,
        right: $3,
      };
    }}
  | e '-' e
    {{
      $$ = {
        kind: 'SUB',
        left: $1,
        right: $3,
      };
    }}
  | e '*' e
    {{
      $$ = {
        kind: 'MUL',
        left: $1,
        right: $3,
      };
    }}
  | e '/' e
    {{
      $$ = {
        kind: 'DIV',
        left: $1,
        right: $3,
      };
    }}
  | '-' e %prec UMINUS
    {{
      $$ = {
        kind: 'NEG',
        inner: $2,
      };
    }}
  | '(' e ')'
    {{
      $$ = {
        kind: 'PARENS',
        inner: $2,
      };
    }}
  | NUMBER
    {{
      $$ = {
        kind: 'NUMBER',
        value: Number(yytext),
      };
    }}
  | ROLL
    {{
      const clean = yytext.replace(/\s+/, '');
      const [ countString, sidesString ] = clean.split(/[dD]/);
      $$ = {
        kind: 'ROLL',
        count: countString ? Number(countString) : 1,
        sides: Number(sidesString),
      };
    }}
  | FUNCTION '(' params ')'
    {{
      $$ = {
        kind: 'FUNCTION',
        name: $1.toLowerCase(),
        params: $3,
      };
    }}
  ;
