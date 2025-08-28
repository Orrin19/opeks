import {
  ChatInputCommandInteraction,
  ChatInputApplicationCommandData,
  Client,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js';

export interface Command extends ChatInputApplicationCommandData {
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
