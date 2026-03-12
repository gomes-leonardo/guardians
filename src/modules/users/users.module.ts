import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './controllers/users.controller';
import { MongooseUserRepository } from './infrastructure/database/mongoose/user.repository';
import {
  User,
  UserSchema,
} from './infrastructure/database/mongoose/user.schema';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    MongooseUserRepository,
    {
      provide: CreateUserUseCase,
      useFactory: (repo: MongooseUserRepository) => new CreateUserUseCase(repo),
      inject: [MongooseUserRepository],
    },
  ],
  exports: [MongooseUserRepository],
})
export class UsersModule {}
