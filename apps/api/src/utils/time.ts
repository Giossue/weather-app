export const unixToIso = (value: unknown): string | undefined => {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return new Date(value * 1000).toISOString();
};

export const nowIso = () => new Date().toISOString();
