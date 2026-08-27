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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
@Dependencies(TasksService)
export class TasksController {
  constructor(tasksService) {
    this.tasksService = tasksService;
  }

  @Get()
  async findAll(
    @CurrentUser() user,
    @Query('status') status,
    @Query('tag') tag
  ) {
    const data = await this.tasksService.findAll(user.sub, { status, tag });
    return { data };
  }

  @Get(':id')
  async findOne(@CurrentUser() user, @Param('id') id) {
    const data = await this.tasksService.findOne(user.sub, id);
    return { data };
  }

  @Post()
  async create(@CurrentUser() user, @Body() createTaskDto) {
    const data = await this.tasksService.create(user.sub, createTaskDto);
    return { data };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user,
    @Param('id') id,
    @Body() updateTaskDto
  ) {
    const data = await this.tasksService.update(user.sub, id, updateTaskDto);
    return { data };
  }

  @Delete(':id')
  async delete(@CurrentUser() user, @Param('id') id) {
    return this.tasksService.delete(user.sub, id);
  }
}
