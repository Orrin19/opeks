import Discord from 'discord.js';
import { TextParser } from '../TextParser';

export const Univermag: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => {
    return (
      message.content.toLowerCase().includes('искать инструменты') ||
      message.content.toLowerCase().includes('найти инструменты') ||
      message.content.toLowerCase().includes('взять инструменты')
    );
  },
  run: (message: Discord.Message, client: Discord.Client) => {
    const role = message.guild?.roles.cache.find(
      (r) => r.name == 'Тушкан'
    ) as Discord.Role;
    if (message.content.toLowerCase().includes('не')) {
      message.member?.roles.remove(role).catch(console.error);
    } else {
      message.member?.roles.add(role).catch(console.error);
    }
  },
};
