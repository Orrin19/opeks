import {
  ApplicationCommandOptionType,
  type APIEmbed,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import { getRandomInt } from '../utils/random';
import { RICKROLL_URL } from '../config/constants';

export class RollCommand extends ChatInputCommand {
  readonly name = 'roll';
  readonly description = 'Returns a random number within the specified range';
  readonly descriptionLocalizations = {
    ru: 'Выдаёт случайное число в указанном промежутке',
    uk: 'Видає випадкове число у зазначеному проміжку',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'minimum',
      nameLocalizations: { ru: 'минимум', uk: 'мінімум' },
      type: ApplicationCommandOptionType.Integer,
      description: 'Minimum number value',
      descriptionLocalizations: {
        ru: 'Минимальное значение числа',
        uk: 'Мінімальне значення числа',
      },
      required: false,
    },
    {
      name: 'maximum',
      nameLocalizations: { ru: 'максимум', uk: 'максимум' },
      type: ApplicationCommandOptionType.Integer,
      description: 'Maximum number value',
      descriptionLocalizations: {
        ru: 'Предельное значение числа',
        uk: 'Граничне значення числа',
      },
      required: false,
    },
    {
      name: 'modifiers',
      nameLocalizations: { ru: 'модификаторы', uk: 'модифікатори' },
      type: ApplicationCommandOptionType.String,
      description: 'Modifiers applied to the roll (signed, separated by a space)',
      descriptionLocalizations: {
        ru: 'Применяемые к роллу модификаторы (со знаком через пробел)',
        uk: 'Модифікатори, що застосовуються до ролу (зі знаком через пробіл)',
      },
      required: false,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const max = interaction.options.getInteger('maximum') ?? 20;
    const min = interaction.options.getInteger('minimum') ?? 1;

    if (min > max) {
      await interaction.followUp({
        ephemeral: true,
        content: 'Введите корректные величины.',
      });
      return;
    }

    const result = getRandomInt(min, max);
    const rollEmbed: APIEmbed = {
      color: this.ctx.config.lineColor,
      title:
        min !== max
          ? `:game_die: Случайное число от ${min} до ${max}`
          : `:game_die: Случайное число ${max} :smile:`,
      description: `**${result}**`,
      footer: buildFooter(interaction.client),
    };

    if (result === max) {
      rollEmbed.image = { url: RICKROLL_URL };
    }

    const modString = interaction.options.getString('modifiers');
    if (modString) {
      const mods: string[] = [];
      let finalResult = result;
      for (const mod of modString.split(' ')) {
        const parsed = Number(mod);
        if (Number.isNaN(parsed)) break;
        finalResult += parsed;
        mods.push(mod);
      }
      if (finalResult !== result) {
        rollEmbed.fields = [
          { name: ':heavy_plus_sign: Модификаторы:', value: `**${mods.join(' ')}**` },
          { name: ':gem: Итоговое значение:', value: `**${finalResult}**` },
        ];
      }
    }

    await interaction.followUp({ embeds: [rollEmbed] });
  }
}
