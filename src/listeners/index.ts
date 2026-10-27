import type { Listener } from '../structures/Listener';
import type { Command } from '../structures/Command';
import type { TextParser } from '../structures/TextParser';
import type { AppContext } from '../core/AppContext';
import { GuildMemberAddListener } from './GuildMemberAdd';
import { GuildMemberRemoveListener } from './GuildMemberRemove';
import { GuildMemberUpdateListener } from './GuildMemberUpdate';
import { InteractionCreateListener } from './InteractionCreate';
import { MessageCreateListener } from './MessageCreate';
import { MessageReactionAddListener } from './MessageReactionAdd';
import { ReadyListener } from './Ready';

export const createListeners = (
  commands: ReadonlyMap<string, Command>,
  parsers: readonly TextParser[],
  ctx: AppContext,
): Listener[] => [
  new ReadyListener(commands, ctx.logger),
  new InteractionCreateListener(commands, ctx),
  new MessageCreateListener(parsers, ctx.logger),
  new MessageReactionAddListener(ctx.logger),
  new GuildMemberAddListener(),
  new GuildMemberRemoveListener(),
  new GuildMemberUpdateListener(),
];
