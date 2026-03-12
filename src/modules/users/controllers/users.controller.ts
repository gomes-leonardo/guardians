import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Public()
  @Post()
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }
}
