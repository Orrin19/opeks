import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  userMention,
  type APIEmbed,
  type APIEmbedField,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import {
  DICE_BUTTON_PREFIX,
  DICE_DEFAULT_MAX,
  DICE_DEFAULT_MIN,
  DICE_MAX_MODIFIERS,
  DICE_RANGE_LIMIT,
  DICE_ROLE_NAMES,
} from '../config/constants';
import type { DiceRequest } from '../services/DiceService';
import { buildFooter } from '../utils/embed';
import { formatModifiers, parseModifiers } from '../utils/dice';
import { truncate } from '../utils/text';

const PURPOSE_MAX_CHARS = 1000;

export class DiceCommand extends ChatInputCommand {
  readonly name = 'dice';
  readonly description = 'Requests a dice roll from a player (game master only)';
  readonly descriptionLocalizations = {
    ru: 'Запрашивает бросок куба у игрока (для ведущего)',
    uk: 'Запитує кидок кубика у гравця (для ведучого)',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'purpose',
      nameLocalizations: { ru: 'назначение', uk: 'призначення' },
      type: ApplicationCommandOptionType.String,
      description: 'What this dice roll is for',
      descriptionLocalizations: {
        ru: 'Назначение броска',
        uk: 'Призначення кидка',
      },
      required: true,
    },
    {
      name: 'player',
      nameLocalizations: { ru: 'игрок', uk: 'гравець' },
      type: ApplicationCommandOptionType.User,
      description: 'The player who must roll the dice',
      descriptionLocalizations: {
        ru: 'Игрок, который должен бросить куб',
        uk: 'Гравець, який має кинути кубик',
      },
      required: true,
    },
    {
      name: 'minimum',
      nameLocalizations: { ru: 'минимум', uk: 'мінімум' },
      type: ApplicationCommandOptionType.Integer,
      description: 'Lowest possible value (default 1)',
      descriptionLocalizations: {
        ru: 'Минимальное значение куба (по умолчанию 1)',
        uk: 'Мінімальне значення кубика (за замовчуванням 1)',
      },
      minValue: -DICE_RANGE_LIMIT,
      maxValue: DICE_RANGE_LIMIT,
      required: false,
    },
    {
      name: 'maximum',
      nameLocalizations: { ru: 'максимум', uk: 'максимум' },
      type: ApplicationCommandOptionType.Integer,
      description: 'Highest possible value (default 20)',
      descriptionLocalizations: {
        ru: 'Максимальное значение куба (по умолчанию 20)',
        uk: 'Максимальне значення кубика (за замовчуванням 20)',
      },
      minValue: -DICE_RANGE_LIMIT,
      maxValue: DICE_RANGE_LIMIT,
      required: false,
    },
    {
      name: 'modifiers',
      nameLocalizations: { ru: 'модификаторы', uk: 'модифікатори' },
      type: ApplicationCommandOptionType.String,
      description: 'Modifiers like "+1 Agility, -2 Fatigue"',
      descriptionLocalizations: {
        ru: 'Модификаторы вида «+1 Ловкость, -2 Усталость»',
        uk: 'Модифікатори виду «+1 Спритність, -2 Втома»',
      },
      required: false,
    },
    {
      name: 'difficulty',
      nameLocalizations: { ru: 'сложность', uk: 'складність' },
      type: ApplicationCommandOptionType.Integer,
      description: 'Difficulty threshold the total must reach',
      descriptionLocalizations: {
        ru: 'Порог сложности, который должен быть достигнут итогом',
        uk: 'Поріг складності, який має досягти підсумок',
      },
      required: false,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!this.isGameMaster(interaction)) {
      await interaction.followUp({
        content: 'Эта команда доступна только ведущим (гейммастерам/вердерам).',
        ephemeral: true,
      });
      return;
    }

    const min = interaction.options.getInteger('minimum') ?? DICE_DEFAULT_MIN;
    const max = interaction.options.getInteger('maximum') ?? DICE_DEFAULT_MAX;
    if (min > max) {
      await interaction.followUp({
        content: 'Минимальное значение не может быть больше максимального.',
        ephemeral: true,
      });
      return;
    }

    const purpose = interaction.options.getString('purpose', true);
    const player = interaction.options.getUser('player', true);
    const modifiers = parseModifiers(interaction.options.getString('modifiers'));
    if (modifiers.length > DICE_MAX_MODIFIERS) {
      await interaction.followUp({
        content: `Слишком много модификаторов (максимум ${DICE_MAX_MODIFIERS}).`,
        ephemeral: true,
      });
      return;
    }
    const difficulty = interaction.options.getInteger('difficulty');

    const request = this.ctx.services.dice.register({
      min,
      max,
      purpose,
      modifiers,
      difficulty,
      playerId: player.id,
    });

    const embed = this.buildRequestEmbed(interaction, request);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${DICE_BUTTON_PREFIX}${request.id}`)
        .setLabel('🎲 Бросить куб')
        .setStyle(ButtonStyle.Primary),
    );

    await interaction.followUp({
      content: userMention(request.playerId),
      embeds: [embed],
      components: [row],
    });
  }

  private isGameMaster(interaction: ChatInputCommandInteraction): boolean {
    const member = interaction.member;
    if (!(member instanceof GuildMember)) return false;
    return member.roles.cache.some((role) => DICE_ROLE_NAMES.includes(role.name));
  }

  private buildRequestEmbed(
    interaction: ChatInputCommandInteraction,
    request: DiceRequest,
  ): APIEmbed {
    const fields: APIEmbedField[] = [
      { name: '🎯 Игрок', value: userMention(request.playerId), inline: true },
      { name: '📏 Диапазон', value: `**${request.min}–${request.max}**`, inline: true },
      {
        name: '➕ Модификаторы',
        value: request.modifiers.length > 0 ? formatModifiers(request.modifiers) : '—',
        inline: true,
      },
      {
        name: '⚖️ Сложность',
        value: request.difficulty === null ? '—' : `≥ **${request.difficulty}**`,
        inline: true,
      },
    ];

    return {
      color: this.ctx.config.lineColor,
      title: '🎲 Запрос на бросок куба',
      description: `**Назначение:** ${truncate(request.purpose, PURPOSE_MAX_CHARS)}`,
      fields,
      footer: buildFooter(interaction.client),
    };
  }
}
