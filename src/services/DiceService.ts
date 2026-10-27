import { randomUUID } from 'node:crypto';
import type { ParsedModifier, ParsedThreshold } from '../utils/dice';

/** A pending dice-roll request created by a game master for a player. */
export interface DiceRequest {
  id: string;
  min: number;
  max: number;
  purpose: string;
  modifiers: readonly ParsedModifier[];
  /** Single difficulty threshold (mutually exclusive with `thresholds`). */
  difficulty: number | null;
  /** Outcome ranges (mutually exclusive with `difficulty`). */
  thresholds: readonly ParsedThreshold[] | null;
  playerId: string;
}

/**
 * In-memory registry of active dice requests, keyed by the button custom id.
 * Requests live until the player rolls (or the bot restarts).
 */
export class DiceService {
  private readonly requests = new Map<string, DiceRequest>();

  register(request: Omit<DiceRequest, 'id'>): DiceRequest {
    const stored: DiceRequest = { ...request, id: randomUUID() };
    this.requests.set(stored.id, stored);
    return stored;
  }

  get(id: string): DiceRequest | undefined {
    return this.requests.get(id);
  }

  delete(id: string): boolean {
    return this.requests.delete(id);
  }
}
