import {
  Body,
  Controller,
  Delete,
  Dependencies,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('tags')
@UseGuards(JwtAuthGuard)
@Dependencies(TagsService)
export class TagsController {
  constructor(tagsService) {
    this.tagsService = tagsService;
  }

  @Get()
  async findAll(@CurrentUser() user) {
    const data = await this.tagsService.findAll(user.sub);
    return { data };
  }

  @Post()
  async create(@CurrentUser() user, @Body() createTagDto) {
    const data = await this.tagsService.create(user.sub, createTagDto.name);
    return { data };
  }

  @Delete(':id')
  async delete(@CurrentUser() user, @Param('id') id) {
    return this.tagsService.delete(user.sub, id);
  }
}
