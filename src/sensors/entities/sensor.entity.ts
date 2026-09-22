import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sala } from '../../salas/entities/sala.entity';

@Entity('sensors')
export class Sensor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ... demais colunas já existentes no seu projeto (nome, tipo, valor, etc.)
  // Adicione aqui os campos originais da sua entidade Sensor, se houver mais.

  @Column({ name: 'sala_id', nullable: true })
  salaId: string | null;

  @ManyToOne(() => Sala, (sala) => sala.sensores, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'sala_id' })
  sala: Sala;
}
