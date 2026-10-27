import { createRequire } from 'node:module';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import { formatDate } from '../utils/time';

interface PackageJson {
  version: string;
  engines?: { node?: string };
  dependencies?: Record<string, string>;
}

const requireModule = createRequire(__filename);
const packageJson = requireModule('../../package.json') as PackageJson;

export class AboutCommand extends ChatInputCommand {
  readonly name = 'about';
  readonly description = 'Information about bot';
  readonly descriptionLocalizations = {
    ru: 'Информация о боте',
    uk: 'Інформація про роботу',
  };

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.client.user;
    const createdAt = user?.createdAt ?? new Date(0);

    const aboutEmbed = {
      color: this.ctx.config.lineColor,
      title: user?.username,
      thumbnail: {
        url: user?.displayAvatarURL({ size: 1024 }),
      },
      fields: [
        {
          name: 'Дата создания',
          value: formatDate(createdAt),
        },
        {
          name: 'Версия',
          value: packageJson.version,
        },
        {
          name: 'Хост',
          value: this.ctx.config.hosting,
        },
      ],
      footer: buildFooter(interaction.client),
    };

    await interaction.followUp({ embeds: [aboutEmbed] });
  }
}
