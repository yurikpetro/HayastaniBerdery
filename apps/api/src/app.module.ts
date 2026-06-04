import { Module } from '@nestjs/common'
import { AuditModule } from './audit/audit.module'
import { AuthModule } from './auth/auth.module'
import { CommentsModule } from './comments/comments.module'
import { FortressesModule } from './fortresses/fortresses.module'
import { MediaModule } from './media/media.module'
import { PrismaModule } from './prisma/prisma.module'
import { SubmissionsModule } from './submissions/submissions.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    FortressesModule,
    SubmissionsModule,
    CommentsModule,
    MediaModule,
    AuditModule,
    UsersModule,
  ],
})
export class AppModule {}
