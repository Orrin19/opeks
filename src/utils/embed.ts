import type { Client, EmbedFooterData } from 'discord.js';

/** Builds an embed footer for the bot itself. */
export const buildFooter = (client: Client): EmbedFooterData => {
  const user = client.user;
  return {
    text: `${user?.username ?? 'Opeks'} © ${new Date().getFullYear()} • Все права нарушены`,
    iconURL: user?.displayAvatarURL({ size: 128 }),
  };
};
