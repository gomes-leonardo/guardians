import { Controller } from '@nestjs/common';
import { VehiclesService } from '../services/vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}
}
