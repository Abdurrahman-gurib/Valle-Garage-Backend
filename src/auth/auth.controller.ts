import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT token' })
  @ApiBody({ type: LoginDto })
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password, body.role);
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get currently logged-in user profile' })
  me(@Req() req: any) {
    return this.auth.me(req.user.id);
  }
}
