# Deployment

## Prerequisites

- Docker and Docker Compose
- Node.js 20+

## Local development

```bash
# Start Postgres and MinIO
npm run docker:up

# Install dependencies
npm install

# Build shared types
npm run build -w @hayastani/shared

# API setup
cp apps/api/.env.example apps/api/.env
npm run db:push -w @hayastani/api
npm run db:seed -w @hayastani/api

# Run API + web
npm run dev:all
```

- Web: http://localhost:5173
- API: http://localhost:3000/api

### Карта: Google и Яндекс (опционально)

Скопируйте `apps/web/.env.example` в `apps/web/.env` и укажите ключи:

```env
VITE_GOOGLE_MAPS_API_KEY=ваш_ключ_google
VITE_YANDEX_MAPS_API_KEY=ваш_ключ_yandex
```

Колонки **Google** и **Яндекс** в переключателе слоёв появляются только если соответствующий ключ задан. После изменения `.env` перезапустите `npm run dev`.

Без ключей доступны OSM, Esri и Carto.
- MinIO console: http://localhost:9001 (minioadmin / minioadmin)

### Default accounts (seed)

| Email | Password | Role |
|-------|----------|------|
| admin@hayastani.am | admin123 | admin |
| user@hayastani.am | user123 | user |

## Production (Docker Compose)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Set environment variables in `.env.production`:

- `DATABASE_URL`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGIN` (your domain)
- `MEDIA_BASE_URL`

## Staging smoke checklist

1. Open map — markers and clusters load
2. Open `/fortress/amberd` — detail page and SEO meta
3. Register user — submit fortress proposal
4. Login as admin — accept submission, verify on map
5. Post comment on fortress page
6. Check `/admin/audit` for log entries

## Import content

Seed includes 4 curated fortresses + 30 generated entries (34 total).

To re-seed:

```bash
npm run db:seed -w @hayastani/api
```
