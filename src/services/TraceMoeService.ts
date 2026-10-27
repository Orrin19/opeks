import { TraceMoe } from 'trace.moe.ts';
import type { SearchResponse } from 'trace.moe.ts/dist/structures/SearchResponse';
import type { Logger } from '../core/Logger';

/** Wrapper around trace.moe, instantiated once. */
export class TraceMoeService {
  private readonly api = new TraceMoe();

  constructor(private readonly logger: Logger) {}

  async fetchAnime(link: string): Promise<SearchResponse | null> {
    try {
      return await this.api.fetchAnime(link, { anilistInfo: true });
    } catch (error) {
      this.logger.warn('TraceMoe lookup failed:', error);
      return null;
    }
  }
}
