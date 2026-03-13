import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VehiclesService } from '../services/vehicles.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Public()
  @Get()
  @ApiOkResponse({ description: 'List all vehicles' })
  async findAll() {
    return this.vehiclesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ description: 'Get vehicle by id' })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async findById(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Vehicle created' })
  async create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Vehicle updated' })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async delete(@Param('id') id: string) {
    return this.vehiclesService.delete(id);
  }
}
