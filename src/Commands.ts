import { Command } from './Command';
import { About } from './commands/About';
import { Avatar } from './commands/Avatar';
import { Clean } from './commands/Clean';
import { Dice } from './commands/Dice';
import { Meow } from './commands/Meow';
import { Roll } from './commands/Roll';
import { Serverinfo } from './commands/Serverinfo';
import { Special } from './commands/Special';
import { Userinfo } from './commands/Userinfo';
import { Voting } from './commands/Voting';

export const Commands: Command[] = [
  About,
  Avatar,
  Clean,
  Dice,
  Meow,
  Roll,
  Serverinfo,
  Special,
  Userinfo,
  Voting,
];
