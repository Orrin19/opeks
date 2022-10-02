import path from 'path';
import dotenv from 'dotenv';

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  TOKEN: string | undefined;
  HOSTING: string | undefined;
  LINE_COLOR: string | undefined;
  ACTIVITY_NAME: string | undefined;
  ACTIVITY_TYPE: string | undefined;
}

interface Config {
  TOKEN: string;
  HOSTING: string;
  LINE_COLOR: string;
  ACTIVITY_NAME: string;
  ACTIVITY_TYPE: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
  return {
    TOKEN: process.env.TOKEN,
    HOSTING: process.env.HOSTING,
    LINE_COLOR: process.env.LINE_COLOR,
    ACTIVITY_NAME: process.env.ACTIVITY_NAME,
    ACTIVITY_TYPE: process.env.ACTIVITY_TYPE,
  };
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
