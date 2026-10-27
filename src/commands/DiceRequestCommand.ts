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
import { formatModifiers, parseModifiers, type ParsedThreshold } from '../utils/dice';
import { truncate } from '../utils/text';

const PURPOSE_MAX_CHARS = 1000;

/**
 * Discord rejects commands where an optional option precedes a required one, so
 * shared options are split: required (`purpose`, `player`) → criterion →
 * optional (`minimum`, `maximum`, `modifiers`).
 */
const DICE_REQUIRED_OPTIONS: ApplicationCommandOptionData[] = [
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
];

const DICE_OPTIONAL_OPTIONS: ApplicationCommandOptionData[] = [
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
];

/** Builds the full option list in the required order: required → criterion → optional. */
export const buildDiceOptions = (
  criterion: readonly ApplicationCommandOptionData[],
): ApplicationCommandOptionData[] => [
  ...DICE_REQUIRED_OPTIONS,
  ...criterion,
  ...DICE_OPTIONAL_OPTIONS,
];

/** The result criterion (a single difficulty or outcome ranges) of a dice request. */
export interface DiceCriterion {
  difficulty: number | null;
  thresholds: readonly ParsedThreshold[] | null;
}

/**
 * Shared behaviour of the game-master dice commands (`/dice`, `/dice-range`):
 * permission check, common options, request registration and the roll button.
 * Subclasses only define the result criterion.
 */
export abstract class DiceRequestCommand extends ChatInputCommand {
  constructor(protected readonly ctx: AppContext) {
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

    const criterion = await this.readCriterion(interaction);
    if (criterion === null) return; // readCriterion already reported the error

    const request = this.ctx.services.dice.register({
      min,
      max,
      purpose,
      modifiers,
      difficulty: criterion.difficulty,
      thresholds: criterion.thresholds,
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

  /**
   * Reads and validates the result criterion from the interaction. May respond
   * with an ephemeral error and return `null` to abort the request.
   */
  protected abstract readCriterion(
    interaction: ChatInputCommandInteraction,
  ): Promise<DiceCriterion | null>;

  /** Builds the request-embed field describing the criterion. */
  protected abstract buildCriterionField(request: DiceRequest): APIEmbedField;

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
        name: '➗ Модификаторы',
        value: request.modifiers.length > 0 ? formatModifiers(request.modifiers) : '—',
        inline: true,
      },
      this.buildCriterionField(request),
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
