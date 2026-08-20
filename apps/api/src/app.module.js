import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CapturesModule } from './captures/captures.module';
import { TasksModule } from './tasks/tasks.module';
import { NotesModule } from './notes/notes.module';
import { LogsModule } from './logs/logs.module';
import { TagsModule } from './tags/tags.module';
import { SearchModule } from './search/search.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CapturesModule,
    TasksModule,
    NotesModule,
    LogsModule,
    TagsModule,
    SearchModule,
    DashboardModule,
  ],
  controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
