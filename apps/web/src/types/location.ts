export type SelectedLocation = {
  favoriteId?: string;
  name: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  source: "geolocation" | "search" | "favorite";
};
