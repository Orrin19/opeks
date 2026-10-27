/**
 * Pure helpers for the game-master dice roll (`/dice`): parsing modifiers and
 * computing the outcome of a roll. Kept side-effect free so they can be unit
 * tested.
 */

export interface ParsedModifier {
  value: number;
  description?: string;
}

/** An inclusive outcome range: totals within `[min, max]` map to `result`. */
export interface ParsedThreshold {
  min: number;
  max: number;
  result: string;
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
const THRESHOLD_PATTERN = /^(\d+)\s*-\s*(\d+)\s*:\s*(.+)$/;

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

/**
 * Parses a compact thresholds string like
 * `"1-5:провал; 6-15:частичный успех; 16-20:полный успех"` into outcome ranges.
 * Malformed or inverted (`min > max`) chunks are silently skipped. The result is
 * sorted ascending so the first/last entries are the lowest/highest ranges.
 */
export const parseThresholds = (raw: string | null | undefined): ParsedThreshold[] => {
  if (!raw) return [];

  const thresholds: ParsedThreshold[] = [];
  for (const chunk of raw.split(';')) {
    const entry = chunk.trim();
    if (!entry) continue;

    const match = THRESHOLD_PATTERN.exec(entry);
    if (!match) continue;

    const min = Number(match[1]);
    const max = Number(match[2]);
    const result = match[3].trim();
    if (!Number.isInteger(min) || !Number.isInteger(max) || !result || min > max) continue;

    thresholds.push({ min, max, result });
  }
  return thresholds.sort((a, b) => a.min - b.min || a.max - b.max);
};

/**
 * Resolves `total` to a range. The first and last ranges are treated as
 * open-ended: totals below the lowest `min` map to the lowest range and totals
 * above the highest `max` map to the highest range, so modifiers can never push
 * a result "outside" the configured ranges. Returns `null` only when `total`
 * falls into an uncovered gap between non-contiguous ranges.
 */
export const resolveThreshold = (
  total: number,
  thresholds: readonly ParsedThreshold[],
): ParsedThreshold | null => {
  if (thresholds.length === 0) return null;

  const minBound = Math.min(...thresholds.map((t) => t.min));
  const maxBound = Math.max(...thresholds.map((t) => t.max));

  if (total < minBound) {
    return thresholds.find((t) => t.min === minBound) ?? thresholds[0];
  }
  if (total > maxBound) {
    return thresholds.find((t) => t.max === maxBound) ?? thresholds[thresholds.length - 1];
  }
  return thresholds.find((t) => total >= t.min && total <= t.max) ?? null;
};

/** Formats thresholds for display, one range per line. */
export const formatThresholds = (thresholds: readonly ParsedThreshold[]): string =>
  thresholds.map((t) => `${t.min}–${t.max}: ${t.result}`).join('\n');
