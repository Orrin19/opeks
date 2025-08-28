import Discord from 'discord.js';
import { Command } from '../Command';
import { getRandArrElement } from '../../custom/commonFunctions';

export const Rps: Command = {
  name: 'rps',
  description: 'A rock-paper-scissors game!',
  descriptionLocalizations: {
    ru: 'Игра камень-ножницы-бумага!',
    uk: 'Гра камінь-ножиці-папір!',
  },
  options: [
    {
      name: 'gesture',
      nameLocalizations: {
        ru: 'жест',
        uk: 'жест',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Your move!',
      descriptionLocalizations: {
        ru: 'Твой ход!',
        uk: 'Твій хід!',
      },
      required: true,
      choices: [
        {
          name: 'rock',
          nameLocalizations: {
            ru: 'камень',
            uk: 'камінь',
          },
          value: 'камень',
        },
        {
          name: 'paper',
          nameLocalizations: {
            ru: 'бумага',
            uk: 'папір',
          },
          value: 'бумага',
        },
        {
          name: 'scissors',
          nameLocalizations: {
            ru: 'ножницы',
            uk: 'ножиці',
          },
          value: 'ножницы',
        },
      ],
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  runChatInput: async (
    client: Discord.Client,
    interaction: Discord.ChatInputCommandInteraction
  ) => {
    const gesture = interaction.options.getString('gesture', true);
    const botGesture = getRandArrElement(['камень', 'бумага', 'ножницы']);
    if (gesture == botGesture) {
      const answers = [
        `У тебя ${gesture}, и у меня ${botGesture}... Ничья!`,
        `Боевая ничья! У нас обоих ${gesture}!`,
        `У нас с тобой ${gesture}... Ничья?`,
      ];
      await interaction.followUp(getRandArrElement(answers));
      return;
    }
    if (
      (gesture == 'камень' && botGesture == 'ножницы') ||
      (gesture == 'ножницы' && botGesture == 'бумага') ||
      (gesture == 'бумага' && botGesture == 'камень')
    ) {
      const answers = [
        `У тебя ${gesture}, а у меня ${botGesture}... Твоя взяла!`,
        `Ты победил! У тебя ${gesture}, а у меня ${botGesture}. Но в следующий раз...`,
        `Подожди, это ${gesture}? Похоже, ты победил, у меня ${botGesture}!`,
      ];
      await interaction.followUp(getRandArrElement(answers));
      return;
    }
    if (
      (gesture == 'камень' && botGesture == 'бумага') ||
      (gesture == 'ножницы' && botGesture == 'камень') ||
      (gesture == 'бумага' && botGesture == 'ножницы')
    ) {
      const answers = [
        `У тебя ${gesture}, а у меня ${botGesture}! Я победил!`,
        `Я победил! У тебя ${gesture}, а у меня ${botGesture}. Ничего, потом повезёт.`,
        `Подожди, это ${gesture}? О-хо-хо, а у меня ${botGesture}! Выкуси!`,
      ];
      await interaction.followUp(getRandArrElement(answers));
      return;
    }
  },
};
