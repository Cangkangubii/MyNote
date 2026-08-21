import {
  BadRequestException,
  ConflictException,
  Dependencies,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const BCRYPT_SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class AuthService {

  async register(registerDto) {
    const { name, email, password } = registerDto;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    // Hash password with bcrypt before persisting (never store plaintext)
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return user;
  }

  async login(loginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokenPair(user);
  }

  async refresh(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (stored.revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Rotate: revoke the old token before issuing a new pair
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.issueTokenPair(stored.user);
  }

  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, revoked: false },
        data: { revoked: true },
      });
    }
    return { success: true };
  }

  async issueTokenPair(user) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    // Store only the hash of the refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}