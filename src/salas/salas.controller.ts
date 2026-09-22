import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalasService } from './salas.service';
import { Sala } from './entities/sala.entity';
import { Sensor } from '../sensors/entities/sensor.entity';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Get()
  findAll(): Promise<Sala[]> {
    return this.salasService.findAll();
  }

  // IMPORTANTE: rota específica precisa vir antes de ':id',
  // senão o Nest tentaria casar "nfc" como um :id.
  @Get('nfc/:tagId')
  findByNfcTag(@Param('tagId') tagId: string): Promise<Sala> {
    return this.salasService.findByNfcTag(tagId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Sala> {
    return this.salasService.findOne(id);
  }

  @Get(':id/sensors')
  findSensors(@Param('id') id: string): Promise<Sensor[]> {
    return this.salasService.findSensorsBySala(id);
  }

  @Post()
  create(@Body() dto: CreateSalaDto): Promise<Sala> {
    return this.salasService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSalaDto,
  ): Promise<Sala> {
    return this.salasService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.salasService.remove(id);
  }
}
