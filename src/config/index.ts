import * as dotenv from 'dotenv';
import * as Joi from 'joi';
dotenv.config();

export const isLocal = process.env.NODE_ENV === 'local';

const envVarsSchema = Joi.object()
  .keys({
    EXECUTOR_ENDPOINT: Joi.string().default('https://mm-hcm.the20.sg/api'),
    EXECUTOR_USERNAME: Joi.string().required(),
    EXECUTOR_SECRET: Joi.string().required(),
    EXECUTOR_PASSPHRASE: Joi.string().required(),
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test', 'local', 'staging')
      .required(),
    PORT: Joi.number().default(3000),
    SIGNER_KEY: Joi.string().required(),


    ARB_RPC: Joi.string().required(),
    BERA_RPC: Joi.string().required(),
    A8_RPC: Joi.string().required(),
    METIS_RPC: Joi.string().required(),
    ZKSYNC_RPC: Joi.string().required(),
  

    PASSPHRASE: Joi.string().required(),

    MYSQL_USER: Joi.string().required(),
    MYSQL_PASSWORD: Joi.string().required(),
    MYSQL_HOST: Joi.string().default("localhost"),

    // REDIS_PASSWORD: Joi.string().required(),
    REDIS_PASSWORD: Joi.string().allow("").required(),
    REDIS_HOST: Joi.string().default("localhost"),

    ROOT_ADMIN_API_SECRET: Joi.string().required(),
    TRON_BASE_URL: Joi.string().default('https://api.trongrid.io'),
    NETWORK: Joi.string().valid('mainnet', 'testnet'),
    MAINNET_RPC: Joi.string().default('https://rpc.ancient8.gg'),
    TESTNET_RPC: Joi.string().default('https://rpcv2-testnet.ancient8.gg/'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error != null) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const env = {
  network: envVars.NETWORK,
  a8: {
    mainnetRpc: envVars.MAINNET_RPC,
    testnetRpc: envVars.TESTNET_RPC
  },
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  workerPort: envVars.WORKER_PORT,
  keys: {
    passphrase: envVars.PASSPHRASE,
    rootAdminApiSecret: envVars.ROOT_ADMIN_API_SECRET,
    publicKey: envVars.PUBLIC_KEY,
    privateKey: envVars.PRIVATE_KEY,
    signerKey: envVars.SIGNER_KEY

  },
  mysql: {
    username: envVars.MYSQL_USER,
    password: envVars.MYSQL_PASSWORD,
    host: envVars.MYSQL_HOST,
  },
  redis: {
    host: envVars.REDIS_HOST,
    password: envVars.REDIS_PASSWORD
  },
  web3: {
    arbRpc: envVars.ARB_RPC,
    beraRpc: envVars.BERA_RPC,
    a8Rpc: envVars.A8_RPC,
    metisRpc: envVars.METIS_RPC,
    zksyncRpc: envVars.ZKSYNC_RPC,
    tronBase: envVars.TRON_BASE_URL,

  },
  executor: {
    passphrase: envVars.EXECUTOR_PASSPHRASE,
    endPoint: envVars.EXECUTOR_ENDPOINT,
    apiSecret: envVars.EXECUTOR_SECRET,
    apiUsername: envVars.EXECUTOR_USERNAME
  },
};


