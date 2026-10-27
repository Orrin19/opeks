import {
  ApplicationCommandType,
  type ApplicationCommandOptionData,
  type ChatInputApplicationCommandData,
  type ChatInputCommandInteraction,
  type Interaction,
  type LocalizationMap,
} from 'discord.js';
import { Command } from './Command';
import type { Logger } from '../core/Logger';

export abstract class ChatInputCommand extends Command {
  readonly type: ApplicationCommandType.ChatInput = ApplicationCommandType.ChatInput;

  abstract readonly description: string;
  readonly descriptionLocalizations?: LocalizationMap;
  readonly options?: ApplicationCommandOptionData[];
  readonly defaultMemberPermissions?: bigint;

  abstract run(interaction: ChatInputCommandInteraction): Promise<void>;

  toJSON(): ChatInputApplicationCommandData {
    return {
      name: this.name,
      description: this.description,
      descriptionLocalizations: this.descriptionLocalizations,
      options: this.options,
      defaultMemberPermissions: this.defaultMemberPermissions,
      type: this.type,
    };
  }

  async execute(interaction: Interaction, logger: Logger): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    try {
      await interaction.deferReply();
    } catch (error) {
      // Transient (e.g. "Unknown interaction" when the 3s window has already
      // passed). There is nothing else to do for this interaction.
      logger.warn(`Command "/${this.name}" could not be deferred:`, error);
      return;
    }

    try {
      await this.run(interaction);
    } catch (error) {
      logger.error(`Command "/${this.name}" failed:`, error);
      await interaction
        .editReply({ content: 'Произошла ошибка при выполнении команды' })
        .catch(() => undefined);
    }
  }
}
