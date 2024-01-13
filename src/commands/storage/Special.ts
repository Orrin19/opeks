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
  options: [
    {
      name: 'importance',
      nameLocalizations: {
        ru: 'значимость',
        uk: 'значущiсть',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Character importance',
      descriptionLocalizations: {
        ru: 'Важность персонажа',
        uk: 'Важність персонажа',
      },
      choices: [
        {
          name: 'NPC',
          nameLocalizations: { ru: 'NPC', uk: 'NPC' },
          value: 'low',
        },
        {
          name: 'Standart',
          nameLocalizations: { ru: 'Стандартная', uk: 'Стандартна' },
          value: 'medium',
        },
        {
          name: 'Main character',
          nameLocalizations: { ru: 'Главный герой', uk: 'Головний герой' },
          value: 'high',
        },
      ],
      required: false,
    },
    {
      name: 'main',
      nameLocalizations: {
        ru: 'основной',
        uk: 'основний',
      },
      type: Discord.ApplicationCommandOptionType.Integer,
      description: 'Main skill to be increased',
      descriptionLocalizations: {
        ru: 'Основной навык, который будет увеличен',
        uk: 'Основний навiк, який буде підвищен',
      },
      choices: [
        {
          name: 'Strength',
          nameLocalizations: { ru: 'Сила', uk: 'Сила' },
          value: 1,
        },
        {
          name: 'Perception',
          nameLocalizations: { ru: 'Восприятие', uk: 'Сприйняття' },
          value: 2,
        },
        {
          name: 'Endurance',
          nameLocalizations: { ru: 'Выносливость', uk: 'Витривалість' },
          value: 3,
        },
        {
          name: 'Charisma',
          nameLocalizations: { ru: 'Харизма', uk: 'Харизма' },
          value: 4,
        },
        {
          name: 'Intelligence',
          nameLocalizations: { ru: 'Интеллект', uk: 'Iнтелект' },
          value: 5,
        },
        {
          name: 'Agility',
          nameLocalizations: { ru: 'Ловкость', uk: 'Спритність' },
          value: 6,
        },
        {
          name: 'Luck',
          nameLocalizations: { ru: 'Удача', uk: 'Удача' },
          value: 7,
        },
      ],
      required: false,
    },
  ],
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const importance: string =
      (interaction.options.get('importance', false)?.value as string) ||
      'medium';
    const mainSkill: number[] = [
      ((interaction.options.get('main', false)?.value as number) || 0) - 1,
      0,
    ];
    let pointsRange: number[] = new Array(6).fill(0),
      mean: number = 5;
    switch (importance) {
      case 'low':
        pointsRange = [20, 21, 22, 23, 24, 25];
        mean = 3;
        if (mainSkill[0] >= 0) mainSkill[1] = 5;
        break;
      case 'medium':
        pointsRange = [35, 36, 37, 38, 39, 40];
        mean = 5;
        if (mainSkill[0] >= 0) mainSkill[1] = 8;
        break;
      case 'high':
        pointsRange = [45, 46, 47, 48, 49, 50];
        mean = 7;
        if (mainSkill[0] >= 0) mainSkill[1] = 10;
    }

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

    const distribution = gaussian(mean, 4);
    let values = new Array(specials.length).fill(0);
    while (
      !pointsRange.includes(sum(values)) ||
      values.filter((v) => v < 1).length > 0 ||
      values.filter((v) => v > 10).length > 0 ||
      (mainSkill[0] >= 0 && values[mainSkill[0]] < mainSkill[1])
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
