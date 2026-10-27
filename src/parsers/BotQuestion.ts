import type { Message } from 'discord.js';
import { TextParser } from '../structures/TextParser';
import { pick } from '../utils/random';

const ANSWERS = [
  'Да!',
  'Определённо, да!',
  'Да, конечно!',
  'Да, ясно дело!',
  'Однозначно.',
  'Конечно!',
  'Да. А как может быть иначе?',
  'Нет!',
  'Определённо, нет!',
  'Нет, конечно!',
  'Ни в коем случае.',
  'Я так не думаю.',
  'Ответ отрицателен.',
  'С чего? Нет, конечно.',
] as const;

export class BotQuestionParser extends TextParser {
  matches(message: Message): boolean {
    return (
      message.mentions.users.first() === message.client.user &&
      message.content.endsWith('?')
    );
  }

  async run(message: Message): Promise<void> {
    await message.reply(pick(ANSWERS));
  }
}
