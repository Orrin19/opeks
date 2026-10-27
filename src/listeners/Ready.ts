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

    await client.application.commands.set(
      [...this.commands.values()].map((command) => command.toJSON()),
    );
    this.logger.info(`${client.user.username} is online`);
  }
}
