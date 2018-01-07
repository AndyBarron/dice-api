import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

const get = (name) => {
  const value = process.env[name]; // eslint-disable-line no-process-env
  if (!value) {
    throw new Error(`Missing required environment variable: "${name}"`);
  }
  return value;
};

export const PORT = get('PORT');
assert(1 <= PORT && PORT <= 65535);
