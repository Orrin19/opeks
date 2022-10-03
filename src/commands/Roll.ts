import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import { getRandomInt } from '../custom/commonFunctions';
import config from '../config';

export const Roll: Command = {
  name: 'roll',
  description: 'Выдаёт случайное число в указанном промежутке.',
  options: [
    {
      name: 'минимум',
      type: Discord.ApplicationCommandOptionType.Integer,
      description: 'Минимальное значение числа.',
      required: false,
    },
    {
      name: 'максимум',
      type: Discord.ApplicationCommandOptionType.Integer,
      description: 'Предельное значение числа.',
      required: false,
    },
    {
      name: 'модификаторы',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Применяемые к роллу модификаторы (со знаком через пробел).',
      required: false,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const max =
      (interaction.options.get('максимум', false)?.value as number) || 20;
    const min =
      (interaction.options.get('минимум', false)?.value as number) || 1;
    if (min > max)
      return interaction.followUp({
        ephemeral: true,
        content: 'Введите корректные величины.',
      });
    const result = getRandomInt(max - min + 1) + min;

    const rollEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title:
        min != max
          ? `:game_die: Случайное число от ${min} до ${max}`
          : `:game_die: Случайное число ${max} :smile:`,
      description: `**${result}**`,
      footer: new Footer(interaction),
    };
    if (result === max) {
      rollEmbed.image = {
        url: 'https://media.discordapp.net/attachments/664491015914258460/824896135902134283/Rickrolling.gif',
      };
    }

    const modstring =
      (interaction.options.get('модификаторы', false)?.value as string) || null;
    if (modstring) {
      let mods = new Array();
      let finalResult = result;
      for (let mod of modstring.split(' ')) {
        if (!isNaN(Number(mod))) {
          finalResult += Number(mod);
          mods.push(mod);
        } else break;
      }
      if (finalResult !== result) {
        rollEmbed.fields = [
          {
            name: ':heavy_plus_sign: Модификаторы:',
            value: `**${mods.join(' ')}**`,
          },
          {
            name: ':gem: Итоговое значение:',
            value: `**${finalResult}**`,
          },
        ];
      }
    }

    return interaction.followUp({
      embeds: [rollEmbed],
    });
  },
};
