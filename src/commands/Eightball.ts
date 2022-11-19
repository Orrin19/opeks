import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import { getRandomInt } from '../custom/commonFunctions';
import config from '../config';

export const Eightball: Command = {
  name: '8ball',
  description: 'Asks 8ball for an answer',
  descriptionLocalizations: {
    ru: 'Спрашивает ответ у 8ball',
    uk: 'Запитує відповідь у 8ball',
  },
  options: [
    {
      name: 'question',
      nameLocalizations: {
        ru: 'вопрос',
        uk: 'питання',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Ask your question',
      descriptionLocalizations: {
        ru: 'Задайте свой вопрос',
        uk: 'Поставте своє питання',
      },
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const question = interaction.options.get('question', true).value as string;
    const ballEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title: `Вопрос от ${interaction.member?.user.username}:`,
      description: question,
      image: {
        url: `https://raw.githubusercontent.com/Orrin19/opeks/master/assets/8ball/${getRandomInt(
          7
        )}.png`,
      },
      footer: new Footer(interaction),
    };
    interaction.followUp({
      embeds: [ballEmbed],
    });
  },
};
