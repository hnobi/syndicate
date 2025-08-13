import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { name, email, password: pwd, avatarUrl } = createUserDto;
    try {
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('User already exists');
      }
      const hashedPassword = await bcrypt.hash(pwd, 10);

      const user = new this.userModel({
        name,
        email,
        password: hashedPassword,
        avatarUrl,
      });
      user.save();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword as unknown as User;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
  async signIn(body: {
    email: string;
    password: string;
  }): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const { email, password } = body;
    if (!email || !password) {
      throw new UnauthorizedException('Name and password are required');
    }

    const user = await this.userModel.findOne({ email });
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password || '',
    );
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user._id, name: user.name };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pwd, ...userWithoutPassword } = user.toObject();

    return {
      user: userWithoutPassword as unknown as Omit<User, 'password'>,
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      }),
    };
  }
}
