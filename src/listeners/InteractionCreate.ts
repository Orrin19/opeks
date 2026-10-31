import { Events, type Interaction } from 'discord.js';
import { Listener } from '../structures/Listener';
import type { Command } from '../structures/Command';
import type { AppContext } from '../core/AppContext';

export class InteractionCreateListener extends Listener {
  readonly event = Events.InteractionCreate;

  constructor(
    private readonly commands: ReadonlyMap<string, Command>,
    private readonly ctx: AppContext,
  ) {
    super();
  }

  async run(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      const command = this.commands.get(interaction.commandName);
      if (!command) {
        await interaction
          .reply({ content: 'Command not found', ephemeral: true })
          .catch(() => undefined);
        return;
      }

      try {
        await command.execute(interaction, this.ctx.logger);
      } catch (error) {
        this.ctx.logger.error(`Unhandled error in command "${interaction.commandName}":`, error);
      }
      return;
    }

    if (interaction.isButton()) {
      await this.ctx.services.dice.handleButton(interaction);
    }
  }
}
