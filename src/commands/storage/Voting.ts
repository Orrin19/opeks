import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../../custom/Footer';
import config from '../../config';

export const Voting: Command = {
  name: 'voting',
  description: 'Creates a vote',
  descriptionLocalizations: {
    ru: 'Создаёт голосование',
    uk: 'Створює голосування',
  },
  options: [
    {
      name: 'description',
      nameLocalizations: {
        ru: 'описание',
        uk: 'опис',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Voting description',
      descriptionLocalizations: {
        ru: 'Описание голосования',
        uk: 'Опис голосування',
      },
      required: true,
    },
    {
      name: 'option_1',
      nameLocalizations: {
        ru: 'вариант_1',
        uk: 'вибiр_1',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: true,
    },
    {
      name: 'option_2',
      nameLocalizations: {
        ru: 'вариант_2',
        uk: 'вибiр_2',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'option_3',
      nameLocalizations: {
        ru: 'вариант_3',
        uk: 'вибiр_3',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'option_4',
      nameLocalizations: {
        ru: 'вариант_4',
        uk: 'вибiр_4',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'option_5',
      nameLocalizations: {
        ru: 'вариант_5',
        uk: 'вибiр_5',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'option_6',
      nameLocalizations: {
        ru: 'вариант_6',
        uk: 'вибiр_6',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'option_7',
      nameLocalizations: {
        ru: 'вариант_7',
        uk: 'вибiр_7',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'option_8',
      nameLocalizations: {
        ru: 'вариант_8',
        uk: 'вибiр_8',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'option_9',
      nameLocalizations: {
        ru: 'вариант_9',
        uk: 'вибiр_9',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'option_10',
      nameLocalizations: {
        ru: 'вариант_10',
        uk: 'вибiр_10',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: false,
    },
    {
      name: 'image',
      nameLocalizations: {
        ru: 'изображение',
        uk: 'зображення',
      },
      type: Discord.ApplicationCommandOptionType.Attachment,
      description: 'Image for a voting',
      descriptionLocalizations: {
        ru: 'Изображение для голосования',
        uk: 'Зображення голосування',
      },
      required: false,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  runChatInput: async (
    client: Discord.Client,
    interaction: Discord.ChatInputCommandInteraction
  ) => {
    const buttons = [
      '1️⃣',
      '2️⃣',
      '3️⃣',
      '4️⃣',
      '5️⃣',
      '6️⃣',
      '7️⃣',
      '8️⃣',
      '9️⃣',
      '0️⃣',
    ];

    const description = interaction.options.getString('description', true);
    const image = interaction.options.getAttachment('image');

    const variables = Array.from({ length: 10 }, (_, i) => {
      const option = interaction.options.getString(`option_${i + 1}`);
      return option ? `${buttons[i]} ${option}` : null;
    }).filter(Boolean) as string[];

    const rollEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title: 'Голосование',
      description: description,
      fields:
        variables.length > 0
          ? [
              {
                name: 'Варианты',
                value: variables.join('\n'),
              },
            ]
          : [],
      footer: new Footer(interaction),
    };

    if (image) rollEmbed.image = { url: image.url };

    const msg = await interaction.followUp({ embeds: [rollEmbed] });

    for (let i = 0; i < variables.length; i++) {
      await msg.react(buttons[i]);
    }
  },
};
