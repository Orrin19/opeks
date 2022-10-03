import Discord from 'discord.js';

export default (client: Discord.Client): void => {
  client.on('guildMemberAdd', async (member: Discord.GuildMember) => {
    if (member.guild.id !== '664491015914258452') return;
    const noviceRole = member.guild.roles.cache.find(
      (r) => r.name === 'Начинающий'
    ) as Discord.RoleResolvable;
    await member.roles.add(noviceRole);
  });
};
