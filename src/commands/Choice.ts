import type { ChatInputCommandInteraction } from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import { buildChoiceOptions } from './options';
import { pick } from '../utils/random';

const OPTION_COUNT = 10;

export class ChoiceCommand extends ChatInputCommand {
  readonly name = 'choice';
  readonly description = 'Chooses a random option';
  readonly descriptionLocalizations = {
    ru: 'Выбирает случайный вариант',
    uk: 'Вибирає випадковий варіант',
  };
  readonly options = buildChoiceOptions(OPTION_COUNT);

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const variables: string[] = [];
    for (let i = 1; i <= OPTION_COUNT; i++) {
      const option = interaction.options.getString(`option_${i}`);
      if (option) variables.push(option);
    }
    await interaction.followUp({ content: pick(variables) });
  }
}
