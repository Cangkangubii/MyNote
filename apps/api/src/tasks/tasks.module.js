import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AuthModule } from '../auth/auth.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [AuthModule, TagsModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
