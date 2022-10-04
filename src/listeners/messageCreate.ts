import Discord from 'discord.js';

export default (client: Discord.Client): void => {
  client.on('messageCreate', async (message: Discord.Message) => {
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
      const links = new Array<string>();
      message.content
        .split('[[')
        .slice(1)
        .forEach((str1: string) => {
          links.push(str1.split(']]')[0]);
        });
      message.channel.send(
        `<https://lamoraun.fandom.com/ru/wiki/${links.join(
          '>\n<https://lamoraun.fandom.com/ru/wiki/'
        )}>`
      );
    }

    if (
      message.content.toLowerCase().includes('kiddy blade') &&
      message.guildId == '677151054013399050'
    ) {
      const emoji = message.guild?.emojis.cache.find(
        (e) => e.name == 'MuraAngry'
      ) as Discord.GuildEmoji;
      message.react(emoji).catch(console.error);
    }
  });
};
