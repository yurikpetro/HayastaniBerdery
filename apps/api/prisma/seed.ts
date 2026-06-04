import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import type { Fortress } from '@hayastani/shared'
import { seedFortresses } from '../../web/src/data/seed'

const prisma = new PrismaClient()

function enumValue(value: string) {
  return value.replace(/-/g, '_')
}

async function replaceFortress(f: Fortress) {
  await prisma.fortress.deleteMany({ where: { slug: f.slug } })
  const locales = ['hy', 'ru', 'en'] as const
  await prisma.fortress.create({
    data: {
      slug: f.slug,
      scope: enumValue(f.scope) as never,
      lat: f.coordinates.lat,
      lng: f.coordinates.lng,
      coordinateAccuracy: enumValue(f.coordinateAccuracy) as never,
      foundation: f.foundation,
      period: enumValue(f.period) as never,
      condition: enumValue(f.condition) as never,
      type: enumValue(f.type) as never,
      accessibility: enumValue(f.accessibility) as never,
      altitudeMeters: f.altitudeMeters ?? null,
      evidenceLevel: enumValue(f.evidenceLevel) as never,
      alternativeNames: f.alternativeNames,
      status: f.status,
      translations: {
        create: locales.map((locale) => ({
          locale,
          name: f.name[locale],
          summary: f.summary[locale],
          history: f.history[locale],
          marz: f.marz[locale],
          nearestSettlement: f.nearestSettlement[locale],
          routeHint: f.routeHint[locale],
          features: f.features.map((item) => item[locale]),
          warnings: f.warnings.map((item) => item[locale]),
          relatedPlaces: f.relatedPlaces.map((item) => item[locale]),
        })),
      },
      photos: {
        create: f.photos.map((photo) => ({
          url: photo.url,
          author: photo.author,
          takenAt: photo.takenAt,
          captionHy: photo.caption.hy,
          captionRu: photo.caption.ru,
          captionEn: photo.caption.en,
          isPrimary: photo.isPrimary ?? false,
          status: photo.status,
        })),
      },
      sources: {
        create: f.sources.map((source) => ({
          type: source.type,
          title: source.title,
          author: source.author,
          url: source.url,
          language: source.language,
          editorNote: source.editorNote,
        })),
      },
    },
  })
}

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD
  const superAdminName = process.env.SUPER_ADMIN_NAME ?? 'Super Admin'
  if (superAdminEmail && superAdminPassword) {
    await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {
        name: superAdminName,
        passwordHash: await bcrypt.hash(superAdminPassword, 10),
        role: 'super_admin',
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
        bannedById: null,
      },
      create: {
        email: superAdminEmail,
        name: superAdminName,
        passwordHash: await bcrypt.hash(superAdminPassword, 10),
        role: 'super_admin',
      },
    })
  }

  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@hayastani.am' },
    update: {},
    create: {
      email: 'admin@hayastani.am',
      name: 'Admin',
      passwordHash,
      role: 'admin',
    },
  })

  await prisma.user.upsert({
    where: { email: 'user@hayastani.am' },
    update: {},
    create: {
      email: 'user@hayastani.am',
      name: 'Traveler',
      passwordHash: await bcrypt.hash('user123', 10),
      role: 'user',
    },
  })

  const slugs = seedFortresses.map((f) => f.slug)

  for (const fortress of seedFortresses) {
    await replaceFortress(fortress)
  }

  const removed = await prisma.fortress.deleteMany({
    where: { slug: { notIn: slugs } },
  })

  console.log(`Seeded ${seedFortresses.length} fortresses, removed ${removed.count} obsolete entries`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
