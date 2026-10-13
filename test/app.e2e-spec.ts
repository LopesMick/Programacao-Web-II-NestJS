import { Test } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { configurarValidacao } from '../src/validation.js';
import { AlunosRepository } from '../src/alunos/alunos.repository.js';
import { DisciplinasRepository } from '../src/disciplinas/disciplinas.repository.js';
import { TestDatabases } from './database.js';

describe('API e migrations em bancos isolados', () => {
  let app: INestApplication | undefined;
  let prisma: PrismaService;
  let databases: TestDatabases;
  let mainSnapshot: string;

  beforeAll(async () => {
    databases = new TestDatabases();
    mainSnapshot = await databases.snapshotMain();
    const db = await databases.create('crud');
    databases.prisma(db.url, ['migrate', 'deploy']);
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue(db.config)
      .compile();
    app = module.createNestApplication();
    configurarValidacao(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.aluno.deleteMany(),
      prisma.curso.deleteMany(),
      prisma.disciplina.deleteMany(),
    ]);
  });

  afterEach(() => vi.restoreAllMocks());

  afterAll(async () => {
    try {
      await app?.close();
      if (mainSnapshot !== undefined)
        expect(await databases.snapshotMain()).toBe(mainSnapshot);
    } finally {
      await databases?.close();
    }
  });

  const api = () => request(app!.getHttpServer());
  const aluno = (email = 'ana@example.com', curso = 'ADS') => ({
    nome: 'Ana',
    email,
    curso,
  });

  it('mantém a rota inicial e Professores', async () => {
    await api().get('/').expect(200).expect('Hello World!');
    const response = await api().get('/professores').expect(200);
    expect(response.body).toHaveLength(2);
  });

  it('executa CRUD de alunos, normaliza texto e preserva o contrato', async () => {
    const created = await api()
      .post('/alunos')
      .send({ ...aluno(), nome: ' Ana ', curso: ' ADS ' })
      .expect(201);
    const id = created.body.id;
    expect(created.body).toEqual({ id, ...aluno() });
    expect(await prisma.aluno.findUnique({ where: { id } })).toMatchObject({
      cursoId: expect.any(Number),
    });
    await api().get(`/alunos/${id}`).expect(200).expect(created.body);
    await api()
      .put(`/alunos/${id}`)
      .send({ nome: ' Bia ', email: 'bia@example.com', curso: ' SI ' })
      .expect(200);
    const patched = await api()
      .patch(`/alunos/${id}`)
      .send({ curso: ' CC ' })
      .expect(200);
    expect(patched.body).toEqual({
      id,
      nome: 'Bia',
      email: 'bia@example.com',
      curso: 'CC',
    });
    const courses = await api().get('/cursos').expect(200);
    const course = courses.body.find((c: { nome: string }) => c.nome === 'CC');
    const detail = await api().get(`/cursos/${course.id}`).expect(200);
    expect(detail.body.alunos).toEqual([
      { id, nome: 'Bia', email: 'bia@example.com' },
    ]);
    await api().delete(`/alunos/${id}`).expect(204).expect('');
    await api().get(`/alunos/${id}`).expect(404);
  });

  it('filtra por curso e nome e pagina em ordem de id', async () => {
    await api().post('/alunos').send(aluno()).expect(201);
    await api()
      .post('/alunos')
      .send({ ...aluno('bia@example.com'), nome: 'Bia' })
      .expect(201);
    await api()
      .post('/alunos')
      .send(aluno('outra@example.com', 'SI'))
      .expect(201);
    const all = await api().get('/alunos').expect(200);
    expect(all.body).toHaveLength(3);
    const filtered = await api()
      .get('/alunos')
      .query({ curso: ' ADS ', nome: ' an ' })
      .expect(200);
    expect(filtered.body).toHaveLength(1);
    const page = await api()
      .get('/alunos')
      .query({ page: 2, limit: 1 })
      .expect(200);
    expect(page.body).toEqual([all.body[1]]);
    const limited = await api().get('/alunos').query({ limit: 2 }).expect(200);
    expect(limited.body).toEqual(all.body.slice(0, 2));
  });

  it('retorna 409 para e-mail duplicado no POST, PUT e PATCH', async () => {
    await api().post('/alunos').send(aluno()).expect(201);
    const second = await api()
      .post('/alunos')
      .send(aluno('bia@example.com'))
      .expect(201);
    const conflict = await api().post('/alunos').send(aluno()).expect(409);
    expect(conflict.body.message).toBe('Já existe um aluno com este e-mail');
    await api().put(`/alunos/${second.body.id}`).send(aluno()).expect(409);
    await api()
      .patch(`/alunos/${second.body.id}`)
      .send({ email: aluno().email })
      .expect(409);
    expect(await prisma.aluno.count()).toBe(2);
  });

  it('retorna 404 para recursos ausentes e 400 para id inválido', async () => {
    await api().get('/alunos/invalido').expect(400);
    await api().get('/alunos/999999').expect(404);
    await api().put('/alunos/999999').send(aluno()).expect(404);
    await api().patch('/alunos/999999').send({ nome: 'Bia' }).expect(404);
    await api().delete('/alunos/999999').expect(404);
    await api().get('/cursos/999999').expect(404);
    await api().get('/disciplinas/999999').expect(404);
  });

  it('rejeita valores inválidos e remove campos extras', async () => {
    for (const data of [
      {},
      { ...aluno(), nome: ' ' },
      { ...aluno(), curso: ' ' },
      { ...aluno(), email: 'invalido' },
    ]) {
      await api().post('/alunos').send(data).expect(400);
    }
    const created = await api()
      .post('/alunos')
      .send({ ...aluno(), cursoId: 999, outro: true })
      .expect(201);
    const id = created.body.id;
    await api().put(`/alunos/${id}`).send({ nome: 'Ana' }).expect(400);
    for (const data of [{}, { nome: null }, { curso: ' ' }, { outro: true }]) {
      await api().patch(`/alunos/${id}`).send(data).expect(400);
    }
    for (const query of [
      { page: 0 },
      { page: 1.5 },
      { page: '9007199254740992' },
      { limit: 101 },
      { limit: 0 },
      { curso: ' ' },
      { nome: ' ' },
    ]) {
      await api().get('/alunos').query(query).expect(400);
    }
  });

  it('executa CRUD e validação de disciplinas com carga_horaria', async () => {
    const created = await api()
      .post('/disciplinas')
      .send({ nome: ' Web II ', carga_horaria: 80 })
      .expect(201);
    const id = created.body.id;
    expect(created.body).toEqual({ id, nome: 'Web II', carga_horaria: 80 });
    await api().get('/disciplinas').expect(200).expect([created.body]);
    await api().get(`/disciplinas/${id}`).expect(200).expect(created.body);
    await api()
      .put(`/disciplinas/${id}`)
      .send({ nome: ' Banco ', carga_horaria: 60 })
      .expect(200)
      .expect({ id, nome: 'Banco', carga_horaria: 60 });
    await api()
      .post('/disciplinas')
      .send({ nome: ' ', carga_horaria: 80 })
      .expect(400);
    await api()
      .post('/disciplinas')
      .send({ nome: 'Web', carga_horaria: 0 })
      .expect(400);
    await api().delete(`/disciplinas/${id}`).expect(204);
    await api()
      .put(`/disciplinas/${id}`)
      .send({ nome: 'Banco', carga_horaria: 60 })
      .expect(404);
    await api().delete(`/disciplinas/${id}`).expect(404);
  });

  it('mantém um único curso em cadastros concorrentes', async () => {
    const responses = await Promise.all(
      Array.from({ length: 4 }, (_, i) =>
        api()
          .post('/alunos')
          .send(aluno(`aluno${i}@example.com`, 'Mesmo curso')),
      ),
    );
    expect(responses.map((r) => r.status)).toEqual([201, 201, 201, 201]);
    expect(await prisma.curso.count()).toBe(1);
    expect(await prisma.aluno.count()).toBe(4);
  });

  it('retorna 404 quando o aluno é excluído entre a busca e a alteração', async () => {
    const repository = app!.get(AlunosRepository);
    for (const method of ['update', 'patch', 'delete'] as const) {
      const created = await api()
        .post('/alunos')
        .send(aluno(`${method}@example.com`))
        .expect(201);
      const original = repository[method].bind(repository);
      vi.spyOn(repository, method).mockImplementationOnce(
        async (
          id: number,
          data?: Parameters<AlunosRepository['update']>[1],
        ) => {
          await prisma.aluno.delete({ where: { id } });
          await original(id, data!);
        },
      );
      const route = `/alunos/${created.body.id}`;
      if (method === 'update') await api().put(route).send(aluno()).expect(404);
      if (method === 'patch')
        await api().patch(route).send({ nome: 'Bia' }).expect(404);
      if (method === 'delete') await api().delete(route).expect(404);
    }
  });

  it('retorna 404 quando a disciplina é excluída entre a busca e a alteração', async () => {
    const repository = app!.get(DisciplinasRepository);
    const original = repository.update.bind(repository);
    const data = { nome: 'Web II', carga_horaria: 80 };
    const created = await api().post('/disciplinas').send(data).expect(201);
    vi.spyOn(repository, 'update').mockImplementationOnce(async (id, body) => {
      await prisma.disciplina.delete({ where: { id } });
      await original(id, body);
    });
    await api().put(`/disciplinas/${created.body.id}`).send(data).expect(404);
  });

  it('preserva os dados quando a conversão de collation encontra e-mails equivalentes', async () => {
    const db = await databases.create('collision');
    await databases.applySql(db.client, '0_init');
    await db.client.$executeRawUnsafe(
      "INSERT INTO alunos (nome,email,curso) VALUES ('Ana','s@example.com','ADS'),('Bia','ß@example.com','ADS')",
    );
    databases.prisma(db.url, ['migrate', 'resolve', '--applied', '0_init']);
    const before = await db.client.$queryRawUnsafe(
      'SELECT * FROM alunos ORDER BY id',
    );
    const collisions = await db.client.$queryRawUnsafe<{ total: bigint }[]>(
      'SELECT COUNT(*) total FROM (SELECT email COLLATE utf8mb4_general_ci FROM alunos GROUP BY email COLLATE utf8mb4_general_ci HAVING COUNT(*) > 1) x',
    );
    expect(Number(collisions[0].total)).toBe(1);
    expect(() => databases.prisma(db.url, ['migrate', 'deploy'])).toThrow(
      'Prisma falhou no banco isolado',
    );
    expect(
      await db.client.$queryRawUnsafe('SELECT * FROM alunos ORDER BY id'),
    ).toEqual(before);
  });

  it.each(['baseline', 'legacy'] as const)(
    'valida o histórico com dados no cenário %s',
    async (scenario) => {
      const db = await databases.create(scenario);
      await databases.applySql(db.client, '0_init', scenario === 'legacy');
      await db.client.$executeRawUnsafe(
        "INSERT INTO alunos (nome,email,curso) VALUES ('Ana','ana@example.com','ADS'),('Bia','bia@example.com','SI')",
      );
      await db.client.$executeRawUnsafe(
        "INSERT INTO disciplinas (nome,carga_horaria) VALUES ('Web II',80)",
      );
      databases.prisma(db.url, ['migrate', 'resolve', '--applied', '0_init']);
      if (scenario === 'legacy') {
        for (const migration of [
          '20261013190000_alunos_email_unico',
          '20261013191000_cursos_relacionamento',
        ]) {
          await databases.applySql(db.client, migration);
          databases.prisma(db.url, [
            'migrate',
            'resolve',
            '--applied',
            migration,
          ]);
        }
      }
      databases.prisma(db.url, ['migrate', 'deploy']);
      expect(
        await db.client.aluno.findMany({
          orderBy: { id: 'asc' },
          select: { nome: true, email: true, curso: true },
        }),
      ).toEqual([
        { nome: 'Ana', email: 'ana@example.com', curso: 'ADS' },
        { nome: 'Bia', email: 'bia@example.com', curso: 'SI' },
      ]);
      expect(await db.client.aluno.count({ where: { cursoId: null } })).toBe(0);
      expect(await db.client.disciplina.count()).toBe(1);
      const collations = await db.client.$queryRawUnsafe<
        { TABLE_COLLATION: string }[]
      >(
        "SELECT TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('alunos','cursos','disciplinas')",
      );
      expect(collations.map((c) => c.TABLE_COLLATION)).toEqual(
        Array(3).fill('utf8mb4_general_ci'),
      );
      expect(databases.prisma(db.url, ['migrate', 'status'])).toContain(
        'up to date',
      );
    },
  );
});
