import type { Client, Events } from 'discord.js';

export abstract class Listener {
  abstract readonly event: Events;

  abstract run(...args: unknown[]): void | Promise<void>;
}

type EventEmitterLike = {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
};

/** Registers a listener on the client, bridging the generic emitter signature. */
export const registerListener = (client: Client, listener: Listener): void => {
  (client as unknown as EventEmitterLike).on(listener.event, (...args: unknown[]) => {
    void Promise.resolve(listener.run(...args)).catch((error: unknown) => {
      // Last-resort guard: a listener error must never crash the process.
      console.error(`Listener "${listener.event}" failed:`, error);
    });
  });
};
