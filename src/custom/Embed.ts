import Discord from 'discord.js';
import config from '../config';

export const Embed: Discord.APIEmbed = {
  color: Number(config.LINE_COLOR),
};
