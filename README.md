# Cartonero

Simulador de vida en texto y tarjetas. Arrancás como cartonero en la base de la pirámide social argentina y podés subir por el rubro, meterte en política o pasar a tech.

## Stack

- Next.js App Router + TypeScript + Tailwind
- Motor de juego en el cliente (Zustand + `localStorage`)
- Neon Postgres opcional vía Drizzle (`/api/save`)
- Deploy en Vercel

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

La partida se guarda sola en `localStorage`. Sin `DATABASE_URL` el sync a Neon responde 503 y el juego sigue igual.

## Neon (opcional)

1. En Vercel: `vercel integration add neon` (o creá un proyecto en [Neon](https://neon.tech) y copiá la connection string).
2. Copiá `.env.example` → `.env.local` y seteá `DATABASE_URL`.
3. Creá la tabla:

```bash
npm run db:push
```

O ejecutá el SQL en [`drizzle/0000_game_saves.sql`](drizzle/0000_game_saves.sql).

Endpoints:

- `GET /api/save?player_key=...`
- `POST /api/save` con `{ "player_key": "...", "state": { ... } }`

## Deploy en Vercel

```bash
npx vercel
```

Agregá `DATABASE_URL` en Project Settings → Environment Variables si querés cloud save. Sin eso, el MVP funciona solo con almacenamiento local del browser.

## Cómo se juega

1. **Avanzar Mes** — cobrás el sueldo, sube el estrés y cae un evento.
2. Elegí una de las **3 opciones** de la tarjeta.
3. En el pie, **Cambiar trabajo** cuando cumplas requisitos (plata, capital social, flags como `curso_n8n`).

## Contenido MVP

- Ramas en `src/data/jobs.json`: cartonero, política, tech
- Eventos en `src/data/events.json`: tragedia, burnout, caños, corrupción, cursito n8n

## Estructura

```
src/
  app/           # UI + API save
  components/    # StatusBar, EventCard, JobPanel…
  data/          # jobs.json, events.json
  lib/           # motor, store, db
```
