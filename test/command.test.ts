import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PermissionsBitField, type ChatInputCommandInteraction } from 'discord.js';
import { ChatInputCommand } from '../src/structures/ChatInputCommand';

class PublicCommand extends ChatInputCommand {
  readonly name = 'public';
  readonly description = 'A command available to everyone';
  async run(_interaction: ChatInputCommandInteraction): Promise<void> {}
}

class ModeratorCommand extends ChatInputCommand {
  readonly name = 'moderator';
  readonly description = 'A moderator command';
  readonly defaultMemberPermissions = PermissionsBitField.Flags.ManageMessages;
  async run(_interaction: ChatInputCommandInteraction): Promise<void> {}
}

test('ChatInputCommand.toJSON sends null (everyone) when no defaultMemberPermissions is set', () => {
  const json = new PublicCommand().toJSON();
  // `undefined` would be serialized by discord.js as `"0"`, which Discord treats
  // as "admin-only" (see Application Command Permissions docs). Must be `null`.
  assert.equal(json.defaultMemberPermissions, null);
});

test('ChatInputCommand.toJSON preserves an explicit defaultMemberPermissions', () => {
  const json = new ModeratorCommand().toJSON();
  assert.equal(json.defaultMemberPermissions, PermissionsBitField.Flags.ManageMessages);
});
