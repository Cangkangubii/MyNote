import { Module } from '@nestjs/common';
import { CapturesController } from './captures.controller';
import { CapturesService } from './captures.service';
import { AuthModule } from '../auth/auth.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [AuthModule, TagsModule],
  controllers: [CapturesController],
  providers: [CapturesService],
  exports: [CapturesService],
})
export class CapturesModule {}
