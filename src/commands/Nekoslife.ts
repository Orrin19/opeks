import Discord from 'discord.js';
import NekoClient from 'nekos.life';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';

export const Nekoslife: Command = {
  name: 'nekos-life',
  description: 'Добывает красивую картинку.',
  options: [
    {
      name: 'запрос',
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Запрос картинки. Для получения помощи напишите ``help``.',
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const nekos = new NekoClient();
    const images = {
      smug: nekos['smug'],
      baka: nekos['baka'],
      tickle: nekos['tickle'],
      slap: nekos['slap'],
      poke: nekos['poke'],
      pat: nekos['pat'],
      neko: nekos['neko'],
      nekoGif: nekos['nekoGif'],
      meow: nekos['meow'],
      lizard: nekos['lizard'],
      kiss: nekos['kiss'],
      hug: nekos['hug'],
      foxGirl: nekos['foxGirl'],
      feed: nekos['feed'],
      cuddle: nekos['cuddle'],
      kemonomimi: nekos['kemonomimi'],
      holo: nekos['holo'],
      woof: nekos['woof'],
      wallpaper: nekos['wallpaper'],
      goose: nekos['goose'],
      gecg: nekos['gecg'],
      avatar: nekos['avatar'],
      waifu: nekos['waifu'],
    };
    const texts = {
      why: nekos.why,
      catText: nekos.catText,
      OwOify: nekos.OwOify,
      eightBall: nekos.eightBall,
      fact: nekos.fact,
    };
    const request = interaction.options.get('запрос', true)
      ?.value as unknown as property;
    nekos;
    if (request in images) {
      const nekoEmbed: Discord.APIEmbed = {
        color: Number(config.LINE_COLOR),
        image: { url: (await images[request]()).url },
        footer: new Footer(interaction),
      };
      await interaction.followUp({
        embeds: [nekoEmbed],
      });
    }
  },
};
