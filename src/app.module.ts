import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalasModule } from './salas/salas.module';
import { Sala } from './salas/entities/sala.entity';
import { Sensor } from './sensors/entities/sensor.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:aqulesdevs2@db.jluuhlexkpdziuoiaswv.supabase.co:5432/postgres',
      entities: [Sala, Sensor],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    SalasModule,
  ],
})
export class AppModule {}