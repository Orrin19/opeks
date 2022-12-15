import Discord from 'discord.js';

export default (client: Discord.Client): void => {
  client.on(
    'guildMemberRemove',
    async (member: Discord.GuildMember | Discord.PartialGuildMember) => {
      const channel = member.guild.channels.cache.find(
        (c) => c.name == 'checkuser'
      ) as Discord.TextChannel;
      channel.send(`${Discord.userMention(member.id)} куда-то ушёл...`);
    }
  );
};
