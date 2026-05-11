import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeRole } from '../common/utils';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private emailCandidates(email: string) {
    const normalized = String(email || '').trim().toLowerCase();
    const candidates = new Set<string>();
    if (normalized) candidates.add(normalized);
    if (normalized.endsWith('@vallepark.com')) {
      candidates.add(normalized.replace('@vallepark.com', '@valle.com'));
    }
    if (normalized.endsWith('@valle.com')) {
      candidates.add(normalized.replace('@valle.com', '@vallepark.com'));
    }
    return Array.from(candidates);
  }

  async login(email: string, password: string, role?: string) {
    const candidates = this.emailCandidates(email);

    const user = await this.prisma.user.findFirst({
      where: { email: { in: candidates } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid login details');
    }

    const ok = await bcrypt.compare(password || '', user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid login details');
    }

    if (role && normalizeRole(role) !== user.role) {
      throw new UnauthorizedException('Selected role does not match this user');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await this.jwt.signAsync(payload);
    const { passwordHash, ...safeUser } = user;

    return {
      accessToken,
      access_token: accessToken,
      token: accessToken,
      user: safeUser,
    };
  }

  async me(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
