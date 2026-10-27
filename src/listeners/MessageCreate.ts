import { Events, type Message } from 'discord.js';
import { Listener } from '../structures/Listener';
import type { TextParser } from '../structures/TextParser';
import type { Logger } from '../core/Logger';

export class MessageCreateListener extends Listener {
  readonly event = Events.MessageCreate;

  constructor(
    private readonly parsers: readonly TextParser[],
    private readonly logger: Logger,
  ) {
    super();
  }

  async run(message: Message): Promise<void> {
    if (message.author.bot) return;

    for (const parser of this.parsers) {
      try {
        if (parser.matches(message)) await parser.run(message);
      } catch (error) {
        this.logger.warn(`Parser ${parser.constructor.name} failed:`, error);
      }
    }
  }
}
