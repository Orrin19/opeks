import { TextParser } from './TextParser';
import { BotQuestion } from './parsers/BotQuestion';
import { Digger } from './parsers/Digger';
import { LamoraunLinks } from './parsers/LamoraunLinks';
import { Marsel } from './parsers/Marsel';
import { RandomEmoji } from './parsers/RandomEmoji';
import { ReactTrigger } from './parsers/ReactTrigger';

export const Parsers: TextParser[] = [
  BotQuestion,
  Digger,
  LamoraunLinks,
  Marsel,
  RandomEmoji,
  ReactTrigger,
];
