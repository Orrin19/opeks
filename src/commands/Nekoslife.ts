import Discord from 'discord.js';
import NekoClient from 'nekos.life';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';

export const Nekoslife: Command = {
  name: 'nekos-life',
  description: 'Gets cute image',
  descriptionLocalizations: {
    ru: 'Добывает красивую картинку',
    uk: 'Добуває красиву картинку',
  },
  options: [
    {
      name: 'request',
      nameLocalizations: {
        ru: 'запрос',
        uk: 'запит',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Image request. For help write ``help``',
      descriptionLocalizations: {
        ru: 'Запрос картинки. Для получения помощи напишите ``help``',
        uk: 'Запит картинки. Для отримання допомоги напишіть ``help``',
      },
      choices: [
        { name: 'smug', value: 'smug' },
        { name: 'baka', value: 'baka' },
        { name: 'tickle', value: 'tickle' },
        { name: 'slap', value: 'slap' },
        { name: 'poke', value: 'poke' },
        { name: 'pat', value: 'pat' },
        { name: 'neko', value: 'neko' },
        { name: 'nekoGif', value: 'nekoGif' },
        { name: 'meow', value: 'meow' },
        { name: 'lizard', value: 'lizard' },
        { name: 'kiss', value: 'kiss' },
        { name: 'hug', value: 'hug' },
        { name: 'foxGirl', value: 'foxGirl' },
        { name: 'feed', value: 'feed' },
        { name: 'cuddle', value: 'cuddle' },
        { name: 'kemonomimi', value: 'kemonomimi' },
        { name: 'holo', value: 'holo' },
        { name: 'woof', value: 'woof' },
        { name: 'wallpaper', value: 'wallpaper' },
        { name: 'goose', value: 'goose' },
        { name: 'gecg', value: 'gecg' },
        { name: 'avatar', value: 'avatar' },
        { name: 'waifu', value: 'waifu' },
      ],
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const nekos = new NekoClient();
    const images = new Map()
      .set('smug', nekos.smug)
      .set('baka', nekos.baka)
      .set('tickle', nekos.tickle)
      .set('slap', nekos.slap)
      .set('poke', nekos.poke)
      .set('pat', nekos.pat)
      .set('neko', nekos.neko)
      .set('nekoGif', nekos.nekoGif)
      .set('meow', nekos.meow)
      .set('lizard', nekos.lizard)
      .set('kiss', nekos.kiss)
      .set('hug', nekos.hug)
      .set('foxGirl', nekos.foxGirl)
      .set('feed', nekos.feed)
      .set('cuddle', nekos.cuddle)
      .set('kemonomimi', nekos.kemonomimi)
      .set('holo', nekos.holo)
      .set('woof', nekos.woof)
      .set('wallpaper', nekos.wallpaper)
      .set('goose', nekos.goose)
      .set('gecg', nekos.gecg)
      .set('avatar', nekos.avatar)
      .set('waifu', nekos.waifu);
    const texts = new Map()
      .set('why', nekos.why)
      .set('catText', nekos.catText)
      .set('OwOify', nekos.OwOify)
      .set('eightBall', nekos.eightBall)
      .set('fact', nekos.fact);

    const request = interaction.options.get('request', true)?.value as string;
    images.forEach(async (func, name) => {
      if (request == name) {
        const nekoEmbed: Discord.APIEmbed = {
          color: Number(config.LINE_COLOR),
          image: { url: (await func().catch(console.error)).url },
          footer: new Footer(interaction),
        };
        return await interaction.followUp({
          embeds: [nekoEmbed],
        });
      }
    });
  },
};
