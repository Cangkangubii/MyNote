import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuthModule } from '../auth/auth.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [AuthModule, LogsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
