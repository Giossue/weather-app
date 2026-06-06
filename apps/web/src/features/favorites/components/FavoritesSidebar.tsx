import { ArrowDown, ArrowUp, ArrowRight, CheckCircle, Trash } from "@phosphor-icons/react";
import type { FavoriteLocation } from "@weather-app/contracts";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export function FavoritesSidebar({
  favorites,
  activeFavoriteId,
  onSelect,
  onDelete,
  onMove
}: {
  favorites: FavoriteLocation[];
  activeFavoriteId?: string;
  onSelect: (favorite: FavoriteLocation) => void;
  onDelete: (favoriteId: string) => void;
  onMove: (favoriteId: string, direction: "up" | "down") => void;
}) {
  return (
    <aside className="hidden xl:block">
      <Card className="sticky top-6 shadow-none">
        <CardHeader>
          <CardTitle>Favoritos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {favorites.length === 0 && <p className="text-sm text-muted-foreground">Guarda ciudades para cambiar rápido.</p>}
          {favorites.map((favorite, index) => {
            const isActive = favorite.id === activeFavoriteId;
            return (
              <div key={favorite.id} className={`rounded-xl border bg-background/70 p-3 transition hover:border-primary/35 hover:bg-background/90 ${isActive ? "border-primary/50" : ""}`}>
                <button className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => !isActive && onSelect(favorite)}>
                  <p className="font-medium">{favorite.name}</p>
                  <p className="text-sm text-muted-foreground">{[favorite.state, favorite.country].filter(Boolean).join(", ")}</p>
                </button>
                <div className="mt-3 flex items-center gap-1">
                  {isActive ? (
                    <span className="mr-auto inline-flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1.5 text-sm font-medium text-primary">
                      <CheckCircle size={16} weight="fill" /> Actual
                    </span>
                  ) : (
                    <Button size="sm" className="mr-auto" onClick={() => onSelect(favorite)}><ArrowRight size={16} /> Ir</Button>
                  )}
                  <Button size="icon" variant="ghost" aria-label="Subir favorito" disabled={index === 0} onClick={() => onMove(favorite.id, "up")}><ArrowUp size={16} /></Button>
                  <Button size="icon" variant="ghost" aria-label="Bajar favorito" disabled={index === favorites.length - 1} onClick={() => onMove(favorite.id, "down")}><ArrowDown size={16} /></Button>
                  <Button size="icon" variant="ghost" aria-label="Eliminar favorito" onClick={() => onDelete(favorite.id)}><Trash size={16} /></Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </aside>
  );
}
