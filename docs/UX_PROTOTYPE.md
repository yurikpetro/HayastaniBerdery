# UX prototype

The runnable prototype in `src/App.tsx` covers the MVP screens defined in the specification.

## Main map screen

- left sidebar: search, geographic scope filter, fortress list
- center: interactive Leaflet map with markers and popups
- right column: fortress detail card

## Catalog screen

- card grid of published fortresses
- quick jump back to map/detail view

## Fortress detail card

- hero photo
- multilingual title and alternative names
- metadata grid: region, settlement, foundation, condition, coordinates, scope, period, type, accessibility
- history, route hint, features, warnings
- sources and social/video links
- comments block with add-comment form

## Submission screen

- user fills multilingual names, coordinates, descriptions, source note, social link
- submission enters moderation queue

## Admin screen

- list of pending submissions
- actions: accept and publish, request changes, reject with note

## Supporting screens

- moderation rules
- technical build plan

## Design intent

The visual language uses warm stone/paper tones to fit a heritage project rather than a generic SaaS dashboard. The map remains the primary entry point, matching the PastVu-inspired product direction.
