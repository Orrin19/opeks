import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import { DICE_FACES, DICE_MAX_AMOUNT } from '../config/constants';
import { getRandomInt } from '../utils/random';

const DICE_FACES_EMOJI = [
  ':one:',
  ':two:',
  ':three:',
  ':four:',
  ':five:',
  ':six:',
] as const;

export class DiceCommand extends ChatInputCommand {
  readonly name = 'dice';
  readonly description = 'Rolls the specified number of dice';
  readonly descriptionLocalizations = {
    ru: 'Бросает указанное количество кубиков',
    uk: 'Кидає зазначену кількість кубиків',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'amount',
      nameLocalizations: { ru: 'количество', uk: 'кiлькiсть' },
      type: ApplicationCommandOptionType.Integer,
      description: 'Amount of dice to be thrown',
      descriptionLocalizations: {
        ru: 'Количество бросаемых кубиков',
        uk: 'Кількість кубиків, що кидаються',
      },
      required: false,
    },
  ];

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('amount') ?? 1;
    if (amount > DICE_MAX_AMOUNT) {
      await interaction.followUp({
        ephemeral: true,
        content: 'Нет у меня столько кубиков)',
      });
      return;
    }

    const rolls = Array.from({ length: amount }, () =>
      getRandomInt(1, DICE_FACES),
    );

    if (amount === 1) {
      await interaction.followUp(
        `Брошен кубик. Результат: ${DICE_FACES_EMOJI[rolls[0] - 1]}`,
      );
      return;
    }

    const sum = rolls.reduce((acc, value) => acc + value, 0);
    const results = rolls.map((roll) => DICE_FACES_EMOJI[roll - 1]).join(' ');
    await interaction.followUp(
      `Брошено кубиков: ${amount}\nРезультаты: ${results}\nСумма: ${sum}`,
    );
  }
}
