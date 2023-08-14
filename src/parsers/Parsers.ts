import { TextParser } from './TextParser';
import { BotQuestion } from './storage/BotQuestion';
import { Digger } from './storage/Digger';
import { LamoraunLinks } from './storage/LamoraunLinks';
import { Marsel } from './storage/Marsel';
import { RandomEmoji } from './storage/RandomEmoji';
import { ReactTrigger } from './storage/ReactTrigger';

export const Parsers: TextParser[] = [
  BotQuestion,
  Digger,
  LamoraunLinks,
  Marsel,
  RandomEmoji,
  ReactTrigger,
];
