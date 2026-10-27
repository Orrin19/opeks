import { loadConfig } from './config/env';
import { Logger } from './core/Logger';
import { createClient } from './core/ClientFactory';
import type { AppContext } from './core/AppContext';
import { createServices } from './services';
import { createCommands } from './commands';
import { createParsers } from './parsers';
import { createListeners } from './listeners';
import { registerListener } from './structures/Listener';

const bootstrap = async (): Promise<void> => {
  const config = loadConfig();
  const logger = new Logger(config.logLevel);
  const client = createClient(config);

  const services = createServices(config, logger);
  const ctx: AppContext = { config, logger, services };

  const commands = createCommands(ctx);
  const parsers = createParsers(ctx);
  const listeners = createListeners(commands, parsers, ctx);

  for (const listener of listeners) {
    registerListener(client, listener);
  }

  await client.login(config.token);
};

void bootstrap().catch((error) => {
  console.error('Failed to start the bot:', error);
  process.exit(1);
});
