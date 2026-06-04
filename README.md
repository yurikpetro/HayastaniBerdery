# HayBerd

Interactive map and public registry of Armenian fortresses — v1 production stack.

## Stack

- **Web:** React, Vite, Tailwind, React Router, TanStack Query, react-i18next, Leaflet + marker clustering
- **API:** NestJS, Prisma, PostgreSQL, JWT auth
- **Monorepo:** `apps/web`, `apps/api`, `packages/shared`

## Quick start

```bash
npm run docker:up
npm install
npm run build -w @hayastani/shared
cp apps/api/.env.example apps/api/.env
npm run db:push -w @hayastani/api
npm run db:seed -w @hayastani/api
npm run dev:all
```

Open http://localhost:5173

**Admin:** `admin@hayastani.am` / `admin123`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Web only |
| `npm run dev:api` | API only |
| `npm run dev:all` | API + web |
| `npm run build` | Build all packages |
| `npm run db:seed` | Seed database (20 fortresses) |

## Documentation

- [Database (PostgreSQL vs MySQL)](docs/DATABASE.md)
- [Data model](docs/DATA_MODEL.md)
- [Moderation](docs/MODERATION.md)
- [Deployment](docs/DEPLOYMENT.md)
- [UX prototype notes](docs/UX_PROTOTYPE.md)

## Features (v1)

- Full-screen map with clustered markers and deep links
- Fortress pages with gallery, sources, mini-map, SEO
- Catalog with filters by geographic scope
- User registration, submissions, comments
- Admin panel: submissions queue, fortress list, audit log
- Armenian, Russian, English UI
