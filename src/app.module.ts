import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalasModule } from './salas/salas.module';
import { Sala } from './salas/entities/sala.entity';
import { Sensor } from './sensors/entities/sensor.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres.jluuhlexkpdziuoiaswv:aqulesdevs2@aws-0-br-south-1.pooler.supabase.com:6543/postgres',
      entities: [Sala, Sensor],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        family: 4,
      },
    }),
    SalasModule,
  ],
})
export class AppModule {}