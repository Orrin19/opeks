import type { TextParser } from '../structures/TextParser';
import type { AppContext } from '../core/AppContext';
import { BotQuestionParser } from './BotQuestion';
import { MarselParser } from './Marsel';
import { RandomEmojiParser } from './RandomEmoji';
import { ReactTriggerParser } from './ReactTrigger';
import { UnivermagParser } from './Univermag';
import { WikiLinksParser } from './WikiLinks';

export const createParsers = (ctx: AppContext): TextParser[] => [
  new BotQuestionParser(),
  new WikiLinksParser(ctx),
  new MarselParser(),
  new RandomEmojiParser(),
  new ReactTriggerParser(),
  new UnivermagParser(),
];
