import { Module } from '@nestjs/common';
import { SepayController } from './sepay.controller';
import { SepayService } from './sepay.services';

@Module({
  controllers: [SepayController],
  providers: [SepayService],
})
export class SepayModule {}