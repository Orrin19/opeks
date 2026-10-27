import { Events, type GuildMember } from 'discord.js';
import { Listener } from '../structures/Listener';
import { GUILD_IDS, ROLE_NAMES } from '../config/constants';
import { findRoleByName } from '../utils/discord';

export class GuildMemberAddListener extends Listener {
  readonly event = Events.GuildMemberAdd;

  async run(member: GuildMember): Promise<void> {
    if (member.guild.id !== GUILD_IDS.lamoraun) return;
    const role = findRoleByName(member.guild, ROLE_NAMES.novice);
    if (role) await member.roles.add(role);
  }
}
