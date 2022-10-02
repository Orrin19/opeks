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

    if (
      message.content.includes('[[') &&
      message.content.includes(']]') &&
      message.guild?.id === '664491015914258452'
    ) {
      let help = 0;
      let link = [];
      for (let symbol of message.content.split('')) {
        if (help === 5) {
          message.channel.send(
            `<https://lamoraun.fandom.com/ru/wiki/${link.join('')}>`
          );
          help = 0;
          link = [];
        }
        if (help === 2 && symbol === ']') {
          help = 5;
        }
        if (help === 2 && symbol !== ']') {
          if (symbol === ' ') {
            symbol = '_';
          }
          link.push(symbol);
        }
        if (symbol === '[' && help === 1) {
          help = 2;
        }
        if (symbol === '[' && help === 0) {
          help = 1;
        }
      }
    }
  });
};
