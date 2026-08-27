import { Dependencies, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class SearchService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async search(userId, query) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return {
        tasks: [],
        notes: [],
        logs: [],
        captures: [],
      };
    }

    const keyword = query.trim();

    const [tasks, notes, logs, captures] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        include: {
          taskTags: { include: { tag: true } },
        },
        take: 10,
      }),
      this.prisma.note.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { content: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        include: {
          noteTags: { include: { tag: true } },
        },
        take: 10,
      }),
      this.prisma.dailyLog.findMany({
        where: {
          userId,
          OR: [
            { did: { contains: keyword, mode: 'insensitive' } },
            { blockers: { contains: keyword, mode: 'insensitive' } },
            { next: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.capture.findMany({
        where: {
          userId,
          content: { contains: keyword, mode: 'insensitive' },
        },
        take: 10,
      }),
    ]);

    return {
      query: keyword,
      total: tasks.length + notes.length + logs.length + captures.length,
      tasks,
      notes,
      logs,
      captures,
    };
  }
}
