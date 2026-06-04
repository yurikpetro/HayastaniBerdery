export type Locale = 'hy' | 'ru' | 'en'

export type LocalizedText = Record<Locale, string>

export type GeographicScope =
  | 'republic-of-armenia'
  | 'artsakh'
  | 'historical-armenia'

export type PublicationStatus =
  | 'draft'
  | 'review'
  | 'published'
  | 'rejected'
  | 'archived'

export type CoordinateAccuracy = 'exact' | 'approximate' | 'unverified'

export type EvidenceLevel =
  | 'verified'
  | 'partially-verified'
  | 'oral'
  | 'needs-research'

export type AccessibilityLevel = 'easy' | 'moderate' | 'hard' | 'guide-required'

export type FortressCondition =
  | 'preserved'
  | 'ruins'
  | 'fragments'
  | 'poorly-studied'
  | 'inaccessible'

export type HistoricalPeriod =
  | 'bronze-age'
  | 'urartian'
  | 'antique'
  | 'early-medieval'
  | 'medieval'
  | 'late-medieval'
  | 'unknown'

export type FortressType =
  | 'fortress'
  | 'fortified-settlement'
  | 'citadel'
  | 'tower'
  | 'fortified-monastery'
  | 'defensive-wall'

export type SourceType =
  | 'book'
  | 'article'
  | 'academic'
  | 'website'
  | 'social'
  | 'video'
  | 'oral'
  | 'archive'

export type SubmissionStatus =
  | 'new'
  | 'in-review'
  | 'needs-changes'
  | 'accepted'
  | 'rejected'

export type CommentStatus = 'published' | 'hidden' | 'review'

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'

export interface Coordinates {
  lat: number
  lng: number
}

export interface PhotoAsset {
  id: string
  url: string
  author: string
  takenAt?: string
  caption: LocalizedText
  isPrimary?: boolean
  status: PublicationStatus
}

export interface SourceLink {
  id: string
  type: SourceType
  title: string
  author?: string
  url?: string
  language: Locale | 'other'
  editorNote?: string
}

export interface FortressComment {
  id: string
  fortressId: string
  parentId?: string | null
  author: string
  body: string
  status: CommentStatus
  createdAt: string
}

export interface AdminComment extends FortressComment {
  fortressSlug?: string
  userId?: string | null
  userEmail?: string | null
}

export interface Fortress {
  id: string
  slug: string
  name: LocalizedText
  alternativeNames: string[]
  scope: GeographicScope
  coordinates: Coordinates
  coordinateAccuracy: CoordinateAccuracy
  marz: LocalizedText
  nearestSettlement: LocalizedText
  summary: LocalizedText
  history: LocalizedText
  foundation: string
  period: HistoricalPeriod
  condition: FortressCondition
  type: FortressType
  accessibility: AccessibilityLevel
  routeHint: LocalizedText
  altitudeMeters?: number
  evidenceLevel: EvidenceLevel
  features: LocalizedText[]
  warnings: LocalizedText[]
  relatedPlaces: LocalizedText[]
  photos: PhotoAsset[]
  sources: SourceLink[]
  status: PublicationStatus
  updatedAt: string
}

export interface FortressSubmission {
  id: string
  submittedBy: string
  status: SubmissionStatus
  proposedFortress: Fortress
  submitterNote: string
  moderatorNote?: string
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  isBanned?: boolean
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  isBanned: boolean
  bannedAt?: string
  bannedReason?: string
  bannedBy?: Pick<AuthUser, 'id' | 'email' | 'name'> | null
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  commentsCount?: number
  submissionsCount?: number
  auditLogsCount?: number
  comments?: AdminUserComment[]
  submissions?: AdminUserSubmission[]
  adminActions?: AdminUserAction[]
}

export interface AdminUserComment {
  id: string
  fortressId: string
  fortressSlug: string
  fortressName: LocalizedText
  parentId?: string | null
  body: string
  status: CommentStatus
  createdAt: string
}

export interface AdminUserSubmission {
  id: string
  status: SubmissionStatus
  proposedFortressName: LocalizedText
  proposedFortressSummary: LocalizedText
  proposedFortressSlug: string
  createdAt: string
  moderatorNote?: string
}

export interface AdminUserAction {
  id: string
  action: string
  fortressSlug?: string | null
  fortressName?: LocalizedText | null
  details?: unknown
  createdAt: string
}

export interface UserListQuery {
  search?: string
  role?: UserRole
  banned?: boolean
  page?: number
  limit?: number
}

export interface UpdateUserRoleDto {
  role: UserRole
}

export interface BanUserDto {
  reason?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name: string
}

export { MAX_COMMENT_BODY_LENGTH, sanitizeCommentBody } from './commentBody'

export interface CreateCommentDto {
  body: string
  parentId?: string
}

export interface CreateSubmissionDto {
  submitterNote: string
  proposedFortress: Omit<Fortress, 'id' | 'updatedAt' | 'status'>
}

export interface FortressListQuery {
  scope?: GeographicScope
  search?: string
  status?: PublicationStatus
  minLat?: number
  maxLat?: number
  minLng?: number
  maxLng?: number
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
