/** Returns a random integer in the inclusive range [min, max]. */
export const getRandomInt = (min: number, max: number): number => {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

/** Returns a random element of a non-empty array. */
export const pick = <T>(array: readonly T[]): T => {
  if (array.length === 0) {
    throw new Error('Cannot pick from an empty array');
  }
  return array[getRandomInt(0, array.length - 1)];
};

/** Returns a random index of a non-empty array. */
export const pickIndex = <T>(array: readonly T[]): number => {
  if (array.length === 0) {
    throw new Error('Cannot pick an index from an empty array');
  }
  return getRandomInt(0, array.length - 1);
};

/** Returns true with the given probability, where `percent` is in [0, 100]. */
export const chance = (percent: number): boolean => getRandomInt(0, 99) < percent;
