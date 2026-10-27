import path from 'node:path';
import dotenv from 'dotenv';
import {
  DEFAULT_ACTIVITY_NAME,
  DEFAULT_ACTIVITY_TYPE,
  DEFAULT_HOSTING,
  DEFAULT_LINE_COLOR,
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_OPENROUTER_URL,
} from './constants';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Config {
  token: string;
  lineColor: number;
  activityName: string;
  activityType: number;
  hosting: string;
  openRouterApiKey?: string;
  openRouterUrl: string;
  openRouterModel: string;
  sauceToken?: string;
  logLevel: LogLevel;
}

const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

const readString = (key: string): string | undefined => {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : undefined;
};

const readRequiredString = (key: string): string => {
  const value = readString(key);
  if (value === undefined) {
    throw new Error(`Missing required environment variable "${key}" in .env`);
  }
  return value;
};

const readNumber = (key: string): number | undefined => {
  const value = readString(key);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable "${key}" must be a number, got "${value}"`);
  }
  return parsed;
};

const readColor = (key: string, fallback: number): number => {
  const value = readString(key);
  if (value === undefined) return fallback;
  const normalized = value.toLowerCase();
  const parsed = normalized.startsWith('0x') ? parseInt(normalized, 16) : Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable "${key}" must be a HEX or decimal color, got "${value}"`);
  }
  return parsed;
};

const readLogLevel = (key: string, fallback: LogLevel): LogLevel => {
  const value = readString(key);
  if (value === undefined) return fallback;
  if (!LOG_LEVELS.includes(value as LogLevel)) {
    throw new Error(
      `Environment variable "${key}" must be one of ${LOG_LEVELS.join(', ')}, got "${value}"`,
    );
  }
  return value as LogLevel;
};

export const loadConfig = (): Config => ({
  token: readRequiredString('TOKEN'),
  lineColor: readColor('LINE_COLOR', DEFAULT_LINE_COLOR),
  activityName: readString('ACTIVITY_NAME') ?? DEFAULT_ACTIVITY_NAME,
  activityType: readNumber('ACTIVITY_TYPE') ?? DEFAULT_ACTIVITY_TYPE,
  hosting: readString('HOSTING') ?? DEFAULT_HOSTING,
  openRouterApiKey: readString('OPENROUTER_API_KEY'),
  openRouterUrl: readString('OPENROUTER_URL') ?? DEFAULT_OPENROUTER_URL,
  openRouterModel: readString('OPENROUTER_MODEL') ?? DEFAULT_OPENROUTER_MODEL,
  sauceToken: readString('SAUCE_TOKEN'),
  logLevel: readLogLevel('LOG_LEVEL', 'info'),
});
