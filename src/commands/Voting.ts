import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';
import { maxHeaderSize } from 'http';

export const Voting: Command = {
  name: 'voting',
  description: 'Создаёт голосование.',
  options: [
    {
      name: 'описание',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Описание голосования.',
      required: true,
    },
    {
      name: 'вариант_1',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: true,
    },
    {
      name: 'вариант_2',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: false,
    },
    {
      name: 'вариант_3',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: false,
    },
    {
      name: 'вариант_4',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: false,
    },
    {
      name: 'вариант_5',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: false,
    },
    {
      name: 'вариант_6',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: false,
    },
    {
      name: 'вариант_7',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: false,
    },
    {
      name: 'вариант_8',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: false,
    },
    {
      name: 'вариант_9',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
      required: false,
    },
    {
      name: 'вариант_10',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Один из вариантов.',
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
    const description = interaction.options.get('описание', true)
      ?.value as string;
    const variables = new Array<string>();
    variables.push(
      (buttons[0] +
        ' ' +
        interaction.options.get('вариант_1', true)?.value) as string
    );
    for (let i = 2; i < 11; i++) {
      if (!interaction.options.get('вариант_' + i, false)?.value) break;
      variables.push(
        (buttons[i - 1] +
          ' ' +
          interaction.options.get('вариант_' + i, false)?.value) as string
      );
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
