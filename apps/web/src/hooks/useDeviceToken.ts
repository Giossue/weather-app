import { useEffect, useState } from "react";

const STORAGE_KEY = "weather:device-token";

export const useDeviceToken = () => {
  const [deviceToken, setDeviceToken] = useState<string>("");

  useEffect(() => {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      setDeviceToken(existing);
      return;
    }
    const generated = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, generated);
    setDeviceToken(generated);
  }, []);

  return deviceToken;
};
