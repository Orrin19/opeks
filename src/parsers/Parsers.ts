import { TextParser } from './TextParser';
import { BotQuestion } from './storage/BotQuestion';
import { LamoraunLinks } from './storage/LamoraunLinks';
import { Marsel } from './storage/Marsel';
import { RandomEmoji } from './storage/RandomEmoji';
import { ReactTrigger } from './storage/ReactTrigger';
import { Univermag } from './storage/Univermag';

export const Parsers: TextParser[] = [
  BotQuestion,
  LamoraunLinks,
  Marsel,
  RandomEmoji,
  ReactTrigger,
  Univermag,
];
