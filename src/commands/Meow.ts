import Discord from 'discord.js';
import { get } from 'superagent';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';

export const Meow: Command = {
  name: 'meow',
  description: 'Шлёт картинку с котиком.',
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const { body } = await get('https://nekos.life/api/v2/img/meow');
    const meowEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      image: { url: body.url },
      footer: new Footer(interaction),
    };

    await interaction.followUp({
      embeds: [meowEmbed],
    });
  },
};
