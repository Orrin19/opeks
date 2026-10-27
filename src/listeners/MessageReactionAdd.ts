import { Events, type MessageReaction, type User } from 'discord.js';
import { Listener } from '../structures/Listener';
import { USER_IDS } from '../config/constants';
import type { Logger } from '../core/Logger';

export class MessageReactionAddListener extends Listener {
  readonly event = Events.MessageReactionAdd;

  constructor(private readonly logger: Logger) {
    super();
  }

  async run(reaction: MessageReaction, user: User): Promise<void> {
    if (user.id !== USER_IDS.reactionCleanup) return;
    await reaction.users.remove(user.id).catch((error) => {
      this.logger.warn('Failed to remove reaction:', error);
    });
  }
}
