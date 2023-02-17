import Discord from 'discord.js';
import { TextParser } from '../TextParser';
import { PassThrough } from 'stream';

export const ReactTrigger: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => {
    const reactions = new Map()
      .set('kiddy blade', 'MuraAngry')
      .set('суидал', 'suidal')
      .set('верд', 'coolStoryBob');
    reactions.forEach((emojiName, trigger) => {
      if (message.content.toLowerCase().includes(trigger)) {
        const emoji = (
          client.guilds.cache.find(
            (g) => g.id == '461757596236382229'
          ) as Discord.Guild
        ).emojis.cache.find((e) => e.name == emojiName) as Discord.GuildEmoji;
        message.react(emoji).catch(console.error);
      }
    });
    return false;
  },
  run: (message: Discord.Message, client: Discord.Client) => {},
};
