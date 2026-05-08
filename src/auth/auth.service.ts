import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  async login(email: string, password: string, role?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid login details');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid login details');
    if (role && !this.roleMatches(role, user.role)) throw new UnauthorizedException('Selected role does not match this user');
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const { passwordHash, ...safeUser } = user;
    return { accessToken: await this.jwt.signAsync(payload), user: safeUser };
  }
  async me(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...safe } = user;
    return safe;
  }
  private roleMatches(frontRole: string, dbRole: string) {
    const map = { admin: 'ADMIN', mechanic: 'MECHANIC', store: 'STORE_KEEPER' } as any;
    return (map[frontRole] || frontRole) === dbRole;
  }
}
