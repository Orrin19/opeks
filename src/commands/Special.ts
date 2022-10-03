import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import {
  getRandomInt,
  getRandArrIndex,
  getRandArrElement,
} from '../custom/commonFunctions';
import config from '../config';

export const Special: Command = {
  name: 'special',
  description: 'Генерирует характеристику персонажа а-ля Fallout.',
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const specialEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title: 'S.P.E.C.I.A.L.',
      description: 'Случайная характеристика для вашего персонажа',
      fields: [],
      footer: new Footer(interaction),
    };

    const specials = [
      [':muscle: Сила:', 5],
      [':eyes: Восприятие:', 5],
      [':man_running: Выносливость:', 5],
      [':sunglasses: Харизма:', 5],
      [':brain: Интеллект:', 5],
      [':cartwheel: Ловкость:', 5],
      [':unicorn: Удача:', 5],
    ];
    let cash = getRandomInt(2) + 3;
    while (cash > 0) {
      let index = getRandArrIndex(specials);
      let rand = getRandArrElement([-1, -1, -1, -1, 1, 1, 1]);
      if ((specials[index][1] as number) == 10) {
        rand -= 1;
      }
      if ((specials[index][1] as number) == 0) {
        rand += 1;
      }
      cash -= rand;
      (specials[index][1] as number) += rand;
    }
    for (let spec of specials) {
      specialEmbed.fields?.push({
        name: spec[0] as string,
        value: `**${spec[1]}**`,
      });
    }

    interaction.followUp({
      embeds: [specialEmbed],
    });
  },
};
