import {
  Body,
  Controller,
  Delete,
  Dependencies,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
@Dependencies(NotesService)
export class NotesController {
  constructor(notesService) {
    this.notesService = notesService;
  }

  @Get()
  async findAll(@CurrentUser() user, @Query('tag') tag) {
    const data = await this.notesService.findAll(user.sub, { tag });
    return { data };
  }

  @Get(':id')
  async findOne(@CurrentUser() user, @Param('id') id) {
    const data = await this.notesService.findOne(user.sub, id);
    return { data };
  }

  @Post()
  async create(@CurrentUser() user, @Body() createNoteDto) {
    const data = await this.notesService.create(user.sub, createNoteDto);
    return { data };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user,
    @Param('id') id,
    @Body() updateNoteDto
  ) {
    const data = await this.notesService.update(user.sub, id, updateNoteDto);
    return { data };
  }

  @Delete(':id')
  async delete(@CurrentUser() user, @Param('id') id) {
    return this.notesService.delete(user.sub, id);
  }
}
