import type { ThemePreference } from "@weather-app/contracts";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

export function ThemeSelector({ value, onChange }: { value: ThemePreference; onChange: (value: ThemePreference) => void }) {
  return (
    <div className="grid gap-2">
      <Label>Tema</Label>
      <Select value={value} onValueChange={(next) => onChange(next as ThemePreference)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="system">Según sistema</SelectItem>
          <SelectItem value="light">Claro</SelectItem>
          <SelectItem value="dark">Oscuro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
