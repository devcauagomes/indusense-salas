import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { SalasModule } from '../src/salas/salas.module';
import { Sala } from '../src/salas/entities/sala.entity';
import { Sensor } from '../src/sensors/entities/sensor.entity';

describe('SalasController (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let salaId: string;

  jest.setTimeout(60000); // subir o container pode levar alguns segundos

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          entities: [Sala, Sensor],
          synchronize: true, // ok para teste isolado; nunca em produção
        }),
        SalasModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  it('POST /salas -> deve criar uma sala', async () => {
    const response = await request(app.getHttpServer())
      .post('/salas')
      .send({ nome: 'Sala de Testes', setor: 'QA', nfcTagId: 'NFC-E2E-001' })
      .expect(201);

    expect(response.body).toMatchObject({
      nome: 'Sala de Testes',
      setor: 'QA',
      nfcTagId: 'NFC-E2E-001',
    });
    expect(response.body.id).toBeDefined();

    salaId = response.body.id;
  });

  it('POST /salas -> deve rejeitar tag NFC duplicada com 409', async () => {
    await request(app.getHttpServer())
      .post('/salas')
      .send({ nome: 'Outra Sala', setor: 'QA', nfcTagId: 'NFC-E2E-001' })
      .expect(409);
  });

  it('GET /salas -> deve listar as salas', async () => {
    const response = await request(app.getHttpServer())
      .get('/salas')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /salas/:id -> deve retornar a sala criada', async () => {
    const response = await request(app.getHttpServer())
      .get(`/salas/${salaId}`)
      .expect(200);

    expect(response.body.id).toBe(salaId);
  });

  it('GET /salas/:id -> deve retornar 404 para id inexistente', async () => {
    await request(app.getHttpServer())
      .get('/salas/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('GET /salas/nfc/:tagId -> deve encontrar a sala pela tag NFC', async () => {
    const response = await request(app.getHttpServer())
      .get('/salas/nfc/NFC-E2E-001')
      .expect(200);

    expect(response.body.id).toBe(salaId);
  });

  it('GET /salas/nfc/:tagId -> deve retornar 404 para tag desconhecida', async () => {
    await request(app.getHttpServer())
      .get('/salas/nfc/TAG-INEXISTENTE')
      .expect(404);
  });

  it('GET /salas/:id/sensors -> deve retornar array vazio (sem sensores ainda)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/salas/${salaId}/sensors`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('PATCH /salas/:id -> deve atualizar o nome da sala', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/salas/${salaId}`)
      .send({ nome: 'Sala de Testes Renomeada' })
      .expect(200);

    expect(response.body.nome).toBe('Sala de Testes Renomeada');
  });

  it('DELETE /salas/:id -> deve remover a sala', async () => {
    await request(app.getHttpServer()).delete(`/salas/${salaId}`).expect(204);

    await request(app.getHttpServer()).get(`/salas/${salaId}`).expect(404);
  });
});
