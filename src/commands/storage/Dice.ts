import Discord from 'discord.js';
import { Command } from '../Command';
import { getRandomInt } from '../../custom/commonFunctions';

export const Dice: Command = {
  name: 'dice',
  description: 'Rolls the specified number of dice',
  descriptionLocalizations: {
    ru: 'Бросает указанное количество кубиков',
    uk: 'Кидає зазначену кількість кубиків',
  },
  options: [
    {
      name: 'amount',
      nameLocalizations: {
        ru: 'количество',
        uk: 'кiлькiсть',
      },
      type: Discord.ApplicationCommandOptionType.Integer,
      description: 'Amount of dice to be thrown',
      descriptionLocalizations: {
        ru: 'Количество бросаемых кубиков',
        uk: 'Кількість кубиків, що кидаються',
      },
      required: false,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const amount =
      (interaction.options.get('amount', false)?.value as number) || 1;
    if (amount > 100)
      return interaction.followUp({
        ephemeral: true,
        content: 'Нет у меня столько кубиков)',
      });
    const dices = [
      null,
      ':one:',
      ':two:',
      ':three:',
      ':four:',
      ':five:',
      ':six:',
    ];
    let result;

    if (amount == 1) {
      result = getRandomInt(6) + 1;
      return interaction.followUp(`Брошен кубик. Результат: ${dices[result]}`);
    }

    let sum = 0;
    let results = new Array(amount);
    for (let i = 0; i < results.length; i++) {
      result = getRandomInt(6) + 1;
      sum += result;
      results[i] = dices[result];
    }
    return interaction.followUp(
      `Брошено кубиков: ${amount}\nРезультаты: ${results.join(
        ' '
      )}\nСумма: ${sum}`
    );
  },
};
