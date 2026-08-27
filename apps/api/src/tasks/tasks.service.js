import {
  Dependencies,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from '../tags/tags.service';

@Injectable()
@Dependencies(PrismaService, TagsService)
export class TasksService {
  constructor(prisma, tagsService) {
    this.prisma = prisma;
    this.tagsService = tagsService;
  }

  async findAll(userId, filters = {}) {
    const { status, tag } = filters;
    const where = { userId };

    if (status) {
      where.status = status;
    }

    if (tag) {
      where.taskTags = {
        some: {
          tag: {
            name: tag.toLowerCase(),
          },
        },
      };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async findOne(userId, id) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
        sourceCapture: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(userId, createTaskDto) {
    const { title, description, status = 'todo', dueDate, tags = [] } = createTaskDto;

    const tagIds = await this.tagsService.resolveTagIds(userId, tags);

    const completedAt = status === 'done' ? new Date() : null;

    return this.prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description: description ? description.trim() : null,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt,
        taskTags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async update(userId, id, updateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const { title, description, status, dueDate, tags } = updateTaskDto;
    const data = {};

    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    if (status !== undefined) {
      data.status = status;
      if (status === 'done' && task.status !== 'done') {
        data.completedAt = new Date();
      } else if (status !== 'done' && task.status === 'done') {
        data.completedAt = null;
      }
    }

    if (Array.isArray(tags)) {
      const tagIds = await this.tagsService.resolveTagIds(userId, tags);
      // Replace existing tags
      await this.prisma.taskTag.deleteMany({
        where: { taskId: id },
      });
      data.taskTags = {
        create: tagIds.map((tagId) => ({ tagId })),
      };
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async delete(userId, id) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { success: true };
  }
}
