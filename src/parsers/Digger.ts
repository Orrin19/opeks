import Discord from 'discord.js';
import { TextParser } from '../TextParser';

export const Digger: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => {
    return (
      message.content.toLowerCase().includes('хочу на свалку') ||
      message.content.toLowerCase().includes('хочу свалку') ||
      message.content.toLowerCase().includes('хочу диггер')
    );
  },
  run: (message: Discord.Message, client: Discord.Client) => {
    const role = message.guild?.roles.cache.find(
      (r) => r.name == 'Диггер'
    ) as Discord.Role;
    if (message.content.toLowerCase().includes('не')) {
      message.member?.roles.remove(role).catch(console.error);
    } else {
      message.member?.roles.add(role).catch(console.error);
    }
  },
};