import {
  BadRequestException,
  Dependencies,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from '../tags/tags.service';

@Injectable()
@Dependencies(PrismaService, TagsService)
export class CapturesService {
  constructor(prisma, tagsService) {
    this.prisma = prisma;
    this.tagsService = tagsService;
  }

  async create(userId, content) {
    return this.prisma.capture.create({
      data: {
        userId,
        content: content.trim(),
        status: 'inbox',
      },
    });
  }

  async findAll(userId, status) {
    const where = { userId };
    if (status) {
      where.status = status;
    }
    return this.prisma.capture.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: { select: { id: true, title: true, status: true } },
        notes: { select: { id: true, title: true } },
      },
    });
  }

  async delete(userId, id) {
    const capture = await this.prisma.capture.findFirst({
      where: { id, userId },
    });

    if (!capture) {
      throw new NotFoundException('Capture item not found');
    }

    await this.prisma.capture.delete({
      where: { id },
    });

    return { success: true };
  }

  async resolve(userId, id, resolveDto) {
    const { resolution, data = {} } = resolveDto;

    const capture = await this.prisma.capture.findFirst({
      where: { id, userId },
    });

    if (!capture) {
      throw new NotFoundException('Capture item not found');
    }

    if (capture.status === 'triaged') {
      throw new BadRequestException('Capture item has already been triaged');
    }

    // Resolve tag IDs if any
    let tagIds = [];
    if (Array.isArray(data.tags) && data.tags.length > 0) {
      tagIds = await this.tagsService.resolveTagIds(userId, data.tags);
    }

    return this.prisma.$transaction(async (tx) => {
      let resolvedId = null;

      if (resolution === 'task') {
        const title = (data.title || capture.content.split('\n')[0] || 'Tugas Baru').trim();
        const description = data.description !== undefined ? data.description : capture.content;
        const dueDate = data.dueDate ? new Date(data.dueDate) : null;

        const task = await tx.task.create({
          data: {
            userId,
            title: title.slice(0, 255),
            description,
            dueDate,
            sourceCaptureId: capture.id,
            status: 'todo',
            taskTags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          },
        });
        resolvedId = task.id;
      } else if (resolution === 'note') {
        const title = (data.title || capture.content.split('\n')[0] || 'Catatan Baru').trim();
        const content = data.content !== undefined ? data.content : capture.content;

        const note = await tx.note.create({
          data: {
            userId,
            title: title.slice(0, 255),
            content,
            sourceCaptureId: capture.id,
            noteTags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          },
        });
        resolvedId = note.id;
      } else if (resolution === 'log') {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const existingLog = await tx.dailyLog.findUnique({
          where: {
            userId_logDate: {
              userId,
              logDate: startOfDay,
            },
          },
        });

        const didText = data.did || capture.content;

        if (existingLog) {
          const updatedDid = `${existingLog.did}\n- ${didText}`.trim();
          const log = await tx.dailyLog.update({
            where: { id: existingLog.id },
            data: { did: updatedDid },
          });
          resolvedId = log.id;
        } else {
          const log = await tx.dailyLog.create({
            data: {
              userId,
              logDate: startOfDay,
              did: `- ${didText}`.trim(),
            },
          });
          resolvedId = log.id;
        }
      }

      const updatedCapture = await tx.capture.update({
        where: { id: capture.id },
        data: {
          status: 'triaged',
          resolvedType: resolution,
          resolvedId,
          triagedAt: new Date(),
        },
      });

      return {
        capture: updatedCapture,
        resolvedType: resolution,
        resolvedId,
      };
    });
  }
}
