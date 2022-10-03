import { Client, PresenceUpdateStatus } from 'discord.js';
import guildMemberAdd from './listeners/guildMemberAdd';
import interactionCreate from './listeners/interactionCreate';
import messageCreate from './listeners/messageCreate';
import ready from './listeners/ready';
import config from './config';

const token = config.TOKEN;

console.log('Bot is starting...');

const client = new Client({
  intents: [
    'Guilds',
    'GuildMessages',
    'GuildMembers',
    'GuildMessageReactions',
    'DirectMessages',
    'MessageContent',
  ],
  presence: {
    status: PresenceUpdateStatus.Online,
    activities: [
      {
        name: config.ACTIVITY_NAME,
        type: Number(config.ACTIVITY_TYPE),
      },
    ],
  },
});

ready(client);
guildMemberAdd(client);
interactionCreate(client);
messageCreate(client);

client.login(token);
