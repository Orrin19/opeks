import Discord from 'discord.js';
import { TextParser } from '../TextParser';
import { getRandomInt } from '../../custom/commonFunctions';

export const RandomEmoji: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => {
    return getRandomInt(200) == 50 && !message.author.bot;
  },
  run: (message: Discord.Message, client: Discord.Client) => {
    const emoji = message.guild?.emojis.cache.random() as Discord.GuildEmoji;
    if (getRandomInt(2) == 1) {
      (message.channel as Discord.TextChannel)?.send(
        `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`
      );
    } else {
      message.react(emoji).catch(console.error);
    }
  },
};
