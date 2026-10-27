import sagiri from 'sagiri';
import type { Config } from '../config/env';
import type { Logger } from '../core/Logger';

export interface SauceResult {
  url: string;
  site: string;
  similarity: number;
  thumbnail: string;
  authorName: string;
}

type SauceClient = ReturnType<typeof sagiri>;

/** Wrapper around SauceNAO (via `sagiri`), instantiated once. */
export class SauceService {
  private readonly client?: SauceClient;

  constructor(config: Config, private readonly logger: Logger) {
    if (config.sauceToken) {
      this.client = sagiri(config.sauceToken);
    } else {
      this.logger.warn('SAUCE_TOKEN is not set; /sauce will be unavailable');
    }
  }

  get available(): boolean {
    return this.client !== undefined;
  }

  async search(url: string): Promise<SauceResult | null> {
    if (!this.client) {
      throw new Error('SAUCE_TOKEN не задан');
    }
    const results = await this.client(url);
    const result = results[0];
    if (!result) return null;

    return {
      url: result.url,
      site: result.site,
      similarity: result.similarity,
      thumbnail: result.thumbnail,
      authorName: result.authorName,
    };
  }
}
