import type { Config } from '../config/env';
import type { Logger } from '../core/Logger';
import { DiceService } from './DiceService';
import { LlmService } from './LlmService';
import { NekosService } from './NekosService';
import { SauceService } from './SauceService';
import { TraceMoeService } from './TraceMoeService';
import { WikiService } from './WikiService';

export interface Services {
  wiki: WikiService;
  llm: LlmService;
  sauce: SauceService;
  traceMoe: TraceMoeService;
  nekos: NekosService;
  dice: DiceService;
}

export const createServices = (config: Config, logger: Logger): Services => ({
  wiki: new WikiService(logger),
  llm: new LlmService(config, logger),
  sauce: new SauceService(config, logger),
  traceMoe: new TraceMoeService(logger),
  nekos: new NekosService(logger),
  dice: new DiceService(),
});

export type { WikiArticle } from './WikiService';
export type { ChatMessage } from './LlmService';
export type { NekosCategory, NekosImage } from './NekosService';
export type { SauceResult } from './SauceService';
