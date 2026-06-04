# MVP build plan

## Scope

Deliver a public fortress registry with:

- interactive map
- fortress detail pages
- multilingual UI (`hy`, `ru`, `en`)
- user submissions
- comments
- admin moderation queue

## Recommended stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Fast iteration, strong map ecosystem |
| Map | Leaflet + react-leaflet | PastVu-like interaction, easy clustering later |
| Backend | Node.js + Express or NestJS | Good fit for CRUD + moderation APIs |
| Database | PostgreSQL 16 (PostGIS optional later) | Coordinates, bbox filters; full-text / spatial when needed — see [DATABASE.md](DATABASE.md) |
| Media | S3-compatible storage | Photo uploads and resizing |
| Auth | Email/password or OAuth | Required for submissions and comments |

## Delivery phases

### Phase 1 — Design (1-2 weeks)

- finalize data model
- UX prototype for map, fortress page, submission form, admin queue
- moderation/content policy
- seed list of first 30-50 fortresses

### Phase 2 — MVP implementation (4-6 weeks)

Week 1-2:

- project setup
- auth and roles
- fortress CRUD API
- map + catalog frontend

Week 3-4:

- fortress detail page
- photo upload pipeline
- submission workflow
- admin moderation screens

Week 5-6:

- comments
- i18n completion
- audit log
- QA, performance pass, deployment

### Phase 3 — Content and launch

- import verified fortresses manually
- mark uncertain data clearly
- add public links to Harutyun Hakobyan materials where available
- open registration and submissions

## MVP acceptance criteria

- guest can browse map and open fortress cards
- admin can publish/edit fortresses
- registered user can submit a fortress proposal
- admin can accept/edit/reject proposals
- user can comment on fortress pages
- UI works in Armenian, Russian, and English
- evidence level and coordinate accuracy are visible

## Post-MVP backlog

- marker clustering
- shareable map URLs
- correction proposals for existing cards
- regional moderators
- import tools from books/social archives
- mobile-first route notes and offline export
