import Discord from 'discord.js';
import { TextParser } from '../TextParser';

export const LamoraunLinks: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => {
    return (
      message.content.includes('[[') &&
      message.content.includes(']]') &&
      message.guild?.id === '664491015914258452'
    );
  },
  run: (message: Discord.Message, client: Discord.Client) => {
    const links = new Array<string>();
    message.content
      .split('[[')
      .slice(1)
      .forEach((str1: string) => {
        links.push(str1.split(']]')[0].replaceAll(' ', '_'));
      });
    (message.channel as Discord.TextChannel)?.send(
      `<https://lamoraun.fandom.com/ru/wiki/${links.join(
        '>\n<https://lamoraun.fandom.com/ru/wiki/'
      )}>`
    );
  },
};
