import type { Config } from '../config/env';
import type { Services } from '../services';
import type { Logger } from './Logger';

/** Shared dependencies injected into commands, parsers and listeners. */
export interface AppContext {
  config: Config;
  logger: Logger;
  services: Services;
}
