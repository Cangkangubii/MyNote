import { Test } from '@nestjs/testing';
import { CapturesService } from './captures.service';
import { PrismaService } from '../prisma/prisma.service';
import { TagsService } from '../tags/tags.service';

describe('CapturesService', () => {
  let service;
  let prismaMock;
  let tagsServiceMock;

  beforeEach(async () => {
    prismaMock = {
      capture: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
      task: { create: jest.fn() },
      note: { create: jest.fn() },
      dailyLog: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    tagsServiceMock = {
      resolveTagIds: jest.fn().mockResolvedValue([]),
    };

    const module = await Test.createTestingModule({
      providers: [
        CapturesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TagsService, useValue: tagsServiceMock },
      ],
    }).compile();

    service = module.get(CapturesService);
  });

  it('should create a capture in inbox', async () => {
    prismaMock.capture.create.mockResolvedValue({
      id: 'cap-1',
      content: 'Hello world',
      status: 'inbox',
    });

    const result = await service.create('user-1', 'Hello world');
    expect(result.id).toBe('cap-1');
    expect(prismaMock.capture.create).toHaveBeenCalled();
  });
});
