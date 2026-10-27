import { Events, type Interaction } from 'discord.js';
import { Listener } from '../structures/Listener';
import type { Command } from '../structures/Command';
import type { Logger } from '../core/Logger';

export class InteractionCreateListener extends Listener {
  readonly event = Events.InteractionCreate;

  constructor(
    private readonly commands: ReadonlyMap<string, Command>,
    private readonly logger: Logger,
  ) {
    super();
  }

  async run(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return;

    const command = this.commands.get(interaction.commandName);
    if (!command) {
      await interaction
        .reply({ content: 'Command not found', ephemeral: true })
        .catch(() => undefined);
      return;
    }

    await command.execute(interaction, this.logger);
  }
}
