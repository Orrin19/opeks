import { Events, type GuildMember } from 'discord.js';
import { Listener } from '../structures/Listener';
import { ROLE_NAMES, USER_IDS } from '../config/constants';
import { findRoleByName } from '../utils/discord';

export class GuildMemberUpdateListener extends Listener {
  readonly event = Events.GuildMemberUpdate;

  async run(_oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (newMember.id !== USER_IDS.tushkan) return;

    const role = findRoleByName(newMember.guild, ROLE_NAMES.tushkan);
    if (role && newMember.roles.cache.has(role.id)) {
      await newMember.roles.remove(role);
    }
  }
}
