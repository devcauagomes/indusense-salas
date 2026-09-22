import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sala } from './entities/sala.entity';
import { Sensor } from '../sensors/entities/sensor.entity';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(
    @InjectRepository(Sala)
    private readonly salasRepository: Repository<Sala>,
    @InjectRepository(Sensor)
    private readonly sensorsRepository: Repository<Sensor>,
  ) {}

  async findAll(): Promise<Sala[]> {
    return this.salasRepository.find();
  }

  async findOne(id: string): Promise<Sala> {
    const sala = await this.salasRepository.findOne({ where: { id } });

    if (!sala) {
      throw new NotFoundException(`Sala com id "${id}" não encontrada.`);
    }

    return sala;
  }

  async findByNfcTag(tagId: string): Promise<Sala> {
    const sala = await this.salasRepository.findOne({
      where: { nfcTagId: tagId },
    });

    if (!sala) {
      throw new NotFoundException(
        `Nenhuma sala associada à tag NFC "${tagId}".`,
      );
    }

    return sala;
  }

  async findSensorsBySala(id: string): Promise<Sensor[]> {
    // Garante que a sala existe antes de buscar os sensores (404 correto)
    await this.findOne(id);

    return this.sensorsRepository.find({
      where: { salaId: id },
    });
  }

  async create(dto: CreateSalaDto): Promise<Sala> {
    if (dto.nfcTagId) {
      await this.assertNfcTagIsFree(dto.nfcTagId);
    }

    const sala = this.salasRepository.create(dto);
    return this.salasRepository.save(sala);
  }

  async update(id: string, dto: UpdateSalaDto): Promise<Sala> {
    const sala = await this.findOne(id);

    if (dto.nfcTagId && dto.nfcTagId !== sala.nfcTagId) {
      await this.assertNfcTagIsFree(dto.nfcTagId);
    }

    Object.assign(sala, dto);
    return this.salasRepository.save(sala);
  }

  async remove(id: string): Promise<void> {
    const sala = await this.findOne(id);
    await this.salasRepository.remove(sala);
  }

  private async assertNfcTagIsFree(nfcTagId: string): Promise<void> {
    const existente = await this.salasRepository.findOne({
      where: { nfcTagId },
    });

    if (existente) {
      throw new ConflictException(
        `A tag NFC "${nfcTagId}" já está associada a outra sala.`,
      );
    }
  }
}
