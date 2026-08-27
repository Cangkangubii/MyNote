import { Dependencies, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class TagsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findAll(userId) {
    return this.prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            tasks: true,
            notes: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId, name) {
    const trimmedName = name.trim().toLowerCase();
    const existing = await this.prisma.tag.findUnique({
      where: {
        userId_name: {
          userId,
          name: trimmedName,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.tag.create({
      data: {
        userId,
        name: trimmedName,
      },
    });
  }

  async delete(userId, id) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.prisma.tag.delete({
      where: { id },
    });

    return { success: true };
  }

  async resolveTagIds(userId, tagNames = []) {
    const tagIds = [];
    for (const rawName of tagNames) {
      if (!rawName || typeof rawName !== 'string') continue;
      const cleanName = rawName.trim().toLowerCase();
      if (!cleanName) continue;

      const tag = await this.create(userId, cleanName);
      tagIds.push(tag.id);
    }
    return [...new Set(tagIds)];
  }
}
