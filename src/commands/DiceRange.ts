import {
  ApplicationCommandOptionType,
  type APIEmbedField,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { buildDiceOptions, DiceRequestCommand, type DiceCriterion } from './DiceRequestCommand';
import type { DiceRequest } from '../services/DiceService';
import { formatThresholds, parseThresholds } from '../utils/dice';

export class DiceRangeCommand extends DiceRequestCommand {
  readonly name = 'dice-range';
  readonly description = 'Requests a dice roll with ranged outcomes (game master only)';
  readonly descriptionLocalizations = {
    ru: 'Запрашивает бросок куба с диапазонами результатов (для ведущего)',
    uk: 'Запитує кидок кубика з діапазонами результатів (для ведучого)',
  };

  readonly options: ApplicationCommandOptionData[] = buildDiceOptions([
    {
      name: 'thresholds',
      nameLocalizations: { ru: 'диапазоны', uk: 'діапазони' },
      type: ApplicationCommandOptionType.String,
      description: 'Outcome ranges like "1-5:failure; 6-15:partial; 16-20:success"',
      descriptionLocalizations: {
        ru: 'Диапазоны результатов вида «1-5:провал; 6-15:частичный успех; 16-20:полный успех»',
        uk: 'Діапазони результатів виду «1-5:провал; 6-15:частковий успіх; 16-20:повний успіх»',
      },
      required: true,
    },
  ]);

  protected async readCriterion(
    interaction: ChatInputCommandInteraction,
  ): Promise<DiceCriterion | null> {
    const thresholds = parseThresholds(interaction.options.getString('thresholds', true));
    if (thresholds.length === 0) {
      await interaction.followUp({
        content:
          'Не удалось разобрать диапазоны. Используйте формат «1-5:провал; 6-15:частичный успех; 16-20:полный успех».',
        ephemeral: true,
      });
      return null;
    }

    return { difficulty: null, thresholds };
  }

  protected buildCriterionField(request: DiceRequest): APIEmbedField {
    return {
      name: '🏷️ Диапазоны результатов',
      value: formatThresholds(request.thresholds ?? []),
      inline: false,
    };
  }
}
