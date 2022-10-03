import Discord from 'discord.js';
import { Command } from '../Command';
import { getRandomInt } from '../custom/commonFunctions';

export const Dice: Command = {
  name: 'dice',
  description: 'Бросает кубики.',
  options: [
    {
      name: 'количество',
      type: Discord.ApplicationCommandOptionType.Integer,
      description: 'Количество бросаемых кубиков.',
      required: false,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const amount =
      (interaction.options.get('количество', false)?.value as number) || 1;
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
