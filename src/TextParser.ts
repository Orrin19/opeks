import { Message, Client } from 'discord.js';

export interface TextParser {
  check: (message: Message, client: Client) => boolean;
  run: (message: Message, client: Client) => void;
}
