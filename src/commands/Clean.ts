import {
  ApplicationCommandOptionType,
  PermissionsBitField,
  TextChannel,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import { CLEAN_LIMIT } from '../config/constants';

export class CleanCommand extends ChatInputCommand {
  readonly name = 'clean';
  readonly description = 'Deletes the specified amount of messages';
  readonly descriptionLocalizations = {
    ru: 'Удаляет указанное число сообщений',
    uk: 'Видаляє вказану кількість повідомлень',
  };
  readonly defaultMemberPermissions =
    PermissionsBitField.Flags.ManageMessages;
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'amount',
      nameLocalizations: { ru: 'количество', uk: 'кількість' },
      type: ApplicationCommandOptionType.Integer,
      description: 'Amount of deletable messages',
      descriptionLocalizations: {
        ru: 'Количество удаляемых сообщений',
        uk: 'Кількість повідомлень, що видаляються',
      },
      required: true,
    },
  ];

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.channel;
    if (!(channel instanceof TextChannel)) return;

    const messCount = interaction.options.getInteger('amount', true);
    const amount = messCount + 1;
    if (amount <= 1 || amount > CLEAN_LIMIT) {
      await interaction.followUp({
        ephemeral: true,
        content: 'Необходимо ввести число от 1 до 99.',
      });
      return;
    }

    await channel.bulkDelete(amount, true);
  }
}
