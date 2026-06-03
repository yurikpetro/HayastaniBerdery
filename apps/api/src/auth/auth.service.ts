import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import type { AuthTokens, AuthUser, LoginDto, RegisterDto } from '@hayastani/shared'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens & { user: AuthUser }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    })

    return this.issueTokens(user)
  }

  async login(dto: LoginDto): Promise<AuthTokens & { user: AuthUser }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    return this.issueTokens(user)
  }

  async refresh(refreshToken: string): Promise<AuthTokens & { user: AuthUser }> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh',
      }) as { sub: string }
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user) throw new UnauthorizedException()
      return this.issueTokens(user)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  private issueTokens(user: {
    id: string
    email: string
    name: string
    role: string
  }): AuthTokens & { user: AuthUser } {
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUser['role'],
    }
    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { secret: process.env.JWT_SECRET ?? 'dev-secret', expiresIn: '1h' },
    )
    const refreshToken = this.jwt.sign(
      { sub: user.id },
      { secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh', expiresIn: '7d' },
    )
    return { user: authUser, accessToken, refreshToken }
  }
}
