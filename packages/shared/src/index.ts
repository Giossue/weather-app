export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const roundTo = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const compactObject = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null)) as Partial<T>;

export const secondsToMilliseconds = (seconds: number) => seconds * 1000;
