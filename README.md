# Guardians API

API para gerenciamento de reservas de veiculos construida com NestJS, MongoDB e Swagger.

## Tecnologias

- **NestJS 11** - Framework Node.js
- **MongoDB** (Mongoose 9) - Banco de dados
- **Passport + JWT** - Autenticacao
- **Swagger** - Documentacao interativa da API
- **Docker / Docker Compose** - Ambiente de desenvolvimento
- **Jest** - Testes unitarios
- **ESLint + Prettier** - Padronizacao de codigo

## Requisitos

- Node.js 20+
- Docker e Docker Compose

## Instalacao

```bash
npm install
cp .env.example .env
```

## Rodando o projeto

### Com Docker (recomendado)

Sobe o MongoDB e a API com hot-reload:

```bash
docker-compose up
```

### Sem Docker

Necessario ter um MongoDB rodando localmente na porta 27017.

```bash
npm run start:dev
```

## Documentacao da API (Swagger)

Com o servidor rodando, acesse:

```
http://localhost:3000/api-docs
```

## Endpoints

### Auth

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| POST | `/auth/login` | Nao | Login e obtencao do token JWT |

### Usuarios

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| POST | `/users` | Nao | Cadastro de usuario |
| PUT | `/users/:id` | Sim | Edicao de usuario |
| DELETE | `/users/:id` | Sim | Remocao de usuario (soft delete) |

### Veiculos

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| GET | `/vehicles` | Nao | Listagem de veiculos |
| GET | `/vehicles/:id` | Nao | Detalhes de um veiculo |
| POST | `/vehicles` | Sim | Cadastro de veiculo |
| PUT | `/vehicles/:id` | Sim | Edicao de veiculo |
| DELETE | `/vehicles/:id` | Sim | Remocao de veiculo |

### Reservas

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| POST | `/reservations` | Sim | Reservar um veiculo (envia apenas vehicleId) |
| PATCH | `/reservations/:id/release` | Sim | Liberar/finalizar uma reserva |
| GET | `/reservations/my` | Sim | Listar reservas do usuario logado |

## Regras de negocio

- Todas as rotas sao protegidas por JWT, exceto login e cadastro de usuario
- Um veiculo nao pode ser reservado se ja estiver reservado por outro usuario
- Um usuario nao pode ter mais de um veiculo reservado simultaneamente
- O userId da reserva e extraido automaticamente do token JWT
- Apenas o dono da reserva pode libera-la
- A remocao de usuarios e feita via soft delete (campo `isActive`)

## Arquitetura

O projeto segue os principios de DDD (Domain-Driven Design) e Clean Architecture:

```
src/
  common/
    filters/                       # Filtros globais (exception filter)
  modules/
    auth/
      controllers/                 # AuthController (POST /auth/login)
      decorators/                  # @Public() decorator
      dto/                         # LoginDto
      guards/                      # JwtAuthGuard (global)
      services/                    # AuthService (validate + JWT sign)
      strategies/                  # JwtStrategy (Passport)
    users/
      application/
        dto/                       # CreateUserDto, UpdateUserDto
        use-cases/                 # CreateUser, UpdateUser, DeleteUser
      controllers/                 # UsersController
      domain/
        entities/                  # User entity (validacao de email/senha)
        repositories/              # IUserRepository (interface)
      infrastructure/
        database/mongoose/         # MongooseUserRepository, schema
    vehicles/
      controllers/                 # VehiclesController (CRUD)
      domain/
        entities/                  # VehicleEntity (validacao de ano)
        repositories/              # IVehicleRepository (interface)
      dto/                         # CreateVehicleDto, UpdateVehicleDto
      infrastructure/
        database/mongoose/         # MongooseVehicleRepository
      schemas/                     # Mongoose schema
      services/                    # VehiclesService
    reservations/
      application/
        use-cases/                 # CreateReservation, ReleaseReservation
      controllers/                 # ReservationsController
      domain/
        entities/                  # ReservationEntity (status, release)
        repositories/              # IReservationRepository (interface)
        services/                  # ReservationDomainService (regras)
      dto/                         # CreateReservationDto
      infrastructure/
        database/mongoose/         # MongooseReservationRepository
      schemas/                     # Mongoose schema
```

## Testes

```bash
npm run test              # Roda testes unitarios
npm run test:cov          # Testes com relatorio de cobertura
```

## Scripts

| Script | Descricao |
|---|---|
| `npm run start:dev` | Servidor com hot-reload |
| `npm run build` | Compila o projeto |
| `npm run start:prod` | Roda o build de producao |
| `npm run test` | Testes unitarios |
| `npm run test:cov` | Testes com cobertura |
| `npm run lint` | ESLint com auto-fix |
| `npm run format` | Formata com Prettier |

## Variaveis de ambiente

| Variavel | Descricao | Padrao |
|---|---|---|
| `PORT` | Porta do servidor | `3000` |
| `MONGO_URI` | URI de conexao MongoDB | `mongodb://localhost:27017/guardians` |
| `JWT_SECRET` | Chave secreta para tokens JWT | - |
