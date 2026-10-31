import { Events, type Client } from 'discord.js';
import { Listener } from '../structures/Listener';
import type { Command } from '../structures/Command';
import type { Logger } from '../core/Logger';

export class ReadyListener extends Listener {
  readonly event = Events.ClientReady;

  constructor(
    private readonly commands: ReadonlyMap<string, Command>,
    private readonly logger: Logger,
  ) {
    super();
  }

  async run(client: Client): Promise<void> {
    if (!client.user || !client.application) return;

    const commands = [...this.commands.values()];
    try {
      await client.application.commands.set(commands.map((command) => command.toJSON()));
    } catch (error) {
      this.logger.error(
        `Failed to register slash commands: ${commands.map((command) => command.name).join(', ')}`,
        error,
      );
      return;
    }
    this.logger.info(`${client.user.username} is online`);
  }
}
