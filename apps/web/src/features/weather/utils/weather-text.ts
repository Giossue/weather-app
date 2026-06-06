import type { WeatherCondition } from "@weather-app/contracts";

const byConditionId: Record<number, string> = {
  200: "tormenta con lluvia ligera",
  201: "tormenta con lluvia",
  202: "tormenta con lluvia fuerte",
  210: "tormenta ligera",
  211: "tormenta eléctrica",
  212: "tormenta fuerte",
  221: "tormenta irregular",
  230: "tormenta con llovizna ligera",
  231: "tormenta con llovizna",
  232: "tormenta con llovizna fuerte",
  300: "llovizna ligera",
  301: "llovizna",
  302: "llovizna intensa",
  310: "llovizna con lluvia ligera",
  311: "llovizna con lluvia",
  312: "llovizna con lluvia intensa",
  313: "chubascos con llovizna",
  314: "chubascos fuertes con llovizna",
  321: "llovizna irregular",
  500: "lluvia ligera",
  501: "lluvia moderada",
  502: "lluvia intensa",
  503: "lluvia muy intensa",
  504: "lluvia extrema",
  511: "lluvia helada",
  520: "chubascos ligeros",
  521: "chubascos",
  522: "chubascos intensos",
  531: "chubascos irregulares",
  600: "nieve ligera",
  601: "nieve",
  602: "nieve intensa",
  611: "aguanieve",
  612: "aguanieve ligera",
  613: "chubascos de aguanieve",
  615: "lluvia ligera y nieve",
  616: "lluvia y nieve",
  620: "chubascos de nieve ligera",
  621: "chubascos de nieve",
  622: "chubascos de nieve intensa",
  701: "neblina",
  711: "humo",
  721: "bruma",
  731: "remolinos de arena o polvo",
  741: "niebla",
  751: "arena",
  761: "polvo",
  762: "ceniza volcánica",
  771: "rachas fuertes",
  781: "tornado",
  800: "cielo despejado",
  801: "pocas nubes",
  802: "nubes dispersas",
  803: "muy nuboso",
  804: "cielo nublado"
};

const byEnglishDescription: Record<string, string> = {
  "clear sky": "cielo despejado",
  "few clouds": "pocas nubes",
  "scattered clouds": "nubes dispersas",
  "broken clouds": "muy nuboso",
  "overcast clouds": "cielo nublado",
  "light rain": "lluvia ligera",
  "moderate rain": "lluvia moderada",
  "heavy intensity rain": "lluvia intensa",
  "very heavy rain": "lluvia muy intensa",
  "extreme rain": "lluvia extrema",
  "freezing rain": "lluvia helada",
  "light intensity shower rain": "chubascos ligeros",
  "shower rain": "chubascos",
  "heavy intensity shower rain": "chubascos intensos",
  "ragged shower rain": "chubascos irregulares",
  "light intensity drizzle": "llovizna ligera",
  "drizzle": "llovizna",
  "heavy intensity drizzle": "llovizna intensa",
  "thunderstorm": "tormenta eléctrica",
  "light thunderstorm": "tormenta ligera",
  "heavy thunderstorm": "tormenta fuerte",
  "light snow": "nieve ligera",
  "snow": "nieve",
  "heavy snow": "nieve intensa",
  "mist": "neblina",
  "fog": "niebla",
  "haze": "bruma",
  "smoke": "humo",
  "dust": "polvo",
  "sand": "arena",
  "squalls": "rachas fuertes",
  "tornado": "tornado"
};

const byMain: Record<string, string> = {
  thunderstorm: "tormenta eléctrica",
  drizzle: "llovizna",
  rain: "lluvia",
  snow: "nieve",
  mist: "neblina",
  smoke: "humo",
  haze: "bruma",
  dust: "polvo",
  fog: "niebla",
  sand: "arena",
  ash: "ceniza volcánica",
  squall: "rachas fuertes",
  tornado: "tornado",
  clear: "cielo despejado",
  clouds: "nubes"
};

export const capitalizeWeatherText = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const getWeatherDescription = (condition?: WeatherCondition) => {
  if (!condition) return undefined;
  const fromId = byConditionId[condition.id];
  if (fromId) return capitalizeWeatherText(fromId);

  const normalizedDescription = condition.description.trim().toLowerCase();
  const fromDescription = byEnglishDescription[normalizedDescription];
  if (fromDescription) return capitalizeWeatherText(fromDescription);
  if (normalizedDescription && normalizedDescription !== "unknown" && normalizedDescription !== "sin descripción") {
    return capitalizeWeatherText(normalizedDescription);
  }

  const fromMain = byMain[condition.main.trim().toLowerCase()];
  return fromMain ? capitalizeWeatherText(fromMain) : undefined;
};

export const formatUvRisk = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return undefined;
  const rounded = value.toFixed(1);
  if (value < 3) return `${rounded} · Bajo`;
  if (value < 6) return `${rounded} · Moderado`;
  if (value < 8) return `${rounded} · Alto`;
  if (value < 11) return `${rounded} · Muy alto`;
  return `${rounded} · Extremo`;
};
