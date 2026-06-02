import { Module } from '@nestjs/common'
import { FortressesModule } from '../fortresses/fortresses.module'
import { SubmissionsController } from './submissions.controller'
import { SubmissionsService } from './submissions.service'

@Module({
  imports: [FortressesModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
