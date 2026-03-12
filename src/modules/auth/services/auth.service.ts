import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MongooseUserRepository } from '../../users/infrastructure/database/mongoose/user.repository';
import { User } from '../../users/domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: MongooseUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return new User(user.name, user.email, undefined, user.id);
  }

  login(user: User): { token: string } {
    const payload = { sub: user.id, email: user.email };
    return { token: this.jwtService.sign(payload) };
  }
}
