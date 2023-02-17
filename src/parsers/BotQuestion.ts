import Discord from 'discord.js';
import { TextParser } from '../TextParser';
import { getRandArrElement } from '../custom/commonFunctions';

export const BotQuestion: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => {
    return (
      message.mentions.users.first() == client.user &&
      message.content[message.content.length - 1] == '?'
    );
  },
  run: (message: Discord.Message, client: Discord.Client) => {
    const answer = [
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
    ];
    message.reply(getRandArrElement(answer));
  },
};
