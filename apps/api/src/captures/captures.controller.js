import {
  Body,
  Controller,
  Delete,
  Dependencies,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CapturesService } from './captures.service';
import { CreateCaptureDto } from './dto/create-capture.dto';
import { ResolveCaptureDto } from './dto/resolve-capture.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('captures')
@UseGuards(JwtAuthGuard)
@Dependencies(CapturesService)
export class CapturesController {
  constructor(capturesService) {
    this.capturesService = capturesService;
  }

  @Post()
  async create(@CurrentUser() user, @Body() createCaptureDto) {
    const data = await this.capturesService.create(user.sub, createCaptureDto.content);
    return { data };
  }

  @Get()
  async findAll(@CurrentUser() user, @Query('status') status) {
    const data = await this.capturesService.findAll(user.sub, status);
    return { data };
  }

  @Delete(':id')
  async delete(@CurrentUser() user, @Param('id') id) {
    return this.capturesService.delete(user.sub, id);
  }

  @Post(':id/resolve')
  async resolve(
    @CurrentUser() user,
    @Param('id') id,
    @Body() resolveDto
  ) {
    const data = await this.capturesService.resolve(user.sub, id, resolveDto);
    return { data };
  }
}
