import Discord from 'discord.js';
import { Command } from '../Command';

export const Clean: Command = {
  name: 'clean',
  description: 'Deletes the specified amount of messages',
  descriptionLocalizations: {
    ru: 'Удаляет указанное число сообщений',
    uk: 'Видаляє вказану кількість повідомлень',
  },
  options: [
    {
      name: 'amount',
      nameLocalizations: {
        ru: 'количество',
        uk: 'кількість',
      },
      type: Discord.ApplicationCommandOptionType.Integer,
      description: 'Amount of deletable messages',
      descriptionLocalizations: {
        ru: 'Количество удаляемых сообщений',
        uk: 'Кількість повідомлень, що видаляються',
      },
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: Discord.PermissionsBitField.Flags.ManageMessages,
  runChatInput: async (
    client: Discord.Client,
    interaction: Discord.ChatInputCommandInteraction
  ) => {
    const messCount = interaction.options.getInteger('amount', true);
    if (interaction.channel?.type == Discord.ChannelType.DM) return;
    let amount = messCount + 1;
    if (amount <= 1 || amount > 100) {
      await interaction.followUp({
        ephemeral: true,
        content: 'Необходимо ввести число от 1 до 99.',
      });
      return;
    }
    const channel = interaction.guild?.channels.cache.find(
      (c) => c.id === interaction.channelId
    );
    await (channel as Discord.TextChannel).bulkDelete(amount, true);
  },
};
