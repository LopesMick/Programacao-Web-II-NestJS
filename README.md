# Programação Web II — API REST com NestJS

API REST desenvolvida na disciplina **Programação Web II** para praticar os conceitos fundamentais do NestJS: módulos, controllers, services, providers, decorators e injeção de dependência.

- **Aula 1:** CRUD com dados em memória (alunos e professores).
- **Aula 2:** persistência dos alunos em **MySQL**, usando `mysql2`, SQL parametrizado, connection pool, Repository e DatabaseService, sem ORM.

O recurso **professores** continua em memória (os dados voltam ao estado inicial quando o servidor é reiniciado).

## Tecnologias

- Node.js
- NestJS
- TypeScript
- MySQL / MariaDB (XAMPP)
- mysql2
- @nestjs/config
- npm / npx

## Conteúdos praticados

- `@Module()`: organização da aplicação em módulos (`imports`, `controllers`, `providers`, `exports`)
- `@Controller()`: definição de rotas
- `@Injectable()`: services e repositories como providers
- Injeção de dependência pelo construtor, inclusive entre módulos
- `@Get()`, `@Post()`, `@Put()`, `@Delete()`
- `@Param()` com `ParseIntPipe` para parâmetros de rota
- `@Body()` para leitura do corpo da requisição
- `ConfigModule` / `ConfigService` e variáveis de ambiente (`.env`)
- Connection pool com `mysql2/promise`
- Queries parametrizadas (`?`) contra SQL Injection
- `ResultSetHeader` (`insertId`, `affectedRows`) e `RowDataPacket`
- Lifecycle hook `OnModuleDestroy` e `enableShutdownHooks()`

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
│   ├── alunos.module.ts
│   ├── alunos.controller.ts
│   ├── alunos.service.ts
│   └── alunos.repository.ts
│
└── professores/
    ├── professores.module.ts
    ├── professores.controller.ts
    └── professores.service.ts
```

## Fluxo de uma requisição

```
Cliente → Controller → Service → Repository → DatabaseService → mysql2 → MySQL
```

## Banco de dados

Execute no MySQL:

```sql
CREATE DATABASE escola;

USE escola;

CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    curso VARCHAR(100) NOT NULL
);

ALTER TABLE alunos
ADD COLUMN email VARCHAR(150);

INSERT INTO alunos (nome, email, curso)
VALUES
    ('Ana', 'ana@email.com', 'Sistemas de Informação'),
    ('Carlos', 'carlos@email.com', 'Ciência da Computação');
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

| Método | Rota           | Descrição               |
|--------|----------------|-------------------------|
| GET    | `/alunos`      | Lista todos os alunos   |
| GET    | `/alunos/:id`  | Busca um aluno pelo id  |
| POST   | `/alunos`      | Cadastra um aluno       |
| PUT    | `/alunos/:id`  | Atualiza um aluno       |
| DELETE | `/alunos/:id`  | Remove um aluno         |

Exemplo de body (POST/PUT):

```json
{
  "nome": "Maria",
  "email": "maria@email.com",
  "curso": "Engenharia de Software"
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
