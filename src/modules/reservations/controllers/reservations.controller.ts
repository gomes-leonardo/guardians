import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReservationUseCase } from '../application/use-cases/create-reservation.use-case';
import { ReleaseReservationUseCase } from '../application/use-cases/release-reservation.use-case';
import { CreateReservationDto } from '../dto/create-reservation.dto';

interface AuthenticatedRequest {
  user: { id: string; email: string };
}

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly createReservation: CreateReservationUseCase,
    private readonly releaseReservation: ReleaseReservationUseCase,
    @Inject('FIND_BY_USER_ID')
    private readonly reservationQuery: {
      findByUserId: (userId: string) => Promise<unknown[]>;
    },
  ) {}

  @Post()
  @ApiCreatedResponse({ description: 'Reservation created' })
  @ApiNotFoundResponse({ description: 'User or Vehicle not found' })
  async create(
    @Body() dto: CreateReservationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.createReservation.execute(req.user.id, dto.vehicleId);
  }

  @Patch(':id/release')
  @ApiOkResponse({ description: 'Reservation released' })
  @ApiNotFoundResponse({ description: 'Reservation not found' })
  @ApiForbiddenResponse({ description: 'Not the owner of the reservation' })
  async release(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.releaseReservation.execute(id, req.user.id);
  }

  @Get('my')
  @ApiOkResponse({ description: 'List user reservations' })
  async findMy(@Req() req: AuthenticatedRequest) {
    return this.reservationQuery.findByUserId(req.user.id);
  }
}
