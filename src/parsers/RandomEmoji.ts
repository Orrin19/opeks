import type { Message } from 'discord.js';
import { TextParser } from '../structures/TextParser';
import { chance, getRandomInt } from '../utils/random';

export class RandomEmojiParser extends TextParser {
  matches(message: Message): boolean {
    return getRandomInt(0, 199) === 50 && !message.author.bot;
  }

  async run(message: Message): Promise<void> {
    const emoji = message.guild?.emojis.cache.random();
    if (!emoji) return;

    if (chance(50)) {
      const channel = message.channel;
      if (channel.isSendable()) {
        await channel.send(`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`);
      }
    } else {
      await message.react(emoji);
    }
  }
}
