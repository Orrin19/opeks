import Discord from 'discord.js';
import { TextParser } from '../TextParser';

export const Marsel: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => {
    return (
      message.content.toLowerCase().includes('хочу марсель') ||
      message.content.toLowerCase().includes('хочу в марсель')
    );
  },
  run: (message: Discord.Message, client: Discord.Client) => {
    const role = message.guild?.roles.cache.find(
      (r) => r.name == 'Марсель'
    ) as Discord.Role;
    if (message.content.toLowerCase().includes('не')) {
      message.member?.roles.remove(role).catch(console.error);
    } else {
      message.member?.roles.add(role).catch(console.error);
    }
  },
};
