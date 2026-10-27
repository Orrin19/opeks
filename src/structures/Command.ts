import type { ApplicationCommandData, Interaction } from 'discord.js';
import type { Logger } from '../core/Logger';

/**
 * Base class for every application command (slash and context menu).
 * A command owns its own registration data (`toJSON`) and execution logic.
 */
export abstract class Command {
  abstract readonly name: string;

  /** Serializes the command for registration via the Discord API. */
  abstract toJSON(): ApplicationCommandData;

  /**
   * Entry point invoked by the interaction handler.
   * Handles deferring and error reporting; delegates to the command's `run`.
   */
  abstract execute(interaction: Interaction, logger: Logger): Promise<void>;
}
