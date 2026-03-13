import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IReservationRepository } from '../../../domain/repositories/reservation.repository.interface';
import {
  ReservationEntity,
  ReservationStatus,
} from '../../../domain/entities/reservation.entity';
import {
  Reservation,
  ReservationDocument,
} from '../../../schemas/reservation.schema';

interface TimestampedDoc {
  createdAt?: Date;
  updatedAt?: Date;
}

function toEntity(doc: ReservationDocument): ReservationEntity {
  const ts = doc as unknown as TimestampedDoc;
  return new ReservationEntity(
    (doc.userId as { toString(): string }).toString(),
    (doc.vehicleId as { toString(): string }).toString(),
    doc.status,
    (doc._id as { toString(): string }).toString(),
    ts.createdAt,
    ts.updatedAt,
  );
}

@Injectable()
export class MongooseReservationRepository implements IReservationRepository {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
  ) {}

  async create(reservation: ReservationEntity): Promise<ReservationEntity> {
    const created = await this.reservationModel.create({
      userId: new Types.ObjectId(reservation.userId),
      vehicleId: new Types.ObjectId(reservation.vehicleId),
      status: reservation.status,
    });
    return toEntity(created);
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const doc = await this.reservationModel.findById(id).exec();
    if (!doc) return null;
    return toEntity(doc);
  }

  async findActiveByUserId(userId: string): Promise<ReservationEntity | null> {
    const doc = await this.reservationModel
      .findOne({ userId, status: ReservationStatus.ACTIVE })
      .exec();
    if (!doc) return null;
    return toEntity(doc);
  }

  async findActiveByVehicleId(
    vehicleId: string,
  ): Promise<ReservationEntity | null> {
    const doc = await this.reservationModel
      .findOne({ vehicleId, status: ReservationStatus.ACTIVE })
      .exec();
    if (!doc) return null;
    return toEntity(doc);
  }

  async findByUserId(userId: string): Promise<ReservationEntity[]> {
    const docs = await this.reservationModel.find({ userId }).exec();
    return docs.map(toEntity);
  }

  async update(reservation: ReservationEntity): Promise<ReservationEntity> {
    const updated = await this.reservationModel
      .findByIdAndUpdate(
        reservation.id,
        { status: reservation.status },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Reservation not found');
    return toEntity(updated);
  }
}
