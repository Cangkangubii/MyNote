import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let authService;
  let prismaMock;
  let jwtServiceMock;

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('should be defined with prisma and jwt dependencies injected', () => {
    expect(authService).toBeDefined();
    expect(authService.prisma).toBeDefined();
    expect(authService.jwtService).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        authService.register({ name: 'Test', email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and hash password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
      });

      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.id).toBe('user-1');
      expect(prismaMock.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'wrong@example.com', password: 'password123' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should issue tokens for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('validpass123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash,
      });
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'token-1' });

      const result = await authService.login({
        email: 'user@example.com',
        password: 'validpass123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBeDefined();
    });
  });
});
