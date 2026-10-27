import {
  ApplicationCommandType,
  type Interaction,
  type UserApplicationCommandData,
  type UserContextMenuCommandInteraction,
} from 'discord.js';
import { Command } from './Command';
import type { Logger } from '../core/Logger';

export abstract class UserContextCommand extends Command {
  readonly type: ApplicationCommandType.User = ApplicationCommandType.User;

  abstract run(interaction: UserContextMenuCommandInteraction): Promise<void>;

  toJSON(): UserApplicationCommandData {
    return { name: this.name, type: this.type };
  }

  async execute(interaction: Interaction, logger: Logger): Promise<void> {
    if (!interaction.isUserContextMenuCommand()) return;

    try {
      await this.run(interaction);
    } catch (error) {
      logger.error(`Context command "${this.name}" failed:`, error);
      await interaction
        .editReply({ content: 'Произошла ошибка при выполнении команды' })
        .catch(() => undefined);
    }
  }
}
