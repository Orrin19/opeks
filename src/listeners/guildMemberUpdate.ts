import Discord from 'discord.js';

export default (client: Discord.Client): void => {
  client.on(
    'guildMemberUpdate',
    async (
      oldMember: Discord.GuildMember | Discord.PartialGuildMember,
      newMember: Discord.GuildMember | Discord.PartialGuildMember
    ) => {
      const role = newMember.roles.cache.find(
        (r) => r.name == 'Тушкан'
      ) as Discord.Role;
      if (role && newMember.id == '410701744872488960') {
        newMember.roles.remove(role).catch(console.error);
      }
    }
  );
};
