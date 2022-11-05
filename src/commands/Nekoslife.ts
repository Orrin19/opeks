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
      autocomplete: true,
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
    if (request == 'help') {
      const commands = [...images.entries()].map((arr) => arr[0]);
      const helpEmbed: Discord.APIEmbed = {
        color: Number(config.LINE_COLOR),
        title: 'Nekos-life!',
        fields: [
          {
            name: 'Доступные команды:',
            value: commands.join('\n'),
          },
        ],
        footer: new Footer(interaction),
      };
      return await interaction.followUp({
        embeds: [helpEmbed],
      });
    }

    images.forEach((func, name) => {
      if (request == name) {
        const nekoEmbed: Discord.APIEmbed = {
          color: Number(config.LINE_COLOR),
          image: { url: func().catch(console.error).url },
          footer: new Footer(interaction),
        };
        return interaction.followUp({
          embeds: [nekoEmbed],
        });
      }
    });

    return interaction.followUp({
      ephemeral: true,
      content:
        'Такой категории нет! Используйте запрос ``help`` чтобы увидеть список.',
    });
  },
};
