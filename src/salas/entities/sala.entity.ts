import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Sensor } from '../../sensors/entities/sensor.entity';

@Entity('salas')
export class Sala {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column()
  setor: string;

  @Column({ name: 'nfc_tag_id', unique: true, nullable: true })
  nfcTagId: string | null;

  @OneToMany(() => Sensor, (sensor) => sensor.sala)
  sensores: Sensor[];
}
