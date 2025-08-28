import {
  ChatInputCommandInteraction,
  Client,
  Interaction,
  ContextMenuCommandInteraction,
} from 'discord.js';
import { Commands } from '../commands/Commands';

export default (client: Client): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(client, interaction);
    } else if (interaction.isMessageContextMenuCommand()) {
      await handleContextMenuCommand(client, interaction);
    } else if (interaction.isUserContextMenuCommand()) {
      await handleContextMenuCommand(client, interaction);
    }
  });
};

const handleSlashCommand = async (
  client: Client,
  interaction: ChatInputCommandInteraction
): Promise<void> => {
  const slashCommand = Commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    await interaction.reply({ content: 'Command not found', ephemeral: true });
    return;
  }

  if (slashCommand.runChatInput) {
    try {
      await interaction.deferReply();
      await slashCommand.runChatInput(client, interaction);
    } catch (error) {
      console.error('Error handling slash command:', error);
      await interaction.editReply({
        content: 'Произошла ошибка при выполнении команды',
      });
    }
  } else {
    await interaction.reply({
      content: 'This command is not available as a slash command',
      ephemeral: true,
    });
  }
};

const handleContextMenuCommand = async (
  client: Client,
  interaction: ContextMenuCommandInteraction
): Promise<void> => {
  const contextCommand = Commands.find(
    (c) => c.name === interaction.commandName
  );
  if (!contextCommand) {
    interaction.reply({ content: 'Command not found', ephemeral: true });
    return;
  }

  if (
    interaction.isMessageContextMenuCommand() &&
    contextCommand.runMessageContext
  ) {
    await contextCommand.runMessageContext(client, interaction);
  } else if (
    interaction.isUserContextMenuCommand() &&
    contextCommand.runUserContext
  ) {
    await contextCommand.runUserContext(client, interaction);
  } else {
    interaction.reply({
      content: 'This command is not available as a context menu command',
      ephemeral: true,
    });
  }
};
