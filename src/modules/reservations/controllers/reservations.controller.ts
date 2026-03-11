import { Controller } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}
}
