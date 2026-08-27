import { Dependencies, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Dependencies(PrismaService)
export class LogsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  getTodayDate() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  async upsertToday(userId, upsertDto) {
    const today = this.getTodayDate();
    const { did, blockers, next } = upsertDto;

    return this.prisma.dailyLog.upsert({
      where: {
        userId_logDate: {
          userId,
          logDate: today,
        },
      },
      create: {
        userId,
        logDate: today,
        did: did.trim(),
        blockers: blockers ? blockers.trim() : null,
        next: next ? next.trim() : null,
      },
      update: {
        did: did.trim(),
        blockers: blockers !== undefined ? (blockers ? blockers.trim() : null) : undefined,
        next: next !== undefined ? (next ? next.trim() : null) : undefined,
      },
    });
  }

  async getToday(userId) {
    const today = this.getTodayDate();
    return this.prisma.dailyLog.findUnique({
      where: {
        userId_logDate: {
          userId,
          logDate: today,
        },
      },
    });
  }

  async findAll(userId) {
    return this.prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { logDate: 'desc' },
    });
  }

  async getStreak(userId) {
    const logs = await this.prisma.dailyLog.findMany({
      where: { userId },
      select: { logDate: true },
      orderBy: { logDate: 'desc' },
    });

    if (logs.length === 0) {
      return { streak: 0, hasLoggedToday: false };
    }

    const today = this.getTodayDate();
    const todayTimestamp = today.getTime();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const logTimestamps = logs.map((l) => {
      const d = new Date(l.logDate);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).getTime();
    });

    const uniqueDates = [...new Set(logTimestamps)].sort((a, b) => b - a);

    const hasLoggedToday = uniqueDates[0] === todayTimestamp;
    let expectedDate = hasLoggedToday ? todayTimestamp : todayTimestamp - MS_PER_DAY;

    let streak = 0;
    for (const logDate of uniqueDates) {
      if (logDate === expectedDate) {
        streak++;
        expectedDate -= MS_PER_DAY;
      } else if (logDate < expectedDate) {
        break;
      }
    }

    return { streak, hasLoggedToday };
  }
}
