import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './controllers/users.controller';
import { MongooseUserRepository } from './infrastructure/database/mongoose/user.repository';
import {
  User,
  UserSchema,
} from './infrastructure/database/mongoose/user.schema';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

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
    {
      provide: UpdateUserUseCase,
      useFactory: (repo: MongooseUserRepository) => new UpdateUserUseCase(repo),
      inject: [MongooseUserRepository],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (repo: MongooseUserRepository) => new DeleteUserUseCase(repo),
      inject: [MongooseUserRepository],
    },
  ],
  exports: [MongooseUserRepository],
})
export class UsersModule {}
