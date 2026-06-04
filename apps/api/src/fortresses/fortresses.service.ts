import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { Fortress, FortressListQuery, PaginatedResult } from '@hayastani/shared'
import { Prisma } from '@prisma/client'
import { mapFortress, scopeFromApi } from '../mappers'
import { PrismaService } from '../prisma/prisma.service'

const include = {
  translations: true,
  photos: true,
  sources: true,
} as const

@Injectable()
export class FortressesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll(query: FortressListQuery): Promise<PaginatedResult<Fortress>> {
    const page = query.page ?? 1
    const limit = Math.min(query.limit ?? 50, 100)
    const where: Prisma.FortressWhereInput = {
      status: query.status ?? 'published',
    }

    if (query.scope) {
      where.scope = scopeFromApi[query.scope]
    }

    if (query.search) {
      where.OR = [
        { slug: { contains: query.search, mode: 'insensitive' } },
        {
          translations: {
            some: { name: { contains: query.search, mode: 'insensitive' } },
          },
        },
      ]
    }

    if (
      query.minLat != null &&
      query.maxLat != null &&
      query.minLng != null &&
      query.maxLng != null
    ) {
      where.lat = { gte: query.minLat, lte: query.maxLat }
      where.lng = { gte: query.minLng, lte: query.maxLng }
    }

    const [records, total] = await Promise.all([
      this.prisma.fortress.findMany({
        where,
        include,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.fortress.count({ where }),
    ])

    return {
      items: records.map(mapFortress),
      total,
      page,
      limit,
    }
  }

  async findBySlug(slug: string): Promise<Fortress> {
    const record = await this.prisma.fortress.findUnique({
      where: { slug },
      include,
    })
    if (!record) throw new NotFoundException('Fortress not found')
    return mapFortress(record)
  }

  async create(payload: Fortress, userId?: string): Promise<Fortress> {
    const record = await this.prisma.fortress.create({
      data: this.buildFortressData(payload),
      include,
    })

    await this.prisma.auditLog.create({
      data: {
        fortressId: record.id,
        userId,
        action: 'fortress.created',
        details: { slug: record.slug },
      },
    })

    return mapFortress(record)
  }

  async replace(id: string, payload: Fortress, userId?: string): Promise<Fortress> {
    const existing = await this.prisma.fortress.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Fortress not found')

    await this.prisma.$transaction([
      this.prisma.fortressTranslation.deleteMany({ where: { fortressId: id } }),
      this.prisma.fortressPhoto.deleteMany({ where: { fortressId: id } }),
      this.prisma.fortressSource.deleteMany({ where: { fortressId: id } }),
    ])

    const record = await this.prisma.fortress.update({
      where: { id },
      data: this.buildFortressData({ ...payload, id }),
      include,
    })

    await this.prisma.auditLog.create({
      data: {
        fortressId: id,
        userId,
        action: 'fortress.updated',
        details: { slug: record.slug },
      },
    })

    return mapFortress(record)
  }

  async remove(id: string, userId?: string): Promise<{ id: string; deleted: true }> {
    const existing = await this.prisma.fortress.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Fortress not found')

    await this.prisma.$transaction([
      this.prisma.auditLog.create({
        data: {
          fortressId: id,
          userId,
          action: 'fortress.deleted',
          details: { slug: existing.slug },
        },
      }),
      this.prisma.fortress.delete({ where: { id } }),
    ])

    return { id, deleted: true }
  }

  private buildFortressData(payload: Fortress): Prisma.FortressCreateInput {
    const locales = ['hy', 'ru', 'en'] as const
    return {
      slug: payload.slug,
      scope: scopeFromApi[payload.scope],
      lat: payload.coordinates.lat,
      lng: payload.coordinates.lng,
      coordinateAccuracy: payload.coordinateAccuracy.replace(/-/g, '_') as never,
      foundation: payload.foundation,
      period: payload.period.replace(/-/g, '_') as never,
      condition: payload.condition.replace(/-/g, '_') as never,
      type: payload.type.replace(/-/g, '_') as never,
      accessibility: payload.accessibility.replace(/-/g, '_') as never,
      altitudeMeters: payload.altitudeMeters ?? null,
      evidenceLevel: payload.evidenceLevel.replace(/-/g, '_') as never,
      alternativeNames: payload.alternativeNames,
      status: payload.status,
      translations: {
        create: locales.map((locale) => ({
          locale,
          name: payload.name[locale],
          summary: payload.summary[locale],
          history: payload.history[locale],
          marz: payload.marz[locale],
          nearestSettlement: payload.nearestSettlement[locale],
          routeHint: payload.routeHint[locale],
          features: payload.features.map((f) => f[locale]),
          warnings: payload.warnings.map((w) => w[locale]),
          relatedPlaces: payload.relatedPlaces.map((r) => r[locale]),
        })),
      },
      photos: {
        create: payload.photos.map((photo) => ({
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
        create: payload.sources.map((source) => ({
          type: source.type,
          title: source.title,
          author: source.author,
          url: source.url,
          language: source.language,
          editorNote: source.editorNote,
        })),
      },
    }
  }
}
