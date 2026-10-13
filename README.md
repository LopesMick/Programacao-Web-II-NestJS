# Programação Web II — API NestJS

API desenvolvida nas aulas de Programação Web II, com Controller, Service, Repository e Prisma ORM 7. Alunos e Disciplinas são persistidos no banco; Professores permanece em memória. Cursos demonstra o relacionamento com Alunos.

Autor: Mickael Lopes de Souza.

## Tecnologias

NestJS 12, TypeScript, Prisma ORM 7, MySQL/MariaDB, class-validator, class-transformer e Vitest. O projeto utiliza ESM.

## Pré-requisitos

- Node.js 24 e npm.
- MySQL ou MariaDB em execução.
- Banco `escola` e usuário com acesso a ele.

## Configuração do ambiente

Na pasta `meu-projeto`, copie `.env.example` para `.env` e preencha `DATABASE_URL` com os dados do seu banco. Preserve um `.env` que já exista.

```dotenv
PORT=3000
DATABASE_URL=mysql://usuario:senha@localhost:3306/escola
```

Caracteres especiais no usuário ou na senha precisam ser codificados na URL. A API e a CLI Prisma usam `DATABASE_URL`. As variáveis antigas `DB_*` são opcionais; se mantidas, devem corresponder à URL.

## Instalação e execução

```bash
npm ci
npx prisma validate
npx prisma migrate status
```

Em **banco novo e vazio**, aplique as migrations:

```bash
npx prisma migrate deploy
npm run start:dev
```

Em **banco existente**, faça backup e confira o histórico antes de aplicar migrations. A baseline `0_init` só deve ser marcada com `npx prisma migrate resolve --applied 0_init` quando suas tabelas já existirem e ainda não houver histórico Prisma. Não use reset para adaptar o banco das aulas.

A migration `20261013190500_collation_general` precede o relacionamento para alinhar a collation das tabelas antes do backfill de Cursos. Migrations já aplicadas permanecem inalteradas.

Antes de converter um banco com outra collation, confira se há e-mails equivalentes em `utf8mb4_general_ci`; o índice único impede a conversão em caso de conflito. Não exclua registros para contornar esse erro.

A API utiliza `http://localhost:3000`. Outros comandos:

```bash
npm run typecheck
npm run build
npm run start:prod
npm run lint
npm test
npm run test:e2e
npx prisma db pull --print
npm run prisma:studio
```

`npm ci` gera o Prisma Client mesmo sem `.env`; a execução e os comandos de banco exigem `DATABASE_URL`. Se necessário, regenere o cliente com `npm run prisma:generate`.

O E2E integra API e MariaDB/MySQL em bancos descartáveis `aula4_test_*`, verifica as migrations e remove esses bancos ao terminar. O usuário de teste precisa de permissão para criar e remover bancos. O banco original é consultado para verificar que seus dados não mudaram.

## Rotas disponíveis

| Recurso     | Rotas                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Alunos      | `GET /alunos`, `GET /alunos/:id`, `POST /alunos`, `PUT /alunos/:id`, `PATCH /alunos/:id`, `DELETE /alunos/:id`     |
| Disciplinas | `GET /disciplinas`, `GET /disciplinas/:id`, `POST /disciplinas`, `PUT /disciplinas/:id`, `DELETE /disciplinas/:id` |
| Professores | `GET /professores`, `GET /professores/:id`, `POST /professores`, `PUT /professores/:id`, `DELETE /professores/:id` |
| Cursos      | `GET /cursos`, `GET /cursos/:id`                                                                                   |

Alunos recebe `nome`, `email` e `curso`. Disciplinas recebe `nome` e `carga_horaria` (inteiro positivo). Professores recebe `nome` e `disciplina`. PUT exige todos os campos; PATCH de Alunos exige ao menos um campo válido. Nomes e cursos são normalizados com `trim`.

`GET /alunos` aceita `curso` (igualdade), `nome` (busca parcial), `page` (1 a 10000) e `limit` (1 a 100). Ao informar apenas um parâmetro de paginação, o outro assume `page=1` ou `limit=10`. Sem paginação, retorna todos os alunos em ordem de ID.

Cursos é somente leitura; os cursos são criados ou associados no cadastro e na atualização de Alunos. O detalhe de um curso inclui seus alunos.
