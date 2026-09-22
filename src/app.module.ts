import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalasModule } from './salas/salas.module';
import { Sala } from './salas/entities/sala.entity';
import { Sensor } from './sensors/entities/sensor.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Sala, Sensor],
      synchronize: true,
    }),
    SalasModule,
  ],
})
export class AppModule {}
