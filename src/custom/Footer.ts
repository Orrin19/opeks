import { CommandInteraction, User } from 'discord.js';

export class Footer {
  text: string;
  iconURL: string;
  constructor(interaction: CommandInteraction) {
    this.text =
      (interaction.client.user?.username as string) +
      ' © ' +
      new Date().getFullYear() +
      ' • Все права нарушены';
    this.iconURL = interaction.client.user!.displayAvatarURL({
      size: 128,
    }) as string;
  }
}
