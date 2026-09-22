import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SalasService } from './salas.service';
import { Sala } from './entities/sala.entity';
import { Sensor } from '../sensors/entities/sensor.entity';

type MockRepository<T = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('SalasService', () => {
  let service: SalasService;
  let salasRepository: MockRepository<Sala>;
  let sensorsRepository: MockRepository<Sensor>;

  const salaMock: Sala = {
    id: 'sala-uuid-1',
    nome: 'Sala de Produção A',
    setor: 'Fábrica 1',
    nfcTagId: 'NFC-001',
    sensores: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalasService,
        {
          provide: getRepositoryToken(Sala),
          useValue: createMockRepository<Sala>(),
        },
        {
          provide: getRepositoryToken(Sensor),
          useValue: createMockRepository<Sensor>(),
        },
      ],
    }).compile();

    service = module.get<SalasService>(SalasService);
    salasRepository = module.get(getRepositoryToken(Sala));
    sensorsRepository = module.get(getRepositoryToken(Sensor));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar uma lista de salas', async () => {
      salasRepository.find!.mockResolvedValue([salaMock]);

      const result = await service.findAll();

      expect(result).toEqual([salaMock]);
      expect(salasRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar a sala quando encontrada', async () => {
      salasRepository.findOne!.mockResolvedValue(salaMock);

      const result = await service.findOne('sala-uuid-1');

      expect(result).toEqual(salaMock);
      expect(salasRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'sala-uuid-1' },
      });
    });

    it('deve lançar NotFoundException quando não encontrada', async () => {
      salasRepository.findOne!.mockResolvedValue(null);

      await expect(service.findOne('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByNfcTag', () => {
    it('deve retornar a sala associada à tag NFC', async () => {
      salasRepository.findOne!.mockResolvedValue(salaMock);

      const result = await service.findByNfcTag('NFC-001');

      expect(result).toEqual(salaMock);
      expect(salasRepository.findOne).toHaveBeenCalledWith({
        where: { nfcTagId: 'NFC-001' },
      });
    });

    it('deve lançar NotFoundException quando a tag não estiver associada', async () => {
      salasRepository.findOne!.mockResolvedValue(null);

      await expect(service.findByNfcTag('NFC-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findSensorsBySala', () => {
    it('deve retornar os sensores da sala', async () => {
      const sensoresMock: Sensor[] = [
        { id: 'sensor-1', salaId: 'sala-uuid-1' } as Sensor,
      ];

      salasRepository.findOne!.mockResolvedValue(salaMock);
      sensorsRepository.find!.mockResolvedValue(sensoresMock);

      const result = await service.findSensorsBySala('sala-uuid-1');

      expect(result).toEqual(sensoresMock);
      expect(sensorsRepository.find).toHaveBeenCalledWith({
        where: { salaId: 'sala-uuid-1' },
      });
    });

    it('deve lançar NotFoundException se a sala não existir', async () => {
      salasRepository.findOne!.mockResolvedValue(null);

      await expect(
        service.findSensorsBySala('id-inexistente'),
      ).rejects.toThrow(NotFoundException);

      expect(sensorsRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('deve criar uma sala sem tag NFC', async () => {
      const dto = { nome: 'Sala B', setor: 'Fábrica 2' };

      salasRepository.create!.mockReturnValue(dto);
      salasRepository.save!.mockResolvedValue({ id: 'novo-id', ...dto });

      const result = await service.create(dto as any);

      expect(salasRepository.create).toHaveBeenCalledWith(dto);
      expect(salasRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'novo-id', ...dto });
    });

    it('deve lançar ConflictException se a tag NFC já estiver em uso', async () => {
      const dto = { nome: 'Sala C', setor: 'Fábrica 3', nfcTagId: 'NFC-001' };

      salasRepository.findOne!.mockResolvedValue(salaMock);

      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
      expect(salasRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar os dados da sala', async () => {
      const dto = { nome: 'Sala Atualizada' };
      salasRepository.findOne!.mockResolvedValue({ ...salaMock });
      salasRepository.save!.mockImplementation((s) => Promise.resolve(s));

      const result = await service.update('sala-uuid-1', dto);

      expect(result.nome).toBe('Sala Atualizada');
    });

    it('deve lançar ConflictException ao trocar para uma tag NFC já usada por outra sala', async () => {
      const salaAtual = { ...salaMock, nfcTagId: 'NFC-001' };
      const outraSalaComTag = {
        ...salaMock,
        id: 'outro-id',
        nfcTagId: 'NFC-002',
      };

      salasRepository.findOne!
        .mockResolvedValueOnce(salaAtual) // findOne(id) dentro de update -> findOne(id)
        .mockResolvedValueOnce(outraSalaComTag); // assertNfcTagIsFree

      await expect(
        service.update('sala-uuid-1', { nfcTagId: 'NFC-002' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('deve remover a sala existente', async () => {
      salasRepository.findOne!.mockResolvedValue(salaMock);
      salasRepository.remove!.mockResolvedValue(salaMock);

      await service.remove('sala-uuid-1');

      expect(salasRepository.remove).toHaveBeenCalledWith(salaMock);
    });

    it('deve lançar NotFoundException ao tentar remover sala inexistente', async () => {
      salasRepository.findOne!.mockResolvedValue(null);

      await expect(service.remove('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(salasRepository.remove).not.toHaveBeenCalled();
    });
  });
});
