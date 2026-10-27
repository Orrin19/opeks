import type { Message } from 'discord.js';
import { TextParser } from '../structures/TextParser';
import { ROLE_NAMES } from '../config/constants';
import { applyRoleByText, findRoleByName } from '../utils/discord';

const KEYWORDS = ['искать инструменты', 'найти инструменты', 'взять инструменты'];

export class UnivermagParser extends TextParser {
  matches(message: Message): boolean {
    const content = message.content.toLowerCase();
    return KEYWORDS.some((keyword) => content.includes(keyword));
  }

  async run(message: Message): Promise<void> {
    const role = findRoleByName(message.guild, ROLE_NAMES.tushkan);
    await applyRoleByText(message.member, role, message.content);
  }
}
