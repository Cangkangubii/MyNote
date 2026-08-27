import { Dependencies, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
@Dependencies(PrismaService, LogsService)
export class DashboardService {
  constructor(prisma, logsService) {
    this.prisma = prisma;
    this.logsService = logsService;
  }

  async getSummary(userId) {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [
      inboxCount,
      dueTodayTasksCount,
      totalNotes,
      totalCompletedTasks,
      recentNotes,
      dueTasks,
      streakData,
    ] = await Promise.all([
      this.prisma.capture.count({
        where: { userId, status: 'inbox' },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: { not: 'done' },
          dueDate: { lte: endOfDay },
        },
      }),
      this.prisma.note.count({
        where: { userId },
      }),
      this.prisma.task.count({
        where: { userId, status: 'done' },
      }),
      this.prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: {
          noteTags: { include: { tag: true } },
        },
      }),
      this.prisma.task.findMany({
        where: {
          userId,
          status: { not: 'done' },
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        take: 5,
        include: {
          taskTags: { include: { tag: true } },
        },
      }),
      this.logsService.getStreak(userId),
    ]);

    return {
      inboxCount,
      dueTodayTasksCount,
      totalNotes,
      totalCompletedTasks,
      streak: streakData.streak,
      hasLoggedToday: streakData.hasLoggedToday,
      recentNotes,
      dueTasks,
    };
  }
}
