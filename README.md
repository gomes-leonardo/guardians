# Guardians API

API para gerenciamento de reservas de veiculos construida com NestJS, MongoDB e Swagger.

## Tecnologias

- **NestJS 11** - Framework Node.js
- **MongoDB** (Mongoose 9) - Banco de dados
- **Passport + JWT** - Autenticacao
- **Swagger** - Documentacao interativa da API
- **Docker / Docker Compose** - Ambiente containerizado
- **GitHub Actions** - CI/CD (lint, testes, build)
- **Jest** - Testes unitarios (91 testes, 18 suites)
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

A aplicacao estara disponivel em `http://localhost:3000`.

## Documentacao da API (Swagger)

Com o servidor rodando, acesse:

```
http://localhost:3000/api-docs
```

A documentacao interativa permite testar todos os endpoints diretamente pelo navegador, incluindo autenticacao via token JWT.

## Endpoints

### Auth

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| POST | `/auth/login` | Nao | Login e obtencao do token JWT |

### Usuarios

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| POST | `/users` | Nao | Cadastro de usuario |
| PUT | `/users/:id` | Sim | Edicao de usuario (nome e/ou senha) |
| DELETE | `/users/:id` | Sim | Remocao de usuario (soft delete) |

### Veiculos

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| GET | `/vehicles` | Nao | Listagem de veiculos cadastrados |
| GET | `/vehicles/:id` | Nao | Detalhes de um veiculo |
| POST | `/vehicles` | Sim | Cadastro de veiculo |
| PUT | `/vehicles/:id` | Sim | Edicao de veiculo |
| DELETE | `/vehicles/:id` | Sim | Remocao de veiculo |

### Reservas

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| POST | `/reservations` | Sim | Reservar um veiculo (envia apenas o vehicleId) |
| PATCH | `/reservations/:id/release` | Sim | Liberar/finalizar uma reserva |
| GET | `/reservations/my` | Sim | Listar reservas do usuario logado |

## Regras de negocio

- Todas as rotas sao protegidas por JWT, exceto login e cadastro de usuario
- Um veiculo nao pode ser reservado se ja estiver vinculado a uma reserva ativa
- Um usuario nao pode ter mais de um veiculo reservado simultaneamente
- O userId da reserva e extraido automaticamente do token JWT (nunca enviado pelo cliente)
- Apenas o dono da reserva pode libera-la
- A remocao de usuarios e feita via soft delete (campo `isActive`), preservando integridade referencial
- Senhas sao criptografadas com bcrypt antes de serem armazenadas
- Entidades de dominio validam dados no construtor (fail-fast): email invalido, senha fraca ou ano de veiculo fora do intervalo permitido sao rejeitados antes de chegar ao banco

## Arquitetura

O projeto segue **DDD (Domain-Driven Design)** e **Clean Architecture**, com separacao clara em camadas:

- **Domain**: Entidades com regras de negocio auto-validaveis, interfaces de repositorio e Domain Services para regras que envolvem multiplas entidades
- **Application**: Use Cases que orquestram o fluxo (CreateUser, CreateReservation, etc.)
- **Infrastructure**: Implementacoes concretas dos repositorios (Mongoose) — desacopladas do dominio via interfaces
- **Web**: Controllers, DTOs com validacao via class-validator, e decorators de seguranca

### Desacoplamento do banco de dados

Os services e use cases dependem de **interfaces** de repositorio, nao da implementacao do Mongoose. A injecao e feita via factory providers no modulo. Isso permite trocar o banco de dados (ex: PostgreSQL, DynamoDB) criando uma nova implementacao da interface, sem alterar nenhuma logica de negocio.

### Seguranca por padrao

Um `JwtAuthGuard` global protege todas as rotas automaticamente. Rotas publicas sao explicitamente marcadas com o decorator `@Public()`. Isso garante que nenhuma rota nova fique acidentalmente exposta.

```
src/
  common/
    filters/                       # HttpExceptionFilter global
  modules/
    auth/
      controllers/                 # POST /auth/login
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
        database/mongoose/         # MongooseUserRepository, UserSchema
    vehicles/
      controllers/                 # VehiclesController (CRUD completo)
      domain/
        entities/                  # VehicleEntity (validacao de ano: 1900 a atual+1)
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
        entities/                  # ReservationEntity (ACTIVE/FINISHED, release())
        repositories/              # IReservationRepository (interface)
        services/                  # ReservationDomainService (regras de disponibilidade)
      dto/                         # CreateReservationDto (apenas vehicleId)
      infrastructure/
        database/mongoose/         # MongooseReservationRepository
      schemas/                     # Mongoose schema
```

## Testes

O projeto possui **91 testes unitarios** em **18 suites**, cobrindo todas as camadas:

- **Entidades de dominio**: Validacao de campos, regras de negocio (email, senha, ano do veiculo, status da reserva)
- **Domain Services**: Regras de disponibilidade (usuario com reserva ativa, veiculo ja reservado)
- **Use Cases**: Fluxos de criacao, atualizacao e remocao com mocks dos repositorios
- **Controllers**: Verificacao de rotas, propagacao de erros e integracao com use cases

Os testes nao dependem de banco de dados nem de framework, rodando em menos de 2 segundos.

```bash
npm run test              # Roda testes unitarios
npm run test:cov          # Testes com relatorio de cobertura
```

## CI/CD

O projeto usa **GitHub Actions** com um pipeline de 3 etapas obrigatorias para merge na `main`:

1. **Lint** - ESLint + verificacao de formatacao Prettier
2. **Unit Tests** - Testes unitarios com cobertura (artefato gerado)
3. **Build** - Compilacao TypeScript do projeto

Os jobs rodam em sequencia: lint -> testes -> build. Se qualquer etapa falhar, o merge e bloqueado via branch protection rules.

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
