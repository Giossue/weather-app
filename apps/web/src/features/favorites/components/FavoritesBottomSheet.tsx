import { ArrowRight, CheckCircle, ListStar } from "@phosphor-icons/react";
import type { FavoriteLocation } from "@weather-app/contracts";
import { Button } from "../../../components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../../components/ui/sheet";

export function FavoritesBottomSheet({ favorites, activeFavoriteId, onSelect }: { favorites: FavoriteLocation[]; activeFavoriteId?: string; onSelect: (favorite: FavoriteLocation) => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 safe-bottom border-t bg-background/92 px-4 py-3 backdrop-blur xl:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="w-full" variant="secondary"><ListStar size={18} /> Favoritos y ubicaciones</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">Favoritos</SheetTitle>
          </SheetHeader>
          <div className="mt-5 grid gap-2 overflow-y-auto pb-6">
            {favorites.length === 0 && <p className="text-sm text-muted-foreground">Aún no tienes favoritos guardados.</p>}
            {favorites.map((favorite) => {
              const isActive = favorite.id === activeFavoriteId;
              return (
                <SheetTrigger asChild key={favorite.id}>
                  <button className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition hover:border-primary/35 hover:bg-accent ${isActive ? "border-primary/50" : ""}`} onClick={() => !isActive && onSelect(favorite)}>
                    <span>
                      <p className="font-medium">{favorite.name}</p>
                      <p className="text-sm text-muted-foreground">{[favorite.state, favorite.country].filter(Boolean).join(", ")}</p>
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary"><CheckCircle size={14} weight="fill" /> Actual</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"><ArrowRight size={14} /> Ir</span>
                    )}
                  </button>
                </SheetTrigger>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
