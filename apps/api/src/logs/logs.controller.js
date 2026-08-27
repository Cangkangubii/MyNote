import {
  Body,
  Controller,
  Dependencies,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { UpsertDailyLogDto } from './dto/upsert-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('logs')
@UseGuards(JwtAuthGuard)
@Dependencies(LogsService)
export class LogsController {
  constructor(logsService) {
    this.logsService = logsService;
  }

  @Get('today')
  async getToday(@CurrentUser() user) {
    const data = await this.logsService.getToday(user.sub);
    return { data };
  }

  @Put('today')
  async upsertToday(@CurrentUser() user, @Body() upsertDto) {
    const data = await this.logsService.upsertToday(user.sub, upsertDto);
    return { data };
  }

  @Get('streak')
  async getStreak(@CurrentUser() user) {
    const data = await this.logsService.getStreak(user.sub);
    return { data };
  }

  @Get()
  async findAll(@CurrentUser() user) {
    const data = await this.logsService.findAll(user.sub);
    return { data };
  }
}
