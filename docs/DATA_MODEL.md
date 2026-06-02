# Data model

## Geographic scope

MVP supports three scope categories:

- `republic-of-armenia` — objects inside the current Republic of Armenia
- `artsakh` — Artsakh/Nagorno-Karabakh fortresses
- `historical-armenia` — objects outside current borders but part of historical Armenian geography

This keeps politically and geographically sensitive objects filterable without mixing categories.

## Core entities

### Fortress

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `slug` | string | Stable identifiers |
| `name` | localized text (`hy`, `ru`, `en`) | Required |
| `alternativeNames` | string[] | Search aliases and transliterations |
| `scope` | enum | Geographic scope |
| `coordinates` | `{ lat, lng }` | Map position |
| `coordinateAccuracy` | enum | `exact`, `approximate`, `unverified` |
| `marz`, `nearestSettlement` | localized text | Location context |
| `summary`, `history` | localized text | Short and long descriptions |
| `foundation` | string | Year, century, or period |
| `period` | enum | Historical period |
| `condition` | enum | Preservation state |
| `type` | enum | Fortress subtype |
| `accessibility` | enum | Visit difficulty |
| `routeHint` | localized text | Non-navigational guidance |
| `altitudeMeters` | number? | Optional |
| `evidenceLevel` | enum | Data confidence |
| `features`, `warnings`, `relatedPlaces` | localized text[] | Structured lists |
| `photos` | `PhotoAsset[]` | Media gallery |
| `sources` | `SourceLink[]` | Books, articles, social links |
| `status` | enum | Publication workflow |
| `updatedAt` | date string | Audit metadata |

### PhotoAsset

- file URL
- author / rights holder
- optional capture date
- localized caption
- moderation/publication status
- `isPrimary` flag

### SourceLink

- type: book, article, academic, website, social, video, oral, archive
- title, author, URL, language
- optional editor note

### FortressSubmission

- submittedBy
- proposed fortress payload
- submitter note
- status: `new`, `in-review`, `needs-changes`, `accepted`, `rejected`
- moderator note
- link to published fortress after acceptance

### FortressComment

- fortressId
- author
- body
- status: `published`, `hidden`, `review`
- createdAt

## Suggested database tables

- `users`
- `fortresses`
- `fortress_translations`
- `fortress_photos`
- `fortress_sources`
- `fortress_comments`
- `fortress_submissions`
- `audit_logs`

For PostgreSQL, store coordinates in `geography(Point, 4326)` and index with GiST.
