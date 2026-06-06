import { Route, Routes } from "react-router-dom";
import { AppProviders } from "./providers";
import { WeatherPage } from "../routes/WeatherPage";

export function App() {
  return (
    <AppProviders>
      <Routes>
        <Route path="/" element={<WeatherPage />} />
      </Routes>
    </AppProviders>
  );
}
