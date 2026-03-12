import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VehiclesService } from '../services/vehicles.service';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}
}
