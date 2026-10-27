import {
  ApplicationCommandOptionType,
  type APIEmbedField,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { buildDiceOptions, DiceRequestCommand, type DiceCriterion } from './DiceRequestCommand';
import type { DiceRequest } from '../services/DiceService';

export class DiceCommand extends DiceRequestCommand {
  readonly name = 'dice';
  readonly description = 'Requests a dice roll from a player (game master only)';
  readonly descriptionLocalizations = {
    ru: 'Запрашивает бросок куба у игрока (для ведущего)',
    uk: 'Запитує кидок кубика у гравця (для ведучого)',
  };

  readonly options: ApplicationCommandOptionData[] = buildDiceOptions([
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
  ]);

  protected async readCriterion(interaction: ChatInputCommandInteraction): Promise<DiceCriterion> {
    return {
      difficulty: interaction.options.getInteger('difficulty'),
      thresholds: null,
    };
  }

  protected buildCriterionField(request: DiceRequest): APIEmbedField {
    return {
      name: '⚖️ Сложность',
      value: request.difficulty === null ? '—' : `≥ **${request.difficulty}**`,
      inline: true,
    };
  }
}
