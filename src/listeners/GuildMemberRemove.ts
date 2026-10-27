import { Events, type GuildMember } from 'discord.js';
import { Listener } from '../structures/Listener';
import { CHANNEL_NAMES, GUILD_IDS } from '../config/constants';
import { findTextChannelByName } from '../utils/discord';

export class GuildMemberRemoveListener extends Listener {
  readonly event = Events.GuildMemberRemove;

  async run(member: GuildMember): Promise<void> {
    if (member.guild.id !== GUILD_IDS.lamoraun) return;

    const channel = findTextChannelByName(member.guild, CHANNEL_NAMES.checkuser);
    if (channel) {
      await channel.send(
        `Пользователь **${member.user.username}** вышел из сервера.`,
      );
    }
  }
}
