import Discord from 'discord.js';
import { Command } from '../Command';

export const Clean: Command = {
  name: 'clean',
  description: 'Удаляет указанное число сообщений.',
  options: [
    {
      name: 'количество',
      type: Discord.ApplicationCommandOptionType.Integer,
      description: 'Количество удаляемых сообщений.',
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: Discord.PermissionsBitField.Flags.ManageMessages,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const messCount = interaction.options.get('количество', true)
      .value as number;
    if (interaction.channel?.type == Discord.ChannelType.DM) return;
    let amount = messCount + 1;
    if (amount <= 1 || amount > 100)
      return interaction.followUp({
        ephemeral: true,
        content: 'Необходимо ввести число от 1 до 99.',
      });
    if (
      !interaction.memberPermissions?.has(
        Discord.PermissionsBitField.Flags.ManageMessages
      )
    )
      return interaction.followUp({
        ephemeral: true,
        content: 'Вам недоступна эта функция',
      });
    const channel = interaction.guild?.channels.cache.find(
      (c) => c.id === interaction.channelId
    );
    await (channel as Discord.TextChannel).bulkDelete(amount, true);
  },
};
