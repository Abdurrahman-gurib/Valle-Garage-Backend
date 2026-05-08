import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public()
  @Post('login')
  login(@Body() body: { email: string; password: string; role?: string }) {
    return this.auth.login(body.email, body.password, body.role);
  }
  @Get('me')
  me(@Req() req: any) {
    return this.auth.me(req.user.id);
  }
}
