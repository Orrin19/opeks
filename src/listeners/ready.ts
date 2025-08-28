import { Client } from 'discord.js';
import { Commands } from '../commands/Commands';

export default (client: Client): void => {
  client.on('clientReady', async () => {
    if (!client.user || !client.application) {
      return;
    }

    await client.application.commands.set(Commands);

    console.log(`${client.user.username} is online`);
  });
};
