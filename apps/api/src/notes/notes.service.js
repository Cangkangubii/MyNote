import {
  Dependencies,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from '../tags/tags.service';

@Injectable()
@Dependencies(PrismaService, TagsService)
export class NotesService {
  constructor(prisma, tagsService) {
    this.prisma = prisma;
    this.tagsService = tagsService;
  }

  async findAll(userId, filters = {}) {
    const { tag } = filters;
    const where = { userId };

    if (tag) {
      where.noteTags = {
        some: {
          tag: {
            name: tag.toLowerCase(),
          },
        },
      };
    }

    return this.prisma.note.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async findOne(userId, id) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
        sourceCapture: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async create(userId, createNoteDto) {
    const { title, content, tags = [] } = createNoteDto;

    const tagIds = await this.tagsService.resolveTagIds(userId, tags);

    return this.prisma.note.create({
      data: {
        userId,
        title: title.trim(),
        content,
        noteTags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async update(userId, id, updateNoteDto) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    const { title, content, tags } = updateNoteDto;
    const data = {};

    if (title !== undefined) data.title = title.trim();
    if (content !== undefined) data.content = content;

    if (Array.isArray(tags)) {
      const tagIds = await this.tagsService.resolveTagIds(userId, tags);
      await this.prisma.noteTag.deleteMany({
        where: { noteId: id },
      });
      data.noteTags = {
        create: tagIds.map((tagId) => ({ tagId })),
      };
    }

    return this.prisma.note.update({
      where: { id },
      data,
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async delete(userId, id) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.prisma.note.delete({
      where: { id },
    });

    return { success: true };
  }
}
