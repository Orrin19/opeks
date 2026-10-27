import type { ChatInputCommandInteraction } from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';

export class MeowCommand extends ChatInputCommand {
  readonly name = 'meow';
  readonly description = 'Sends a picture with a cat';
  readonly descriptionLocalizations = {
    ru: 'Отправляет картинку с котиком',
    uk: 'Відправляє картинку з котиком',
  };

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const image = await this.ctx.services.nekos.getImage('meow');
    const meowEmbed = {
      color: this.ctx.config.lineColor,
      image: { url: image.url },
      footer: buildFooter(interaction.client),
    };

    await interaction.followUp({ embeds: [meowEmbed] });
  }
}
