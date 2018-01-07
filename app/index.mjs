/* eslint callback-return: 0, require-await: 0 */
import Koa from 'koa';
import Router from 'koa-router';
import randomstring from 'randomstring';
import { PORT } from './config';
import Parser from './Parser';

const parser = new Parser();

const app = new Koa();
const appRouter = new Router();
const apiRouter = new Router();

app.proxy = true;

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const errorTime = Date.now();
    if (!error.expose) {
      console.error(errorTime);
      console.error(error);
    }
    const errorCode = (error.expose && error.statusCode) ? error.statusCode : 500;
    const errorMessage = (error.expose && error.message) ?
      error.message :
      (errorCode === 500 ? 'Internal server error' : 'Unknown error');
    ctx.status = errorCode;
    ctx.body = {
      error: true,
      errorCode,
      errorMessage,
      errorTime,
    };
  }
});

apiRouter.get('/health', async (ctx) => {
  ctx.body = 'healthy';
});

apiRouter.get('/validate', async (ctx) => {
  const { input } = ctx.query;
  try {
    parser.parse(input);
  } catch (error) {
    if (error.statusCode === 400 && error.expose) {
      ctx.body = {
        errorMessage: error.message,
        valid: false,
      };
      return;
    } else {
      throw error;
    }
  }
  ctx.body = {
    input,
    valid: true,
  };
});

apiRouter.get('/stats', async (ctx) => {
  const { input } = ctx.query;
  const { stats } = parser.parse(input);
  ctx.body = {
    input,
    stats,
  };
});

apiRouter.get('/roll', async (ctx) => {
  const { input, seed = randomstring.generate() } = ctx.query;
  ctx.body = {
    input,
    result: parser.parse(input).roll(seed),
    seed,
  };
});

appRouter.use('/v1', apiRouter.routes());
appRouter.use('/v1', apiRouter.allowedMethods());

app.use(appRouter.routes());
app.use(appRouter.allowedMethods());

app.listen(PORT, () => console.info(`Server listening on port ${PORT}`));
