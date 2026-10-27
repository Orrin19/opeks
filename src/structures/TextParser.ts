import type { Message } from 'discord.js';

/** A parser that reacts to regular chat messages. */
export abstract class TextParser {
  abstract matches(message: Message): boolean;

  abstract run(message: Message): void | Promise<void>;
}
