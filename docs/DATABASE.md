# Database choice

## Decision (v1)

**PostgreSQL 16** is the production database. **MySQL is not required** for the current MVP and is not planned unless hosting mandates it.

| Option | Status |
|--------|--------|
| PostgreSQL + Prisma | **Active** — `apps/api/prisma/schema.prisma`, Docker `postgres:16` |
| PostGIS | **Deferred** — coordinates are `lat`/`lng` floats; spatial extension not loaded in v1 |
| MySQL | **Not adopted** — no hard hosting constraint; see [MySQL migration](#mysql-migration-deferred) |

## Why PostgreSQL

- Prisma schema uses PostgreSQL features (`alternativeNames` as `String[]`, case-insensitive search via `mode: 'insensitive'`).
- Roadmap: map bbox today; optional PostGIS (`geography`, GiST) and full-text search (`tsvector`) for multilingual names — see [DATA_MODEL.md](DATA_MODEL.md).
- API has no raw SQL tied to a specific engine; switching DB is possible but low value without a hosting requirement.

## Local and production

- **Dev:** `docker compose up -d` → PostgreSQL on `localhost:5432`, credentials in `apps/api/.env.example`.
- **Timeweb Cloud:** managed PostgreSQL via `apps/api/.env.timeweb.example`; see [TIMEWEB_DATABASE.md](TIMEWEB_DATABASE.md).
- **Prod:** `docker-compose.prod.yml` — same engine, set `POSTGRES_PASSWORD` and `DATABASE_URL`.

```bash
npm run docker:up
cp apps/api/.env.example apps/api/.env
npm run db:push -w @hayastani/api
npm run db:seed -w @hayastani/api
```

If you change the Docker image or major Postgres version, existing volume data may be incompatible — back up before upgrading.

## PostGIS (future)

When radius/polygon queries or geometry indexes are needed:

1. Use a PostGIS-enabled image (e.g. `postgis/postgis:16-3.4`) or enable the extension on managed Postgres.
2. Migrate `lat`/`lng` to `geography(Point, 4326)` and add a GiST index.
3. Update map filters in `fortresses.service.ts` to use spatial predicates (`ST_DWithin`, etc.).

Until then, bounding-box filters on `lat`/`lng` are sufficient for the catalog map.

## MySQL migration (deferred)

MySQL 8 + Prisma is feasible for the current API (bbox, JSON fields, enums) but would require:

- Replacing `alternativeNames String[]` with `Json` or a separate table (scalar lists are PostgreSQL-only in Prisma).
- New `DATABASE_URL`, Docker service, and collation check for case-insensitive search.
- Explicit documentation that PostGIS-style GIS would use MySQL spatial types instead.

Revisit only if production hosting provides **only** MySQL (shared hosting, legacy ops). Otherwise stay on PostgreSQL.
