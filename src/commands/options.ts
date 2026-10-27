import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
} from 'discord.js';

/**
 * Builds the repetitive `option_1` .. `option_N` string options used by the
 * `/choice` and `/voting` commands. The first option is required.
 */
export const buildChoiceOptions = (
  count: number,
): ApplicationCommandOptionData[] =>
  Array.from({ length: count }, (_, i) => {
    const index = i + 1;
    return {
      name: `option_${index}`,
      nameLocalizations: {
        ru: `вариант_${index}`,
        uk: `вибiр_${index}`,
      },
      type: ApplicationCommandOptionType.String,
      description: 'One of the options',
      descriptionLocalizations: {
        ru: 'Один из вариантов',
        uk: 'Один з виборiв',
      },
      required: index === 1,
    };
  });
