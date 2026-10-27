import {
  ApplicationCommandType,
  type Interaction,
  type MessageApplicationCommandData,
  type MessageContextMenuCommandInteraction,
} from 'discord.js';
import { Command } from './Command';
import type { Logger } from '../core/Logger';

export abstract class MessageContextCommand extends Command {
  readonly type: ApplicationCommandType.Message = ApplicationCommandType.Message;

  abstract run(interaction: MessageContextMenuCommandInteraction): Promise<void>;

  toJSON(): MessageApplicationCommandData {
    return { name: this.name, type: this.type };
  }

  async execute(interaction: Interaction, logger: Logger): Promise<void> {
    if (!interaction.isMessageContextMenuCommand()) return;

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
