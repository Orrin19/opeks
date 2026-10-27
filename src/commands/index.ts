import type { Command } from '../structures/Command';
import type { AppContext } from '../core/AppContext';
import { AboutCommand } from './About';
import { AvatarCommand } from './Avatar';
import { ChoiceCommand } from './Choice';
import { CleanCommand } from './Clean';
import { DiceCommand } from './Dice';
import { EightballCommand } from './Eightball';
import { MeowCommand } from './Meow';
import { NekoslifeCommand } from './Nekoslife';
import { RollCommand } from './Roll';
import { RpsCommand } from './Rps';
import { SauceCommand } from './Sauce';
import { ServerinfoCommand } from './Serverinfo';
import { SpecialCommand } from './Special';
import { TimeoutCommand } from './Timeout';
import { TracemoeCommand } from './Tracemoe';
import { UserinfoCommand } from './Userinfo';
import { VerdictCommand } from './Verdict';
import { VotingCommand } from './Voting';
import { WikiCommand } from './Wiki';

export const createCommands = (ctx: AppContext): Map<string, Command> => {
  const commands: Command[] = [
    new AboutCommand(ctx),
    new AvatarCommand(),
    new ChoiceCommand(),
    new CleanCommand(),
    new DiceCommand(ctx),
    new EightballCommand(ctx),
    new MeowCommand(ctx),
    new NekoslifeCommand(ctx),
    new RollCommand(ctx),
    new RpsCommand(),
    new SauceCommand(ctx),
    new ServerinfoCommand(ctx),
    new SpecialCommand(ctx),
    new TimeoutCommand(),
    new TracemoeCommand(ctx),
    new UserinfoCommand(ctx),
    new VerdictCommand(ctx),
    new VotingCommand(ctx),
    new WikiCommand(ctx),
  ];

  return new Map(commands.map((command) => [command.name, command]));
};
