# Programação Web II — API REST com NestJS

API REST desenvolvida na disciplina **Programação Web II** para praticar os conceitos fundamentais do NestJS: módulos, controllers, services, providers, decorators e injeção de dependência.

Os dados ficam **em memória** (arrays dentro dos services). Não há banco de dados, então tudo volta ao estado inicial quando o servidor é reiniciado.

## Tecnologias

- Node.js
- NestJS
- TypeScript
- npm / npx

## Conteúdos praticados

- `@Module()`: organização da aplicação em módulos (`imports`, `controllers`, `providers`, `exports`)
- `@Controller()`: definição de rotas
- `@Injectable()`: services como providers
- Injeção de dependência pelo construtor
- `@Get()`, `@Post()`, `@Put()`, `@Delete()`
- `@Param()` com `ParseIntPipe` para parâmetros de rota
- `@Body()` para leitura do corpo da requisição

## Estrutura

```
src/
├── main.ts
├── app.module.ts
│
├── alunos/
│   ├── alunos.module.ts
│   ├── alunos.controller.ts
│   └── alunos.service.ts
│
└── professores/
    ├── professores.module.ts
    ├── professores.controller.ts
    └── professores.service.ts
```

## Fluxo de uma requisição

```
Cliente HTTP → Controller → Service → dados em memória
```

## Como executar

```bash
npm install
npm run start:dev
```

A API fica disponível em `http://localhost:3000`.

## Rotas

### Alunos

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
  "curso": "Engenharia de Software"
}
```

### Professores

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
