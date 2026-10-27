import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import gaussian from 'gaussian';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';

const SPECIALS = [
  ':muscle: Сила:',
  ':eyes: Восприятие:',
  ':man_running: Выносливость:',
  ':sunglasses: Харизма:',
  ':brain: Интеллект:',
  ':cartwheel: Ловкость:',
  ':unicorn: Удача:',
] as const;

type Importance = 'low' | 'medium' | 'high';

interface ImportanceConfig {
  pointsRange: number[];
  mean: number;
  mainBonus: number;
}

const IMPORTANCES: Record<Importance, ImportanceConfig> = {
  low: { pointsRange: [20, 21, 22, 23, 24, 25], mean: 3, mainBonus: 5 },
  medium: { pointsRange: [35, 36, 37, 38, 39, 40], mean: 5, mainBonus: 8 },
  high: { pointsRange: [45, 46, 47, 48, 49, 50], mean: 7, mainBonus: 10 },
};

const VARIANCE = 4;
const MAX_ATTEMPTS = 10_000;

const sum = (values: number[]): number =>
  values.reduce((acc, value) => acc + value, 0);

const generateValues = (
  mean: number,
  pointsRange: number[],
  mainIndex: number,
  minMain: number,
): number[] => {
  const distribution = gaussian(mean, VARIANCE);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const values = distribution
      .random(SPECIALS.length)
      .map((value) => Math.round(value));
    const isValid =
      pointsRange.includes(sum(values)) &&
      values.every((value) => value >= 1 && value <= 10) &&
      (mainIndex < 0 || values[mainIndex] >= minMain);
    if (isValid) return values;
  }

  // Safety net: return a clamped distribution instead of looping forever.
  return distribution
    .random(SPECIALS.length)
    .map((value) => Math.max(1, Math.min(10, Math.round(value))));
};

export class SpecialCommand extends ChatInputCommand {
  readonly name = 'special';
  readonly description = 'Generates a character characteristic a la Fallout';
  readonly descriptionLocalizations = {
    ru: 'Генерирует характеристику персонажа а-ля Fallout',
    uk: 'Генерує характеристику персонажа а-ля Fallout',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'importance',
      nameLocalizations: { ru: 'значимость', uk: 'значущiсть' },
      type: ApplicationCommandOptionType.String,
      description: 'Character importance',
      descriptionLocalizations: {
        ru: 'Важность персонажа',
        uk: 'Важність персонажа',
      },
      choices: [
        { name: 'NPC', nameLocalizations: { ru: 'NPC', uk: 'NPC' }, value: 'low' },
        { name: 'Standart', nameLocalizations: { ru: 'Стандартная', uk: 'Стандартна' }, value: 'medium' },
        { name: 'Main character', nameLocalizations: { ru: 'Главный герой', uk: 'Головний герой' }, value: 'high' },
      ],
      required: false,
    },
    {
      name: 'main',
      nameLocalizations: { ru: 'основной', uk: 'основний' },
      type: ApplicationCommandOptionType.Integer,
      description: 'Main skill to be increased',
      descriptionLocalizations: {
        ru: 'Основной навык, который будет увеличен',
        uk: 'Основний навiк, який буде підвищен',
      },
      choices: [
        { name: 'Strength', nameLocalizations: { ru: 'Сила', uk: 'Сила' }, value: 1 },
        { name: 'Perception', nameLocalizations: { ru: 'Восприятие', uk: 'Сприйняття' }, value: 2 },
        { name: 'Endurance', nameLocalizations: { ru: 'Выносливость', uk: 'Витривалість' }, value: 3 },
        { name: 'Charisma', nameLocalizations: { ru: 'Харизма', uk: 'Харизма' }, value: 4 },
        { name: 'Intelligence', nameLocalizations: { ru: 'Интеллект', uk: 'Iнтелект' }, value: 5 },
        { name: 'Agility', nameLocalizations: { ru: 'Ловкость', uk: 'Спритність' }, value: 6 },
        { name: 'Luck', nameLocalizations: { ru: 'Удача', uk: 'Удача' }, value: 7 },
      ],
      required: false,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const importance = (interaction.options.getString('importance') ??
      'medium') as Importance;
    const mainOption = interaction.options.getInteger('main');
    const mainIndex = mainOption !== null ? mainOption - 1 : -1;

    const config = IMPORTANCES[importance];
    const minMain = mainIndex >= 0 ? config.mainBonus : 0;
    const values = generateValues(config.mean, config.pointsRange, mainIndex, minMain);

    const specialEmbed = {
      color: this.ctx.config.lineColor,
      title: 'S.P.E.C.I.A.L.',
      description: 'Случайная характеристика для вашего персонажа',
      fields: SPECIALS.map((name, index) => ({
        name,
        value: `**${values[index]}**`,
      })),
      footer: buildFooter(interaction.client),
    };

    await interaction.followUp({ embeds: [specialEmbed] });
  }
}
