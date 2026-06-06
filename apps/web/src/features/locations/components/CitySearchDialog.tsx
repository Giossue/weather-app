import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";
import type { LocationResult } from "@weather-app/contracts";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { EmptyState } from "../../../components/common/EmptyState";
import { useDebounce } from "../../../hooks/useDebounce";
import { searchLocations } from "../../../services/locations.service";

export function CitySearchDialog({ onSelect, triggerLabel = "Buscar ciudad" }: { onSelect: (location: LocationResult) => void; triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query.trim(), 350);

  const resultsQuery = useQuery({
    queryKey: ["locations", debounced],
    queryFn: () => searchLocations(debounced, 5),
    enabled: debounced.length >= 2
  });

  const results = resultsQuery.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><MagnifyingGlass size={18} /> {triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buscar ciudad</DialogTitle>
          <DialogDescription>Escribe una ciudad de Ecuador o cualquier ubicación internacional.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="city-search">Ciudad</Label>
          <Input id="city-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Quito, Cuenca, Madrid" autoFocus />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {resultsQuery.isLoading && <p className="py-4 text-sm text-muted-foreground">Buscando coincidencias...</p>}
          {resultsQuery.error && <p className="py-4 text-sm text-destructive">No se pudo buscar la ciudad. Revisa tu conexión o la API key.</p>}
          {!resultsQuery.isLoading && debounced.length >= 2 && results.length === 0 && <EmptyState title="Sin resultados" message="Prueba con otro nombre o incluye el país." />}
          <div className="grid gap-2">
            {results.map((location) => (
              <button
                key={`${location.name}-${location.latitude}-${location.longitude}`}
                className="rounded-xl border p-3 text-left transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  onSelect(location);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <p className="font-medium">{location.name}</p>
                <p className="text-sm text-muted-foreground">{[location.state, location.country].filter(Boolean).join(", ")}</p>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
