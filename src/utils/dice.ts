/**
 * Pure helpers for the game-master dice roll (`/dice`): parsing modifiers and
 * computing the outcome of a roll. Kept side-effect free so they can be unit
 * tested.
 */

export interface ParsedModifier {
  value: number;
  description?: string;
}

export interface DiceOutcome {
  roll: number;
  modifiers: readonly ParsedModifier[];
  modifierTotal: number;
  total: number;
  /** `true`/`false` when a difficulty is set, otherwise `null`. */
  success: boolean | null;
}

const MODIFIER_PATTERN = /^([+-]?\d+)(?:\s+(.+))?$/;

/**
 * Parses a compact modifiers string like `"+1 Ловкость, -2 Усталость"` into
 * `{ value, description }` entries. Malformed chunks are silently skipped.
 */
export const parseModifiers = (raw: string | null | undefined): ParsedModifier[] => {
  if (!raw) return [];

  const modifiers: ParsedModifier[] = [];
  for (const chunk of raw.split(',')) {
    const entry = chunk.trim();
    if (!entry) continue;

    const match = MODIFIER_PATTERN.exec(entry);
    if (!match) continue;

    const value = Number(match[1]);
    if (!Number.isInteger(value)) continue;

    const description = match[2]?.trim();
    modifiers.push(description ? { value, description } : { value });
  }
  return modifiers;
};

/** Sums the numeric values of the given modifiers. */
export const sumModifiers = (modifiers: readonly ParsedModifier[]): number =>
  modifiers.reduce((sum, modifier) => sum + modifier.value, 0);

/** Formats modifiers for display, adding an explicit `+` for positive values. */
export const formatModifiers = (modifiers: readonly ParsedModifier[]): string =>
  modifiers
    .map((modifier) => {
      const sign = modifier.value > 0 ? '+' : '';
      return `${sign}${modifier.value}${modifier.description ? ` ${modifier.description}` : ''}`;
    })
    .join(', ');

/** Computes the full outcome of a roll against an optional difficulty. */
export const computeDiceOutcome = (
  roll: number,
  modifiers: readonly ParsedModifier[],
  difficulty: number | null,
): DiceOutcome => {
  const modifierTotal = sumModifiers(modifiers);
  const total = roll + modifierTotal;

  return {
    roll,
    modifiers,
    modifierTotal,
    total,
    success: difficulty === null ? null : total >= difficulty,
  };
};
