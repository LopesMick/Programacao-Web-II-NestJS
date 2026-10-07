# Programação Web II — API REST com NestJS

API REST desenvolvida na disciplina **Programação Web II** para praticar os conceitos fundamentais do NestJS: módulos, controllers, services, providers, decorators, injeção de dependência, persistência e validação.

- **Aula 1:** CRUD com dados em memória (alunos e professores).
- **Aula 2:** persistência dos alunos em **MySQL**, usando `mysql2`, SQL parametrizado, connection pool, Repository e DatabaseService, sem ORM.
- **Aula 3:** DTOs, validação com `class-validator` e `ValidationPipe`, tratamento de erros (`NotFoundException`), códigos HTTP adequados, `PATCH` com `PartialType` e o recurso **disciplinas**.

O recurso **professores** continua em memória (os dados voltam ao estado inicial quando o servidor é reiniciado).

## Tecnologias

- Node.js
- NestJS
- TypeScript
- MySQL / MariaDB (XAMPP)
- mysql2
- @nestjs/config
- class-validator / class-transformer
- @nestjs/mapped-types
- npm / npx

## Conteúdos praticados

- `@Module()`: organização da aplicação em módulos (`imports`, `controllers`, `providers`, `exports`)
- `@Controller()`: definição de rotas
- `@Injectable()`: services e repositories como providers
- Injeção de dependência pelo construtor, inclusive entre módulos
- `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`
- `@Param()` com `ParseIntPipe` para parâmetros de rota
- `@Body()` com DTOs para leitura do corpo da requisição
- `ConfigModule` / `ConfigService` e variáveis de ambiente (`.env`)
- Connection pool com `mysql2/promise`
- Queries parametrizadas (`?`) contra SQL Injection
- `ResultSetHeader` (`insertId`, `affectedRows`) e `RowDataPacket`
- Lifecycle hook `OnModuleDestroy` e `enableShutdownHooks()`
- DTOs com `@IsString()`, `@IsNotEmpty()`, `@MaxLength()`, `@IsEmail()`, `@IsInt()`, `@Min()`
- `ValidationPipe` global com `whitelist` e `transform`
- `PartialType` para atualização parcial (`PATCH`)
- `NotFoundException` / `BadRequestException` e status `200`, `201`, `204`, `400`, `404`

## Estrutura

```
src/
├── main.ts
├── app.module.ts
│
├── database/
│   ├── database.module.ts
│   └── database.service.ts
│
├── alunos/
│   ├── dto/
│   │   ├── create-aluno.dto.ts
│   │   ├── update-aluno.dto.ts
│   │   └── patch-aluno.dto.ts
│   ├── alunos.module.ts
│   ├── alunos.controller.ts
│   ├── alunos.service.ts
│   └── alunos.repository.ts
│
├── disciplinas/
│   ├── dto/
│   │   ├── create-disciplina.dto.ts
│   │   └── update-disciplina.dto.ts
│   ├── disciplinas.module.ts
│   ├── disciplinas.controller.ts
│   ├── disciplinas.service.ts
│   └── disciplinas.repository.ts
│
└── professores/
    ├── professores.module.ts
    ├── professores.controller.ts
    └── professores.service.ts
```

## Fluxo de uma requisição

```
Request → Pipes (ParseIntPipe / ValidationPipe) → DTO → Controller → Service → Repository → DatabaseService → MySQL
```

## Banco de dados

Execute no MySQL:

```sql
CREATE DATABASE escola;

USE escola;

CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL
);

CREATE TABLE disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    carga_horaria INT NOT NULL
);

INSERT INTO alunos (nome, email, curso)
VALUES
    ('Ana', 'ana@email.com', 'Sistemas de Informação'),
    ('Carlos', 'carlos@email.com', 'Ciência da Computação');

INSERT INTO disciplinas (nome, carga_horaria)
VALUES
    ('Programação Web II', 80),
    ('Banco de Dados', 60);
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (ele não é versionado):

```
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=escola
```

Preencha `DB_PASSWORD` com a senha do seu MySQL (no XAMPP, por padrão, fica vazia).

## Como executar

```bash
npm install
npm run start:dev
```

A API fica disponível em `http://localhost:3000`.

## Rotas

### Alunos (MySQL)

| Método | Rota           | Descrição                     | Sucesso | Erros    |
|--------|----------------|-------------------------------|---------|----------|
| GET    | `/alunos`      | Lista todos os alunos         | 200     | —        |
| GET    | `/alunos/:id`  | Busca um aluno pelo id        | 200     | 400, 404 |
| POST   | `/alunos`      | Cadastra um aluno             | 201     | 400      |
| PUT    | `/alunos/:id`  | Atualiza todos os campos      | 200     | 400, 404 |
| PATCH  | `/alunos/:id`  | Atualiza apenas os enviados   | 200     | 400, 404 |
| DELETE | `/alunos/:id`  | Remove um aluno               | 204     | 400, 404 |

Body do POST/PUT (todos obrigatórios):

```json
{
  "nome": "Maria",
  "email": "maria@email.com",
  "curso": "Engenharia de Software"
}
```

Body do PATCH (qualquer combinação dos campos):

```json
{
  "curso": "Engenharia de Software"
}
```

### Disciplinas (MySQL)

| Método | Rota                | Descrição                   | Sucesso | Erros    |
|--------|---------------------|-----------------------------|---------|----------|
| GET    | `/disciplinas`      | Lista todas as disciplinas  | 200     | —        |
| GET    | `/disciplinas/:id`  | Busca uma disciplina        | 200     | 400, 404 |
| POST   | `/disciplinas`      | Cadastra uma disciplina     | 201     | 400      |
| PUT    | `/disciplinas/:id`  | Atualiza uma disciplina     | 200     | 400, 404 |
| DELETE | `/disciplinas/:id`  | Remove uma disciplina       | 204     | 400, 404 |

Body do POST/PUT (`carga_horaria` deve ser inteiro maior que zero):

```json
{
  "nome": "Programação Web II",
  "carga_horaria": 80
}
```

### Professores (em memória)

| Método | Rota                | Descrição                  |
|--------|---------------------|----------------------------|
| GET    | `/professores`      | Lista todos os professores |
| GET    | `/professores/:id`  | Busca um professor pelo id |
| POST   | `/professores`      | Cadastra um professor      |
| PUT    | `/professores/:id`  | Atualiza um professor      |
| DELETE | `/professores/:id`  | Remove um professor        |

Exemplo de body (POST/PUT):

```json
{
  "nome": "Fernanda",
  "disciplina": "Engenharia de Software"
}
```

## Testes

```bash
npm test
```

## Autor

Mickael Lopes de Souza
