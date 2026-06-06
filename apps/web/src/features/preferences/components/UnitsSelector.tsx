import type { Units } from "@weather-app/contracts";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

export function UnitsSelector({ value, onChange }: { value: Units; onChange: (value: Units) => void }) {
  return (
    <div className="grid gap-2">
      <Label>Unidades</Label>
      <Select value={value} onValueChange={(next) => onChange(next as Units)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="metric">Métricas</SelectItem>
          <SelectItem value="imperial">Imperiales</SelectItem>
          <SelectItem value="standard">Kelvin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
