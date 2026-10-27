import { ChannelType, type Guild, type GuildMember, type Role, type TextChannel } from 'discord.js';

export const findRoleByName = (guild: Guild | null | undefined, name: string): Role | undefined =>
  guild?.roles.cache.find((role) => role.name === name);

export const findTextChannelByName = (
  guild: Guild | null | undefined,
  name: string,
): TextChannel | undefined =>
  guild?.channels.cache.find(
    (channel): channel is TextChannel =>
      channel.name === name && channel.type === ChannelType.GuildText,
  );

/**
 * Adds or removes a role based on the presence of the word "не" in `text`
 * (used by role-toggling parsers such as "хочу марсель" / "не хочу марсель").
 */
export const applyRoleByText = async (
  member: GuildMember | null | undefined,
  role: Role | undefined,
  text: string,
): Promise<void> => {
  if (!member || !role) return;
  const shouldRemove = text.toLowerCase().includes('не');
  if (shouldRemove) {
    await member.roles.remove(role);
  } else {
    await member.roles.add(role);
  }
};
