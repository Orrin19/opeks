import Discord from 'discord.js';
import NekoClient from 'nekos.life';
import { Command } from '../Command';
import { Footer } from '../../custom/Footer';
import config from '../../config';

export const Meow: Command = {
  name: 'meow',
  description: 'Sends a picture with a cat',
  descriptionLocalizations: {
    ru: 'Отправляет картинку с котиком',
    uk: 'Відправляє картинку з котиком',
  },
  type: Discord.ApplicationCommandType.ChatInput,
  runChatInput: async (
    client: Discord.Client,
    interaction: Discord.ChatInputCommandInteraction
  ) => {
    const nekos = new NekoClient();
    const meowEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      image: { url: (await nekos.meow()).url },
      footer: new Footer(interaction),
    };

    await interaction.followUp({
      embeds: [meowEmbed],
    });
  },
};
