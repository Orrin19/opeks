import Discord from 'discord.js';

export default (client: Discord.Client): void => {
  client.on(
    'messageReactionAdd',
    async (
      reaction: Discord.MessageReaction | Discord.PartialMessageReaction,
      user: Discord.User | Discord.PartialUser
    ) => {
      if (
        user.id === '478857385780183041' &&
        [null, 1].includes(reaction.count)
      ) {
        reaction.remove().catch(console.error);
      }
    }
  );
};
