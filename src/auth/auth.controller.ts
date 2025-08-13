import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<any> {
    return await this.authService.signup(createUserDto);
  }
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() body: { email: string; password: string },
  ): Promise<{ access_token: string }> {
    return await this.authService.signIn(body);
  }
}
