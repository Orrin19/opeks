import type { Message } from 'discord.js';
import { TextParser } from '../structures/TextParser';
import { ROLE_NAMES } from '../config/constants';
import { applyRoleByText, findRoleByName } from '../utils/discord';

export class MarselParser extends TextParser {
  matches(message: Message): boolean {
    const content = message.content.toLowerCase();
    return (
      content.includes('хочу марсель') || content.includes('хочу в марсель')
    );
  }

  async run(message: Message): Promise<void> {
    const role = findRoleByName(message.guild, ROLE_NAMES.marsel);
    await applyRoleByText(message.member, role, message.content);
  }
}
