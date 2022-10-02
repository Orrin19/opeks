import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';
const pack = require('./../../package.json');

export const About: Command = {
  name: 'about',
  description: 'Вызывает справку.',
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const aboutEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title: client.user?.username as string,
      thumbnail: {
        url: (client.user as Discord.User).displayAvatarURL({
          size: 1024,
        }) as string,
      },
      fields: [
        {
          name: 'Бот создан',
          value: client.user?.createdAt.toLocaleDateString('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          }) as string,
        },
        {
          name: 'Написан на',
          value: `Node.js: v${pack.engines.node}\nTypeScript: v${pack.dependencies['typescript']}\nDiscord.js: v${pack.dependencies['discord.js']}`,
        },
        {
          name: 'Хостинг',
          value: config.HOSTING,
        },
      ],
      footer: new Footer(interaction),
    };
    interaction.followUp({
      embeds: [aboutEmbed],
    });
  },
};
