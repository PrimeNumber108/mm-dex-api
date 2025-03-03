import * as dotenv from 'dotenv';
import * as Joi from 'joi';
dotenv.config();

export const isLocal = process.env.NODE_ENV === 'local';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test', 'local', 'staging')
      .required(),
    PORT: Joi.number().default(3000),
    WORKER_PORT: Joi.number().default(3001),

    POSTGRES_URL: Joi.string().required(),

    REDIS_URL: Joi.string().required(),

    BERA_RPC: Joi.string().required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error != null) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const env = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  workerPort: envVars.WORKER_PORT,

  postgres: {
    url: envVars.POSTGRES_URL,
    testUrl: envVars.POSTGRES_URL + '_test',
    testDbName: 'test',
  },
  redis: {
    url: envVars.REDIS_URL,
  },
  web3: {
    beraRpc: envVars.BERA_RPC,
  },
};
