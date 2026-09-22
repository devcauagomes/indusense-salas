import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SalasController } from './salas.controller';
import { SalasService } from './salas.service';
import { Sala } from './entities/sala.entity';
import { Sensor } from '../sensors/entities/sensor.entity';

describe('SalasController', () => {
  let controller: SalasController;
  let service: jest.Mocked<SalasService>;

  const salaMock: Sala = {
    id: 'sala-uuid-1',
    nome: 'Sala de Produção A',
    setor: 'Fábrica 1',
    nfcTagId: 'NFC-001',
    sensores: [],
  };

  beforeEach(async () => {
    const serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByNfcTag: jest.fn(),
      findSensorsBySala: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalasController],
      providers: [{ provide: SalasService, useValue: serviceMock }],
    }).compile();

    controller = module.get<SalasController>(SalasController);
    service = module.get(SalasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /salas', () => {
    it('deve retornar todas as salas', async () => {
      service.findAll.mockResolvedValue([salaMock]);

      const result = await controller.findAll();

      expect(result).toEqual([salaMock]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /salas/nfc/:tagId', () => {
    it('deve retornar a sala correspondente à tag NFC', async () => {
      service.findByNfcTag.mockResolvedValue(salaMock);

      const result = await controller.findByNfcTag('NFC-001');

      expect(result).toEqual(salaMock);
      expect(service.findByNfcTag).toHaveBeenCalledWith('NFC-001');
    });

    it('deve propagar NotFoundException quando a tag não existir', async () => {
      service.findByNfcTag.mockRejectedValue(
        new NotFoundException('não encontrada'),
      );

      await expect(controller.findByNfcTag('NFC-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('GET /salas/:id', () => {
    it('deve retornar a sala pelo id', async () => {
      service.findOne.mockResolvedValue(salaMock);

      const result = await controller.findOne('sala-uuid-1');

      expect(result).toEqual(salaMock);
      expect(service.findOne).toHaveBeenCalledWith('sala-uuid-1');
    });

    it('deve propagar NotFoundException quando a sala não existir', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('id-invalido')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('GET /salas/:id/sensors', () => {
    it('deve retornar os sensores da sala', async () => {
      const sensoresMock: Sensor[] = [
        { id: 'sensor-1', salaId: 'sala-uuid-1' } as Sensor,
      ];
      service.findSensorsBySala.mockResolvedValue(sensoresMock);

      const result = await controller.findSensors('sala-uuid-1');

      expect(result).toEqual(sensoresMock);
      expect(service.findSensorsBySala).toHaveBeenCalledWith('sala-uuid-1');
    });
  });

  describe('POST /salas', () => {
    it('deve criar uma nova sala', async () => {
      const dto = { nome: 'Sala Nova', setor: 'Fábrica 2' };
      service.create.mockResolvedValue({ ...salaMock, ...dto });

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.nome).toBe('Sala Nova');
    });

    it('deve propagar ConflictException para tag NFC duplicada', async () => {
      service.create.mockRejectedValue(new ConflictException());

      await expect(
        controller.create({
          nome: 'X',
          setor: 'Y',
          nfcTagId: 'NFC-001',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('PATCH /salas/:id', () => {
    it('deve atualizar a sala', async () => {
      const dto = { nome: 'Sala Renomeada' };
      service.update.mockResolvedValue({ ...salaMock, ...dto });

      const result = await controller.update('sala-uuid-1', dto);

      expect(service.update).toHaveBeenCalledWith('sala-uuid-1', dto);
      expect(result.nome).toBe('Sala Renomeada');
    });
  });

  describe('DELETE /salas/:id', () => {
    it('deve remover a sala', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('sala-uuid-1');

      expect(service.remove).toHaveBeenCalledWith('sala-uuid-1');
      expect(result).toBeUndefined();
    });
  });
});
