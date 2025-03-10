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

    ARB_RPC: Joi.string().required(),
    BERA_RPC: Joi.string().required(),
    A8_RPC: Joi.string().required(),
    METIS_RPC: Joi.string().required(),

    PASSPHRASE: Joi.string().required(),

    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_HOST: Joi.string().default("localhost"),

    REDIS_PASSWORD: Joi.string().required(),
    REDIS_HOST: Joi.string().default("localhost"),

    ROOT_ADMIN_API_SECRET: Joi.string().required(),
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
  keys: {
    passphrase: envVars.PASSPHRASE,
    rootAdminApiSecret: envVars.ROOT_ADMIN_API_SECRET,
  },
  postgres: {
    username: envVars.POSTGRES_USER,
    password: envVars.POSTGRES_PASSWORD,
    host: envVars.POSTGRES_HOST,
  },
  redis: {
    host: envVars.REDIS_HOST,
    password: envVars.REDIS_PASSWORD
  },
  web3: {
    arbRpc: envVars.ARB_RPC,
    beraRpc: envVars.BERA_RPC,
    a8Rpc: envVars.A8_RPC,
    metisRpc: envVars.METIS_RPC
  },
};
