import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';

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
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
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
    const description = interaction.options.get('description', true)
      ?.value as string;
    const variables = new Array<string>();
    let j = 0;
    for (let i = 1; i < 11; i++) {
      if (interaction.options.get('option_' + i, false)?.value) {
        variables.push(
          (buttons[j] +
            ' ' +
            interaction.options.get('option_' + i, false)?.value) as string
        );
        j++;
      }
    }

    const rollEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title: 'Голосование',
      description: description,
      fields: [
        {
          name: 'Варианты',
          value: variables.join('\n'),
        },
      ],
      footer: new Footer(interaction),
    };
    interaction
      .followUp({
        embeds: [rollEmbed],
      })
      .then((msg) => {
        for (let i = 0; i < variables.length; i++) {
          msg.react(buttons[i]);
        }
      });
  },
};
