import NekoClient from 'nekos.life';
import type { Logger } from '../core/Logger';

export type NekosCategory =
  | 'smug'
  | 'baka'
  | 'tickle'
  | 'slap'
  | 'poke'
  | 'pat'
  | 'neko'
  | 'nekoGif'
  | 'meow'
  | 'lizard'
  | 'kiss'
  | 'hug'
  | 'foxGirl'
  | 'feed'
  | 'cuddle'
  | 'kemonomimi'
  | 'holo'
  | 'woof'
  | 'wallpaper'
  | 'goose'
  | 'gecg'
  | 'avatar'
  | 'waifu';

export interface NekosImage {
  url: string;
}

/** Wrapper around nekos.life, instantiated once, with direct category dispatch. */
export class NekosService {
  private readonly client = new NekoClient();

  private readonly getters: Record<NekosCategory, () => Promise<{ url: string }>>;

  constructor(private readonly logger: Logger) {
    const client = this.client;
    this.getters = {
      smug: () => client.smug(),
      baka: () => client.baka(),
      tickle: () => client.tickle(),
      slap: () => client.slap(),
      poke: () => client.poke(),
      pat: () => client.pat(),
      neko: () => client.neko(),
      nekoGif: () => client.nekoGif(),
      meow: () => client.meow(),
      lizard: () => client.lizard(),
      kiss: () => client.kiss(),
      hug: () => client.hug(),
      foxGirl: () => client.foxGirl(),
      feed: () => client.feed(),
      cuddle: () => client.cuddle(),
      kemonomimi: () => client.kemonomimi(),
      holo: () => client.holo(),
      woof: () => client.woof(),
      wallpaper: () => client.wallpaper(),
      goose: () => client.goose(),
      gecg: () => client.gecg(),
      avatar: () => client.avatar(),
      waifu: () => client.waifu(),
    };
  }

  async getImage(category: NekosCategory): Promise<NekosImage> {
    const getter = this.getters[category];
    try {
      return await getter();
    } catch (error) {
      this.logger.warn(`nekos.life failed for category "${category}":`, error);
      throw error;
    }
  }
}
