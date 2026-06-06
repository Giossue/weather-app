import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudSun, Sparkle } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import type { FavoriteLocation, LocationResult, Units, UserPreferences, WeatherOverview } from "@weather-app/contracts";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { OfflineBanner } from "../components/common/OfflineBanner";
import { LoadingSkeleton } from "../components/common/LoadingSkeleton";
import { ErrorState } from "../components/common/ErrorState";
import { CurrentLocationButton } from "../features/locations/components/CurrentLocationButton";
import { CitySearchDialog } from "../features/locations/components/CitySearchDialog";
import { LocationDeniedState } from "../features/locations/components/LocationDeniedState";
import { CurrentWeatherHero } from "../features/weather/components/CurrentWeatherHero";
import { WeatherMetricsGrid } from "../features/weather/components/WeatherMetricsGrid";
import { HourlyForecastScroller } from "../features/weather/components/HourlyForecastScroller";
import { DailyForecastList } from "../features/weather/components/DailyForecastList";
import { MinutePrecipitationChart } from "../features/weather/components/MinutePrecipitationChart";
import { QuarterHourlyForecastPanel } from "../features/weather/components/QuarterHourlyForecastPanel";
import { WeatherAlertBanner } from "../features/alerts/components/WeatherAlertBanner";
import { WeatherAlertDialog } from "../features/alerts/components/WeatherAlertDialog";
import { FavoritesSidebar } from "../features/favorites/components/FavoritesSidebar";
import { FavoritesBottomSheet } from "../features/favorites/components/FavoritesBottomSheet";
import { SettingsDialog, type SettingsPatch } from "../features/preferences/components/SettingsDialog";
import { useDeviceToken } from "../hooks/useDeviceToken";
import { BrowserLocationError, requestBrowserLocation } from "../hooks/useGeolocation";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { createFavorite, deleteFavorite, getFavorites, reorderFavorites } from "../services/favorites.service";
import { reverseLocation } from "../services/locations.service";
import { getMinuteForecast, getQuarterHourlyForecast, getWeatherOverview } from "../services/weather.service";
import { getPreferences, updatePreferences } from "../services/preferences.service";
import { useTheme } from "../app/theme";
import type { SelectedLocation } from "../types/location";

const fallbackPreferences: Pick<UserPreferences, "units" | "language" | "theme" | "defaultLocationMode"> = {
  units: "metric",
  language: "es",
  theme: "system",
  defaultLocationMode: "geolocation"
};

type WeatherRequestParams = {
  lat: number;
  lon: number;
  units: Units;
  lang: string;
};

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: string }).code);
    if (code === "OPENWEATHER_API_KEY_MISSING") return "Falta configurar la clave de OpenWeather en apps/api/.env.";
    if (code === "RATE_LIMITED") return "Se alcanzó el límite local de solicitudes. Espera unos segundos antes de intentar nuevamente.";
    if (code === "OPENWEATHER_ERROR" && "message" in error && typeof error.message === "string") return error.message;
  }
  return error instanceof Error ? error.message : "No se pudo obtener la información del clima.";
};

const getLocationErrorMessage = (error: unknown) => {
  if (error instanceof BrowserLocationError) {
    if (error.code === "INSECURE_CONTEXT") return "La ubicación del navegador solo funciona en HTTPS o en localhost. Abre la app desde http://localhost:5173 o usa la búsqueda de ciudad.";
    if (error.code === "UNSUPPORTED") return "Este navegador no soporta geolocalización. Usa la búsqueda de ciudad.";
    if (error.code === "PERMISSION_DENIED") return "Permiso de ubicación rechazado. Actívalo en el navegador o busca una ciudad manualmente.";
    if (error.code === "POSITION_UNAVAILABLE") return "El navegador no pudo calcular tu ubicación. Revisa que la ubicación del sistema esté activada o busca una ciudad manualmente.";
    if (error.code === "TIMEOUT") return "La ubicación tardó demasiado en responder. Intenta de nuevo o busca la ciudad manualmente.";
  }

  return error instanceof Error && error.message.trim().length > 0 ? error.message : "No se pudo obtener la ubicación.";
};

const toSelectedFromLocation = (location: LocationResult): SelectedLocation => ({
  name: location.name,
  state: location.state,
  country: location.country,
  latitude: location.latitude,
  longitude: location.longitude,
  source: "search"
});

const toSelectedFromFavorite = (favorite: FavoriteLocation): SelectedLocation => ({
  favoriteId: favorite.id,
  name: favorite.name,
  state: favorite.state ?? undefined,
  country: favorite.country,
  latitude: favorite.latitude,
  longitude: favorite.longitude,
  source: "favorite"
});

export function WeatherPage() {
  const queryClient = useQueryClient();
  const online = useOnlineStatus();
  const deviceToken = useDeviceToken();
  const { setTheme } = useTheme();
  const [selectedLocation, setSelectedLocation] = useLocalStorageState<SelectedLocation | null>("weather:selected-location", null);
  const [lastOverview, setLastOverview] = useLocalStorageState<WeatherOverview | null>("weather:last-overview", null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showMinute, setShowMinute] = useState(false);
  const [showQuarter, setShowQuarter] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | undefined>();

  const preferencesQuery = useQuery({
    queryKey: ["preferences", deviceToken],
    queryFn: () => getPreferences(deviceToken),
    enabled: Boolean(deviceToken)
  });

  const preferences = preferencesQuery.data?.data ?? fallbackPreferences;

  useEffect(() => {
    if (preferences.theme) setTheme(preferences.theme);
  }, [preferences.theme, setTheme]);

  const weatherParams = useMemo<WeatherRequestParams | null>(() => selectedLocation ? {
    lat: selectedLocation.latitude,
    lon: selectedLocation.longitude,
    units: preferences.units as Units,
    lang: preferences.language
  } : null, [selectedLocation, preferences.units, preferences.language]);

  const overviewQuery = useQuery({
    queryKey: ["weather-overview", weatherParams],
    queryFn: () => getWeatherOverview(weatherParams!),
    enabled: Boolean(weatherParams)
  });

  const refreshOverviewMutation = useMutation({
    mutationFn: (params: WeatherRequestParams) => getWeatherOverview({ ...params, refresh: true }),
    onSuccess: (response, params) => {
      queryClient.setQueryData(["weather-overview", params], response);
      setLastOverview(response);
    }
  });

  useEffect(() => {
    if (overviewQuery.data) setLastOverview(overviewQuery.data);
  }, [overviewQuery.data, setLastOverview]);

  const overview = overviewQuery.data ?? (!online ? lastOverview : null);

  const minuteQuery = useQuery({
    queryKey: ["weather-minutely", weatherParams],
    queryFn: () => getMinuteForecast(weatherParams!),
    enabled: Boolean(weatherParams) && showMinute
  });

  const quarterQuery = useQuery({
    queryKey: ["weather-quarter-hourly", weatherParams],
    queryFn: () => getQuarterHourlyForecast(weatherParams!),
    enabled: Boolean(weatherParams) && showQuarter
  });

  const favoritesQuery = useQuery({
    queryKey: ["favorites", deviceToken],
    queryFn: () => getFavorites(deviceToken),
    enabled: Boolean(deviceToken)
  });

  const favorites = favoritesQuery.data?.data ?? [];
  const activeFavoriteId = selectedLocation
    ? favorites.find((favorite) => {
      if (selectedLocation.favoriteId && favorite.id === selectedLocation.favoriteId) return true;
      const sameCoordinates = Math.abs(favorite.latitude - selectedLocation.latitude) < 0.05 && Math.abs(favorite.longitude - selectedLocation.longitude) < 0.05;
      const normalize = (value?: string | null) => value?.trim().toLocaleLowerCase("es-EC") ?? "";
      const sameName = normalize(favorite.name) === normalize(selectedLocation.name);
      const sameCountry = !selectedLocation.country || normalize(favorite.country) === normalize(selectedLocation.country);
      return sameCoordinates || (sameName && sameCountry);
    })?.id
    : undefined;
  const canSaveSelectedLocation = Boolean(deviceToken) && !favoritesQuery.isFetching && !activeFavoriteId;

  const preferencesMutation = useMutation({
    mutationFn: (patch: SettingsPatch) => updatePreferences(deviceToken, patch),
    onSuccess: (response) => {
      setTheme(response.data.theme);
      queryClient.invalidateQueries({ queryKey: ["preferences", deviceToken] });
      queryClient.invalidateQueries({ queryKey: ["weather-overview"] });
    }
  });

  const addFavoriteMutation = useMutation({
    mutationFn: () => {
      if (!selectedLocation) throw new Error("Selecciona una ubicación primero");
      return createFavorite(deviceToken, {
        name: selectedLocation.name,
        state: selectedLocation.state,
        country: selectedLocation.country ?? "EC",
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", deviceToken] })
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: (favoriteId: string) => deleteFavorite(deviceToken, favoriteId),
    onSuccess: (_response, favoriteId) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", deviceToken] });
      setSelectedLocation((current) => current?.favoriteId === favoriteId ? { ...current, favoriteId: undefined, source: "search" } : current);
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => reorderFavorites(deviceToken, { orderedIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", deviceToken] })
  });

  const handleUseCurrentLocation = async () => {
    setGeoLoading(true);
    setLocationMessage(null);
    try {
      const coordinates = await requestBrowserLocation();
      let nearest: LocationResult | undefined;

      try {
        const reverse = await reverseLocation(coordinates.latitude, coordinates.longitude, 1);
        nearest = reverse.data[0];
      } catch {
        setLocationMessage("Se obtuvo el GPS, pero no se pudo resolver el nombre del lugar. Usaré las coordenadas.");
      }

      setSelectedLocation({
        name: nearest?.name ?? "Ubicación actual",
        state: nearest?.state,
        country: nearest?.country,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        source: "geolocation"
      });
    } catch (error) {
      setLocationMessage(getLocationErrorMessage(error));
    } finally {
      setGeoLoading(false);
    }
  };

  const handleMoveFavorite = (favoriteId: string, direction: "up" | "down") => {
    const index = favorites.findIndex((favorite) => favorite.id === favoriteId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= favorites.length) return;
    const ordered = [...favorites];
    const [item] = ordered.splice(index, 1);
    if (!item) return;
    ordered.splice(target, 0, item);
    reorderMutation.mutate(ordered.map((favorite) => favorite.id));
  };

  const renderWelcome = () => (
    <Card className="motion-reveal weather-glass-card mx-auto max-w-3xl border-primary/20">
      <CardContent className="grid gap-6 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="motion-pop rounded-2xl bg-primary/12 p-3 text-primary"><CloudSun size={34} /></div>
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Consulta el clima a tu ritmo</h1>
            <p className="mt-3 max-w-[62ch] text-muted-foreground">Usamos tu ubicación solo para mostrar el clima cercano. Si prefieres, busca una ciudad manualmente.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <CurrentLocationButton onClick={handleUseCurrentLocation} loading={geoLoading} />
          <CitySearchDialog onSelect={(location) => setSelectedLocation(toSelectedFromLocation(location))} />
        </div>
        {locationMessage && <LocationDeniedState message={locationMessage} />}
      </CardContent>
    </Card>
  );

  return (
    <div className="weather-shell-gradient min-h-[100dvh] pb-28 xl:pb-8">
      <div className="weather-page-container grid gap-5 py-5">
        <header className="motion-reveal flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/72 p-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <div className="motion-pop shrink-0 rounded-xl bg-primary p-2 text-primary-foreground"><Sparkle size={22} weight="fill" /></div>
            <div className="min-w-0">
              <p className="truncate font-semibold">CieloVivo</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CitySearchDialog onSelect={(location) => setSelectedLocation(toSelectedFromLocation(location))} triggerLabel="Cambiar ciudad" />
            <CurrentLocationButton onClick={handleUseCurrentLocation} loading={geoLoading} />
            <SettingsDialog preferences={preferences} onChange={(patch) => preferencesMutation.mutate(patch)} />
          </div>
        </header>

        <OfflineBanner online={online} />

        {!selectedLocation && renderWelcome()}

        {selectedLocation && (
          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="grid min-w-0 gap-5">
              {overviewQuery.isLoading && !overview && <LoadingSkeleton />}
              {overviewQuery.error && !overview && <ErrorState title="Clima no disponible" message={getErrorMessage(overviewQuery.error)} onRetry={() => overviewQuery.refetch()} />}
              {locationMessage && <LocationDeniedState message={locationMessage} />}

              {overview && (
                <>
                  <WeatherAlertBanner alerts={overview.alerts} onSelect={(id) => setSelectedAlertId(id)} />
                  <CurrentWeatherHero
                    current={overview.current}
                    daily={overview.daily[0]}
                    location={selectedLocation}
                    units={preferences.units as Units}
                    wasCached={overview.cache.wasCached || (!online && !overviewQuery.data)}
                    refreshing={overviewQuery.isFetching || refreshOverviewMutation.isPending}
                    canSaveFavorite={canSaveSelectedLocation}
                    savingFavorite={addFavoriteMutation.isPending}
                    onRefresh={() => {
                      if (!weatherParams || refreshOverviewMutation.isPending) return;
                      refreshOverviewMutation.mutate(weatherParams);
                    }}
                    onAddFavorite={() => {
                      if (!canSaveSelectedLocation || addFavoriteMutation.isPending) return;
                      addFavoriteMutation.mutate();
                    }}
                  />
                  <WeatherMetricsGrid current={overview.current} units={preferences.units as Units} />
                  <HourlyForecastScroller items={overview.hourly} timezone={overview.current.timezone} units={preferences.units as Units} />

                  <div className="motion-reveal grid min-w-0 gap-3 sm:grid-cols-2 [--reveal-delay:240ms]">
                    <Button variant={showMinute ? "default" : "outline"} onClick={() => setShowMinute((value) => !value)}>Precipitación inmediata</Button>
                    <Button variant={showQuarter ? "default" : "outline"} onClick={() => setShowQuarter((value) => !value)}>Vista cada 15 minutos</Button>
                  </div>

                  {showMinute && <MinutePrecipitationChart items={minuteQuery.data?.data} fallbackHourly={overview.hourly} timezone={overview.current.timezone} units={preferences.units as Units} loading={minuteQuery.isLoading} />}
                  {showQuarter && <QuarterHourlyForecastPanel items={quarterQuery.data?.data} timezone={overview.current.timezone} units={preferences.units as Units} loading={quarterQuery.isLoading} />}

                  <DailyForecastList items={overview.daily} timezone={overview.current.timezone} units={preferences.units as Units} />
                </>
              )}
            </main>

            <FavoritesSidebar
              favorites={favorites}
              activeFavoriteId={activeFavoriteId}
              onSelect={(favorite) => setSelectedLocation(toSelectedFromFavorite(favorite))}
              onDelete={(favoriteId) => deleteFavoriteMutation.mutate(favoriteId)}
              onMove={handleMoveFavorite}
            />
          </div>
        )}
      </div>

      <FavoritesBottomSheet favorites={favorites} activeFavoriteId={activeFavoriteId} onSelect={(favorite) => setSelectedLocation(toSelectedFromFavorite(favorite))} />
      <WeatherAlertDialog alertId={selectedAlertId} open={Boolean(selectedAlertId)} onOpenChange={(open) => !open && setSelectedAlertId(undefined)} />
    </div>
  );
}
