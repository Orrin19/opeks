import { randomUUID } from 'node:crypto';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  userMention,
  type APIEmbed,
  type APIEmbedField,
  type ButtonInteraction,
  type Client,
} from 'discord.js';
import type { Config } from '../config/env';
import type { Logger } from '../core/Logger';
import { DICE_BUTTON_PREFIX } from '../config/constants';
import {
  computeDiceOutcome,
  formatModifiers,
  resolveThreshold,
  type DiceOutcome,
  type ParsedModifier,
  type ParsedThreshold,
} from '../utils/dice';
import { buildFooter } from '../utils/embed';
import { getRandomInt } from '../utils/random';

/** A pending dice-roll request created by a game master for a player. */
export interface DiceRequest {
  id: string;
  min: number;
  max: number;
  purpose: string;
  modifiers: readonly ParsedModifier[];
  /** Single difficulty threshold (mutually exclusive with `thresholds`). */
  difficulty: number | null;
  /** Outcome ranges (mutually exclusive with `difficulty`). */
  thresholds: readonly ParsedThreshold[] | null;
  playerId: string;
}

/**
 * Owns the full lifecycle of a game-master dice roll: stores pending requests
 * and processes the player's roll button. All button logic lives here so the
 * generic `InteractionCreate` listener stays thin.
 */
export class DiceService {
  private readonly requests = new Map<string, DiceRequest>();

  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
  ) {}

  register(request: Omit<DiceRequest, 'id'>): DiceRequest {
    const stored: DiceRequest = { ...request, id: randomUUID() };
    this.requests.set(stored.id, stored);
    return stored;
  }

  get(id: string): DiceRequest | undefined {
    return this.requests.get(id);
  }

  delete(id: string): boolean {
    return this.requests.delete(id);
  }

  /** Processes a roll-button click. No-op for non-dice buttons. */
  async handleButton(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.customId.startsWith(DICE_BUTTON_PREFIX)) return;

    try {
      const requestId = interaction.customId.slice(DICE_BUTTON_PREFIX.length);
      const request = this.requests.get(requestId);
      if (!request) {
        await interaction.reply({
          content: 'Этот запрос уже использован или больше недействителен.',
          ephemeral: true,
        });
        return;
      }

      if (interaction.user.id !== request.playerId) {
        await interaction.reply({
          content: 'Этот бросок предназначен другому игроку.',
          ephemeral: true,
        });
        return;
      }

      // Consume the request before rolling so it cannot be triggered twice.
      this.requests.delete(requestId);

      const roll = getRandomInt(request.min, request.max);
      const outcome = computeDiceOutcome(roll, request.modifiers, request.difficulty);

      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(interaction.customId)
          .setLabel('✅ Бросок совершён')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      );

      await interaction.update({ components: [disabledRow] });
      await interaction.message.reply({
        embeds: [this.buildResultEmbed(request, outcome, interaction.client)],
      });
    } catch (error) {
      this.logger.error('Dice button handling failed:', error);
    }
  }

  private buildResultEmbed(request: DiceRequest, outcome: DiceOutcome, client: Client): APIEmbed {
    const fields: APIEmbedField[] = [
      { name: '🎲 Бросок', value: `**${outcome.roll}**`, inline: true },
    ];

    if (request.modifiers.length > 0) {
      const sign = outcome.modifierTotal > 0 ? '+' : '';
      fields.push({
        name: '➗ Модификаторы',
        value: `${formatModifiers(request.modifiers)} = **${sign}${outcome.modifierTotal}**`,
        inline: true,
      });
    }

    fields.push({ name: '🧮 Итог', value: `**${outcome.total}**`, inline: true });

    if (request.difficulty !== null) {
      fields.push({
        name: '⚖️ Результат',
        value: outcome.success
          ? `✅ Успех (итог ≥ ${request.difficulty})`
          : `❌ Провал (итог < ${request.difficulty})`,
      });
    } else if (request.thresholds !== null && request.thresholds.length > 0) {
      const threshold = resolveThreshold(outcome.total, request.thresholds);
      fields.push({
        name: '🏷️ Результат',
        value: threshold
          ? `**${threshold.result}** (${this.formatThresholdRange(outcome.total, threshold)})`
          : '⚠️ Итог не попадает ни в один диапазон — проверьте настройку диапазонов.',
      });
    }

    return {
      color: this.config.lineColor,
      title: '🎲 Результат броска',
      description: `${userMention(request.playerId)} бросает куб (${request.min}–${request.max}): **${request.purpose}**`,
      fields,
      footer: buildFooter(client),
    };
  }

  private formatThresholdRange(total: number, threshold: ParsedThreshold): string {
    if (total < threshold.min) return `≤ ${threshold.min}`;
    if (total > threshold.max) return `≥ ${threshold.max}`;
    return `${threshold.min}–${threshold.max}`;
  }
}
