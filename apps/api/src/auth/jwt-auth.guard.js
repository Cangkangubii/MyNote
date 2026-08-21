import { CanActivate, Dependencies, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@Dependencies(JwtService)
export class JwtAuthGuard {
  constructor(jwtService) {
    this.jwtService = jwtService;
  }

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    return true;
  }

  extractBearerToken(request) {
    const [type, token] = (request.headers.authorization || '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}