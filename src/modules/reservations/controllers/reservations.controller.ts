import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReservationsService } from '../services/reservations.service';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}
}
