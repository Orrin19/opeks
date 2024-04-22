import Discord from 'discord.js';
import gaussian from 'gaussian';
import { Command } from '../Command';
import { Footer } from '../../custom/Footer';
import config from '../../config';

export const Special: Command = {
  name: 'special',
  description: 'Generates a character characteristic a la Fallout',
  descriptionLocalizations: {
    ru: 'Генерирует характеристику персонажа а-ля Fallout',
    uk: 'Генерує характеристику персонажа а-ля Fallout',
  },
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const specialEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title: 'S.P.E.C.I.A.L.',
      description: 'Случайная характеристика для вашего персонажа',
      fields: [],
      footer: new Footer(interaction),
    };

    const sum = (array: number[]) => array.reduce((a, b) => a + b, 0);

    const specials = [
      ':muscle: Сила:',
      ':eyes: Восприятие:',
      ':man_running: Выносливость:',
      ':sunglasses: Харизма:',
      ':brain: Интеллект:',
      ':cartwheel: Ловкость:',
      ':unicorn: Удача:',
    ];

    const distribution = gaussian(5, 4);
    let values = new Array(specials.length).fill(0);
    while (
      sum(values) < 35 ||
      sum(values) > 40 ||
      values.find((v) => v < 1) ||
      values.find((v) => v > 10)
    ) {
      values = distribution
        .random(specials.length)
        .map((x: number) => Math.round(x));
    }

    const specialMap = new Map(
      specials.map((key, index) => [key, values[index]])
    );

    for (const [spec, value] of specialMap) {
      specialEmbed.fields?.push({
        name: spec as string,
        value: `**${value}**`,
      });
    }

    interaction.followUp({
      embeds: [specialEmbed],
    });
  },
};
