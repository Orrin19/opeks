import type { Message } from 'discord.js';
import { TextParser } from '../structures/TextParser';
import { GUILD_IDS } from '../config/constants';
import { TriggerWords } from './triggers/TriggerWords';
import { chance } from '../utils/random';

export class ReactTriggerParser extends TextParser {
  matches(_message: Message): boolean {
    return true;
  }

  async run(message: Message): Promise<void> {
    const emojiGuild = message.client.guilds.cache.get(GUILD_IDS.emojiSource);
    if (!emojiGuild) return;

    for (const word of TriggerWords) {
      if (word.trigger.test(message.content) && chance(word.chance)) {
        const emoji = emojiGuild.emojis.cache.find((e) => e.name === word.emojiName);
        if (emoji) await message.react(emoji);
      }
    }
  }
}
