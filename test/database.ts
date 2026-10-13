import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { databaseConfig } from '../src/prisma/database-config.js';

export class TestDatabases {
  readonly admin = new PrismaClient({
    adapter: new PrismaMariaDb(databaseConfig(new ConfigService())),
  });
  private readonly prefix = `aula4_test_${Date.now()}_${process.pid}_`;
  private readonly databases: string[] = [];
  private readonly clients: PrismaClient[] = [];

  async create(label: 'crud' | 'baseline' | 'legacy' | 'collision') {
    const name = this.prefix + label;
    await this.admin.$executeRawUnsafe(
      `CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`,
    );
    this.databases.push(name);
    const url = new URL(process.env.DATABASE_URL!);
    url.pathname = '/' + name;
    const config = new ConfigService({
      DATABASE_URL: url.href,
      DB_HOST: url.hostname,
      DB_PORT: url.port || '3306',
      DB_USER: decodeURIComponent(url.username),
      DB_PASSWORD: decodeURIComponent(url.password),
      DB_NAME: name,
    });
    const client = new PrismaClient({
      adapter: new PrismaMariaDb(databaseConfig(config)),
    });
    this.clients.push(client);
    return { name, url: url.href, config, client };
  }

  prisma(url: string, args: string[]) {
    const name = new URL(url).pathname.slice(1);
    if (!this.databases.includes(name))
      throw new Error('Banco não pertence a este teste');
    try {
      return execFileSync(
        process.execPath,
        [resolve('node_modules/prisma/build/index.js'), ...args],
        {
          env: { ...process.env, DATABASE_URL: url },
          encoding: 'utf8',
          timeout: 30000,
          stdio: 'pipe',
        },
      );
    } catch {
      throw new Error(`Prisma falhou no banco isolado: ${args.join(' ')}`);
    }
  }

  async applySql(client: PrismaClient, migration: string, legacy = false) {
    let sql = readFileSync(
      resolve('prisma/migrations', migration, 'migration.sql'),
      'utf8',
    );
    if (legacy)
      sql = sql.replaceAll('utf8mb4_unicode_ci', 'utf8mb4_general_ci');
    for (const statement of sql
      .replace(/^--.*$/gm, '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)) {
      await client.$executeRawUnsafe(statement);
    }
  }

  async snapshotMain() {
    const rows = [];
    for (const table of [
      'alunos',
      'disciplinas',
      'cursos',
      '_prisma_migrations',
    ]) {
      rows.push(
        await this.admin.$queryRawUnsafe(
          `SELECT * FROM \`${table}\` ORDER BY id`,
        ),
      );
    }
    return createHash('sha256')
      .update(
        JSON.stringify(rows, (_, value: unknown) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      )
      .digest('hex');
  }

  async close() {
    for (const client of this.clients) await client.$disconnect();
    try {
      for (const name of this.databases) {
        if (
          !name.startsWith(this.prefix) ||
          !/^aula4_test_\d+_\d+_(crud|baseline|legacy|collision)$/.test(name)
        ) {
          throw new Error('Nome de banco de teste inválido');
        }
        await this.admin.$executeRawUnsafe(`DROP DATABASE \`${name}\``);
      }
    } finally {
      await this.admin.$disconnect();
    }
  }
}
