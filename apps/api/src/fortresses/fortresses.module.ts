import { Module } from '@nestjs/common'
import { FortressesController } from './fortresses.controller'
import { FortressesService } from './fortresses.service'

@Module({
  controllers: [FortressesController],
  providers: [FortressesService],
  exports: [FortressesService],
})
export class FortressesModule {}
