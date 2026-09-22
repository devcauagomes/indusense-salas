import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalasService } from './salas.service';
import { SalasController } from './salas.controller';
import { Sala } from './entities/sala.entity';
import { Sensor } from '../sensors/entities/sensor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sala, Sensor])],
  controllers: [SalasController],
  providers: [SalasService],
  exports: [SalasService],
})
export class SalasModule {}
