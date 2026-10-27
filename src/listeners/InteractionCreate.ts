import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  userMention,
  type APIEmbed,
  type APIEmbedField,
  type ButtonInteraction,
  type Client,
  type Interaction,
} from 'discord.js';
import { Listener } from '../structures/Listener';
import type { Command } from '../structures/Command';
import type { AppContext } from '../core/AppContext';
import { DICE_BUTTON_PREFIX } from '../config/constants';
import type { DiceRequest } from '../services/DiceService';
import {
  computeDiceOutcome,
  formatModifiers,
  resolveThreshold,
  type DiceOutcome,
  type ParsedThreshold,
} from '../utils/dice';
import { buildFooter } from '../utils/embed';
import { getRandomInt } from '../utils/random';

export class InteractionCreateListener extends Listener {
  readonly event = Events.InteractionCreate;

  constructor(
    private readonly commands: ReadonlyMap<string, Command>,
    private readonly ctx: AppContext,
  ) {
    super();
  }

  async run(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      const command = this.commands.get(interaction.commandName);
      if (!command) {
        await interaction
          .reply({ content: 'Command not found', ephemeral: true })
          .catch(() => undefined);
        return;
      }

      try {
        await command.execute(interaction, this.ctx.logger);
      } catch (error) {
        this.ctx.logger.error(`Unhandled error in command "${interaction.commandName}":`, error);
      }
      return;
    }

    if (interaction.isButton()) {
      await this.handleDiceButton(interaction);
    }
  }

  private async handleDiceButton(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.customId.startsWith(DICE_BUTTON_PREFIX)) return;

    try {
      const requestId = interaction.customId.slice(DICE_BUTTON_PREFIX.length);
      const request = this.ctx.services.dice.get(requestId);
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
      this.ctx.services.dice.delete(requestId);

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
      this.ctx.logger.error('Dice button handling failed:', error);
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
      color: this.ctx.config.lineColor,
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
