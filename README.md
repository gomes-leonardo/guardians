# Guardians API

API para gerenciamento de reservas de veiculos construida com NestJS, MongoDB e Swagger.

## Tecnologias

- **NestJS 11** - Framework Node.js
- **MongoDB** (Mongoose 9) - Banco de dados
- **Swagger** - Documentacao interativa da API
- **Docker / Docker Compose** - Ambiente de desenvolvimento
- **GitHub Actions** - CI/CD (lint, testes, build)
- **ESLint + Prettier** - Padronizacao de codigo

## Requisitos

- Node.js 20+
- Docker e Docker Compose (para desenvolvimento local)

## Instalacao

```bash
npm install
```

Copie o arquivo de variaveis de ambiente:

```bash
cp .env.example .env
```

## Rodando o projeto

### Com Docker (recomendado)

Sobe o MongoDB e roda o servidor com hot-reload:

```bash
npm run docker:dev
```

Ou sobe toda a stack (API + MongoDB) containerizada:

```bash
npm run docker:up
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

A documentacao interativa permite testar todos os endpoints diretamente pelo navegador.

## Scripts disponiveis

| Script | Descricao |
|---|---|
| `npm run start:dev` | Servidor em modo desenvolvimento (hot-reload) |
| `npm run build` | Compila o projeto |
| `npm run start:prod` | Roda o build de producao |
| `npm run test` | Roda testes unitarios |
| `npm run test:cov` | Testes com relatorio de cobertura |
| `npm run lint` | Roda ESLint com auto-fix |
| `npm run lint:check` | Roda ESLint sem auto-fix (usado no CI) |
| `npm run format` | Formata codigo com Prettier |
| `npm run format:check` | Verifica formatacao (usado no CI) |
| `npm run docker:dev` | Sobe MongoDB + servidor dev |
| `npm run docker:up` | Sobe toda a stack Docker |
| `npm run docker:down` | Para os containers |
| `npm run docker:test` | Sobe MongoDB + roda testes |

## Estrutura do projeto

```
src/
  common/
    filters/              # Filtros globais (exception filter)
  modules/
    auth/                 # Autenticacao (em desenvolvimento)
      controllers/
      services/
    users/                # Gerenciamento de usuarios
      application/
        dto/              # Data Transfer Objects
        use-cases/        # Casos de uso (logica de negocio)
      controllers/
      domain/
        entities/         # Entidades de dominio
        repositories/     # Interfaces de repositorio
      infrastructure/
        database/
          mongoose/       # Schemas do Mongoose
      services/
    vehicles/             # Gerenciamento de veiculos
      controllers/
      dto/
      schemas/
      services/
    reservations/         # Gerenciamento de reservas
      controllers/
      dto/
      schemas/
      services/
```

## CI/CD

O projeto usa GitHub Actions com o seguinte pipeline:

1. **Lint** - ESLint + verificacao de formatacao Prettier
2. **Unit Tests** - Testes unitarios com cobertura
3. **Build** - Compilacao do projeto

Todos os checks sao obrigatorios para merge na branch `main`.

## Variaveis de ambiente

| Variavel | Descricao | Padrao |
|---|---|---|
| `PORT` | Porta do servidor | `3000` |
| `MONGO_URI` | URI de conexao MongoDB | `mongodb://localhost:27017/guardians` |
| `JWT_SECRET` | Chave secreta para tokens JWT | - |
