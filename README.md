# Módulo de Salas e NFC — InduSense

Este pacote contém o módulo completo de Salas e NFC para o backend NestJS do
InduSense (Flutter + NestJS + PostgreSQL/TypeORM).

## Estrutura

```
src/
  salas/
    entities/
      sala.entity.ts
    dto/
      create-sala.dto.ts
      update-sala.dto.ts
    salas.service.ts
    salas.controller.ts
    salas.module.ts
    salas.service.spec.ts       (testes unitários do service)
    salas.controller.spec.ts    (testes unitários do controller)
  sensors/
    entities/
      sensor.entity.ts          (ATUALIZADA com relação ManyToOne para Sala)
test/
  salas.e2e-spec.ts             (teste e2e contra Postgres real via Testcontainers)
  jest-e2e.json
```

## Como integrar no seu projeto

1. Copie a pasta `src/salas` inteira para dentro do `src/` do seu projeto NestJS.
2. Copie `src/sensors/entities/sensor.entity.ts` **substituindo** a entidade
   `Sensor` existente — mas antes, migre para lá as colunas que já existiam na
   sua entidade original (nome, tipo, valor, etc.), pois este arquivo contém
   apenas os campos novos (`salaId` e `sala`) e o `id`.
3. Copie `test/salas.e2e-spec.ts` e `test/jest-e2e.json` para a pasta `test/`
   do seu projeto (mesclando com o `jest-e2e.json` existente, se já houver um).
4. Registre o `SalasModule` no `app.module.ts`:

```typescript
import { SalasModule } from './salas/salas.module';

@Module({
  imports: [
    // ... TypeOrmModule.forRoot({...}) e demais módulos existentes
    SalasModule,
  ],
})
export class AppModule {}
```

5. Garanta o `ValidationPipe` global no `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
);
```

## Dependências a instalar

```bash
npm i class-validator class-transformer @nestjs/mapped-types
npm i -D @testcontainers/postgresql supertest
```

## Migration do banco

Como `Sensor` ganhou a FK `sala_id`, gere e rode a migration antes de subir em
dev/staging/produção:

```bash
npm run typeorm migration:generate -- -n AddSalaRelationToSensor
npm run typeorm migration:run
```

## Rodando os testes

```bash
# unitários (service + controller)
npm run test -- salas

# e2e (precisa do Docker rodando — sobe um Postgres descartável)
npm run test:e2e -- salas
```

## Endpoints

| Método | Rota                  | Descrição                                      |
|--------|------------------------|-------------------------------------------------|
| GET    | `/salas`               | Lista todas as salas                            |
| GET    | `/salas/nfc/:tagId`    | Busca a sala pelo código NDEF da tag NFC        |
| GET    | `/salas/:id`           | Detalhes de uma sala                            |
| GET    | `/salas/:id/sensors`   | Lista os sensores associados à sala             |
| POST   | `/salas`               | Cria uma nova sala                              |
| PATCH  | `/salas/:id`           | Atualiza uma sala existente                     |
| DELETE | `/salas/:id`           | Remove uma sala                                 |

Regras de negócio: `nfcTagId` é único — criar ou atualizar uma sala com uma
tag já usada por outra retorna `409 Conflict`. IDs inexistentes retornam
`404 Not Found`.
