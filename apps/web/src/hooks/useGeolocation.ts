export type BrowserCoordinates = {
  latitude: number;
  longitude: number;
};

export type BrowserLocationErrorCode = "UNSUPPORTED" | "INSECURE_CONTEXT" | "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "UNKNOWN";

export class BrowserLocationError extends Error {
  readonly code: BrowserLocationErrorCode;
  readonly rawCode?: number;

  constructor(code: BrowserLocationErrorCode, message: string, rawCode?: number) {
    super(message);
    this.name = "BrowserLocationError";
    this.code = code;
    this.rawCode = rawCode;
  }
}

const getDefaultMessage = (code: BrowserLocationErrorCode) => {
  if (code === "UNSUPPORTED") return "La geolocalización no está disponible en este navegador.";
  if (code === "INSECURE_CONTEXT") return "La geolocalización solo funciona en HTTPS o localhost.";
  if (code === "PERMISSION_DENIED") return "El navegador rechazó el permiso de ubicación.";
  if (code === "POSITION_UNAVAILABLE") return "El navegador no pudo calcular la ubicación actual.";
  if (code === "TIMEOUT") return "La solicitud de ubicación tardó demasiado.";
  return "No se pudo obtener la ubicación.";
};

const normalizeGeolocationError = (error: unknown): BrowserLocationError => {
  if (error instanceof BrowserLocationError) return error;

  const rawCode = error && typeof error === "object" && "code" in error ? Number((error as { code?: number }).code) : undefined;
  const rawMessage = error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string"
    ? (error as { message: string }).message.trim()
    : undefined;

  if (rawCode === 1) return new BrowserLocationError("PERMISSION_DENIED", rawMessage || getDefaultMessage("PERMISSION_DENIED"), rawCode);
  if (rawCode === 2) return new BrowserLocationError("POSITION_UNAVAILABLE", rawMessage || getDefaultMessage("POSITION_UNAVAILABLE"), rawCode);
  if (rawCode === 3) return new BrowserLocationError("TIMEOUT", rawMessage || getDefaultMessage("TIMEOUT"), rawCode);

  return new BrowserLocationError("UNKNOWN", rawMessage || getDefaultMessage("UNKNOWN"), rawCode);
};

const getCurrentPosition = (options: PositionOptions) =>
  new Promise<BrowserCoordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject(error),
      options
    );
  });

export const requestBrowserLocation = async () => {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    throw new BrowserLocationError("INSECURE_CONTEXT", getDefaultMessage("INSECURE_CONTEXT"));
  }

  if (!("geolocation" in navigator)) {
    throw new BrowserLocationError("UNSUPPORTED", getDefaultMessage("UNSUPPORTED"));
  }

  try {
    return await getCurrentPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 1000 * 60 * 10 });
  } catch (error) {
    const locationError = normalizeGeolocationError(error);
    console.warn("Browser geolocation failed", {
      code: locationError.code,
      rawCode: locationError.rawCode,
      message: locationError.message,
      secureContext: typeof window !== "undefined" ? window.isSecureContext : undefined
    });
    throw locationError;
  }
};
