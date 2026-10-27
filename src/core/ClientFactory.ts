import { ActivityType, Client, GatewayIntentBits, PresenceUpdateStatus } from 'discord.js';
import type { Config } from '../config/env';

export const createClient = (config: Config): Client =>
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
    ],
    presence: {
      status: PresenceUpdateStatus.Online,
      activities: [
        {
          name: config.activityName,
          type: config.activityType as ActivityType,
        },
      ],
    },
  });
