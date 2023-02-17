import Discord from 'discord.js';
import { Parsers } from '../Parsers';

export default (client: Discord.Client): void => {
  client.on('messageCreate', async (message: Discord.Message) => {
    Parsers.forEach((parser) => {
      if (parser.check(message, client)) {
        parser.run(message, client);
      }
    });
  });
};
