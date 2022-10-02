import { Client, Message } from 'discord.js';

export default (client: Client): void => {
  client.on('messageCreate', async (message: Message) => {
    if (Math.floor(Math.random() * 300) == 50 && !message.author.bot) {
      const emoji = message.guild?.emojis.cache.random();
      message.channel.send('<:' + emoji?.name + ':' + emoji?.id + '>');
    }
    if (message.mentions.users.first() == client.user) {
      if (message.content[message.content.length - 1] == '?') {
        let answer = [
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
        message.reply(answer[Math.floor(Math.random() * answer.length)]);
      }
    }
  });
};
