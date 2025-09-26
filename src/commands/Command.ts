import {
  ApplicationCommandType,
  ApplicationCommandOptionData,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionsBitField,
  UserContextMenuCommandInteraction,
  Client,
} from 'discord.js';

interface BaseCommand {
  name: string;
  runChatInput?: (
    client: Client,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
  runMessageContext?: (
    client: Client,
    interaction: MessageContextMenuCommandInteraction
  ) => Promise<void>;
  runUserContext?: (
    client: Client,
    interaction: UserContextMenuCommandInteraction
  ) => Promise<void>;
}

interface ChatInputCommand extends BaseCommand {
  description: string;
  descriptionLocalizations?: Record<string, string>;
  options?: ApplicationCommandOptionData[];
  defaultMemberPermissions?: bigint;
  type?: ApplicationCommandType.ChatInput;
}

interface MessageContextMenuCommand extends BaseCommand {
  type: ApplicationCommandType.Message;
}

interface UserContextMenuCommand extends BaseCommand {
  type: ApplicationCommandType.User;
}

// Объединяем все возможные типы
export type Command =
  | ChatInputCommand
  | MessageContextMenuCommand
  | UserContextMenuCommand;
