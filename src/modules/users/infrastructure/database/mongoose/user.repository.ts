import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User as UserEntity } from '../../../domain/entities/user.entity';
import { User, UserDocument } from './user.schema';

interface TimestampedDoc {
  createdAt?: Date;
  updatedAt?: Date;
}

function toEntity(doc: UserDocument): UserEntity {
  const ts = doc as unknown as TimestampedDoc;
  return new UserEntity(
    doc.name,
    doc.email,
    doc.password,
    (doc._id as { toString(): string }).toString(),
    ts.createdAt,
    ts.updatedAt,
  );
}

@Injectable()
export class MongooseUserRepository implements IUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const created = await this.userModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    return new UserEntity(
      created.name,
      created.email,
      undefined,
      (created._id as { toString(): string }).toString(),
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) return null;
    return toEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return null;
    return toEntity(user);
  }
}
