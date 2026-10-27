import type { Listener } from '../structures/Listener';
import type { Command } from '../structures/Command';
import type { TextParser } from '../structures/TextParser';
import type { Logger } from '../core/Logger';
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
  logger: Logger,
): Listener[] => [
  new ReadyListener(commands, logger),
  new InteractionCreateListener(commands, logger),
  new MessageCreateListener(parsers, logger),
  new MessageReactionAddListener(logger),
  new GuildMemberAddListener(),
  new GuildMemberRemoveListener(),
  new GuildMemberUpdateListener(),
];
