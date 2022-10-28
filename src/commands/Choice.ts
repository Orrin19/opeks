import Discord from 'discord.js';
import { Command } from '../Command';
import { getRandArrElement } from '../custom/commonFunctions';

export const Choice: Command = {
  name: 'choice',
  description: 'Chooses a random option',
  descriptionLocalizations: {
    ru: 'Выбирает случайный вариант',
    uk: 'Вибирає випадковий варіант',
  },
  options: [
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
    const variables = new Array<string>();
    variables.push(interaction.options.get('option_1', true)?.value as string);
    for (let i = 2; i < 11; i++) {
      if (!interaction.options.get('option_' + i, false)?.value) break;
      variables.push(
        interaction.options.get('option_' + i, false)?.value as string
      );
    }
    await interaction.followUp({
      content: getRandArrElement(variables),
    });
  },
};
