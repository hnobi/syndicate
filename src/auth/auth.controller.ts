import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { MailService } from 'src/mail/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user = await this.authService.signup(createUserDto);
    await this.mailService.queueWelcomeEmail(
      createUserDto.email,
      createUserDto.name,
    );

    return {
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
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
