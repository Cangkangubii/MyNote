import {
  Controller,
  Dependencies,
  Get,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@Dependencies(DashboardService)
export class DashboardController {
  constructor(dashboardService) {
    this.dashboardService = dashboardService;
  }

  @Get('summary')
  async getSummary(@CurrentUser() user) {
    const data = await this.dashboardService.getSummary(user.sub);
    return { data };
  }
}
