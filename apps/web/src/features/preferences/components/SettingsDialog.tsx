import { Gear } from "@phosphor-icons/react";
import type { ThemePreference, Units, UserPreferences } from "@weather-app/contracts";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { UnitsSelector } from "./UnitsSelector";
import { ThemeSelector } from "./ThemeSelector";

export type SettingsPatch = Partial<Pick<UserPreferences, "units" | "theme" | "defaultLocationMode">>;

export function SettingsDialog({ preferences, onChange }: { preferences: Pick<UserPreferences, "units" | "theme" | "defaultLocationMode">; onChange: (patch: SettingsPatch) => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Abrir preferencias"><Gear size={20} /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preferencias</DialogTitle>
          <DialogDescription>Personaliza unidades, tema y ubicación predeterminada.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          <UnitsSelector value={preferences.units as Units} onChange={(units) => onChange({ units })} />
          <ThemeSelector value={preferences.theme as ThemePreference} onChange={(theme) => onChange({ theme })} />
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div>
              <Label>Ubicación predeterminada</Label>
              <p className="mt-1 text-sm text-muted-foreground">Usar GPS al abrir o tu favorito predeterminado cuando exista.</p>
            </div>
            <Switch
              checked={preferences.defaultLocationMode === "favorite"}
              onCheckedChange={(checked) => onChange({ defaultLocationMode: checked ? "favorite" : "geolocation" })}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
