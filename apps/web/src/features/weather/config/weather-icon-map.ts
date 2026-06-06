export type WeatherIconResolution = {
  code: string;
  src: string;
  fallbackSrc: string;
  alt: string;
};

const OFFICIAL_CODES = new Set(["01d", "02d", "03d", "04d", "09d", "10d", "11d", "13d", "50d", "01n", "02n", "03n", "04n", "09n", "10n", "11n", "13n", "50n"]);

// Puedes sobreescribir un código con cualquier archivo local sin tocar componentes.
// Ejemplo: CUSTOM_WEATHER_ICON_OVERRIDES["10d"] = "/weather-icons/custom/day/10d.webp";
export const CUSTOM_WEATHER_ICON_OVERRIDES: Partial<Record<string, string>> = {};

const descriptionByCode: Record<string, string> = {
  "01": "cielo despejado",
  "02": "pocas nubes",
  "03": "nubes dispersas",
  "04": "nubosidad abundante",
  "09": "chubascos o llovizna",
  "10": "lluvia",
  "11": "tormenta eléctrica",
  "13": "nieve",
  "50": "neblina o condiciones atmosféricas"
};

export const codeFromCondition = (conditionId?: number) => {
  if (!conditionId) return "03";
  if (conditionId >= 200 && conditionId < 300) return "11";
  if (conditionId >= 300 && conditionId < 400) return "09";
  if (conditionId >= 500 && conditionId < 600) return conditionId === 511 ? "13" : "10";
  if (conditionId >= 600 && conditionId < 700) return "13";
  if (conditionId >= 700 && conditionId < 800) return "50";
  if (conditionId === 800) return "01";
  if (conditionId === 801) return "02";
  if (conditionId === 802) return "03";
  if (conditionId === 803 || conditionId === 804) return "04";
  return "03";
};

export const normalizeWeatherIconCode = (iconCode?: string, conditionId?: number, isNight?: boolean) => {
  const suffix = isNight ? "n" : "d";
  const candidate = iconCode && OFFICIAL_CODES.has(iconCode) ? iconCode : `${codeFromCondition(conditionId)}${suffix}`;
  if (OFFICIAL_CODES.has(candidate)) return candidate;
  return `${codeFromCondition(conditionId)}${suffix}`;
};

export const resolveWeatherIcon = (input: { iconCode?: string; conditionId?: number; isNight?: boolean }): WeatherIconResolution => {
  const code = normalizeWeatherIconCode(input.iconCode, input.conditionId, input.isNight);
  const dayPart = code.endsWith("n") ? "night" : "day";
  const baseCode = code.slice(0, 2);
  const src = CUSTOM_WEATHER_ICON_OVERRIDES[code] ?? `/weather-icons/custom/${dayPart}/${code}.svg`;

  return {
    code,
    src,
    fallbackSrc: `/weather-icons/fallback/${baseCode}.svg`,
    alt: descriptionByCode[baseCode] ?? "estado del clima"
  };
};
