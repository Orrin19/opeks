import Discord from 'discord.js';
import { TextParser } from '../TextParser';
import { TriggerWords } from '../triggers/TriggerWords';
import { getRandomInt } from '../../custom/commonFunctions';

export const ReactTrigger: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => true,
  run: (message: Discord.Message, client: Discord.Client) => {
    TriggerWords.forEach((word) => {
      if (
        word.trigger.test(message.content) &&
        getRandomInt(100) < word.chance
      ) {
        const emoji = (
          client.guilds.cache.find(
            (g) => g.id == '461757596236382229'
          ) as Discord.Guild
        ).emojis.cache.find(
          (e) => e.name == word.emojiName
        ) as Discord.GuildEmoji;
        message.react(emoji).catch(console.error);
      }
    });
  },
};
