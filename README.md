# CieloVivo

CieloVivo es una aplicación meteorológica web para consultar clima actual, pronósticos y alertas. Está pensada como una PWA responsive, con favoritos por dispositivo, modo offline básico y caché de datos para reducir llamadas externas.

## Características

- Clima actual con ubicación, temperatura, sensación térmica, amanecer y atardecer.
- Pronóstico por hora y pronóstico diario.
- Paneles opcionales de precipitación inmediata y vista cada 15 minutos.
- Alertas meteorológicas cuando están disponibles.
- Favoritos y preferencias guardados por dispositivo.
- PWA con service worker, manifest y soporte offline básico.
- Caché de clima en backend para evitar consumo innecesario de la API externa.
- Interfaz responsive con iconografía meteorológica personalizada.

## Stack técnico

- React + TypeScript + Vite.
- Bun.
- Hono.
- PostgreSQL.
- Drizzle ORM.
- Zod.
- TanStack Query.
- Tailwind CSS.
- Docker.

## Arquitectura

```text
apps/
  api/        Backend Hono, OpenWeather, caché, favoritos y preferencias
  web/        Frontend React/Vite, PWA y componentes UI
packages/
  config/     Constantes compartidas
  contracts/  Schemas Zod y tipos compartidos
  db/         Esquema de base de datos
  shared/     Utilidades compartidas
```

El frontend no llama directamente a OpenWeather. Todas las solicitudes pasan por el backend, donde se validan, normalizan y cachean las respuestas.

## Variables principales

Backend:

```env
DATABASE_URL=postgresql://weather_app:weather_app@localhost:5432/weather_app
OPENWEATHER_API_KEY=replace-with-your-openweather-key
OPENWEATHER_BASE_URL=https://api.openweathermap.org
CORS_ORIGIN=http://localhost:5173
WEATHER_CACHE_TTL_SECONDS=1800
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=60
DEFAULT_LANGUAGE=es
DEFAULT_UNITS=metric
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:3001
```

En producción, `VITE_API_BASE_URL` puede quedar vacío si el frontend y la API se sirven bajo el mismo dominio con un proxy para `/api`.

## Uso local

```bash
bun install
bun run db:up
bun run db:migrate
bun run dev
```

Servicios por defecto:

- Web: `http://localhost:5173`
- API: `http://localhost:3001`

## Docker

El proyecto incluye configuración Docker para levantar frontend, backend y PostgreSQL:

```bash
cp .env.example .env
docker compose up --build
```

Por defecto la app queda disponible en:

```text
http://localhost:8080
```

## Scripts

```bash
bun run dev
bun run test
bun run lint
bun run build
bun run docker:up
bun run docker:down
```

## Caché

El backend guarda datos meteorológicos normalizados en PostgreSQL. El TTL por defecto es de 30 minutos:

```env
WEATHER_CACHE_TTL_SECONDS=1800
```

Recargar el navegador no fuerza una llamada nueva a OpenWeather mientras la caché esté vigente. El botón `Actualizar` sí fuerza una consulta nueva y reemplaza la caché.

## Seguridad

- La clave `OPENWEATHER_API_KEY` solo debe vivir en el backend.
- Los archivos `.env` reales no deben subirse al repositorio.
- El backend valida entradas con Zod.
- La API incluye rate limit básico.
- Las respuestas externas se normalizan antes de llegar al frontend.

## Licencia

Proyecto privado/educativo. Ajusta la licencia según el uso que quieras darle.
