import { ConfigService } from '@nestjs/config';
import { databaseConfig } from './database-config.js';

function config(values: Record<string, string>) {
  return {
    get: (key: string) => values[key],
    getOrThrow: (key: string) => {
      if (values[key] === undefined) throw new Error('Configuração ausente');
      return values[key];
    },
  } as unknown as ConfigService;
}

describe('Configuração do banco', () => {
  it('usa DATABASE_URL e decodifica a senha', () => {
    expect(
      databaseConfig(
        config({
          DATABASE_URL: 'mysql://usuario:senha%40teste@localhost/escola',
        }),
      ),
    ).toEqual({
      host: 'localhost',
      port: 3306,
      user: 'usuario',
      password: 'senha@teste',
      database: 'escola',
    });
  });

  it('rejeita configurações antigas divergentes sem revelar credenciais', () => {
    expect(() =>
      databaseConfig(
        config({
          DATABASE_URL: 'mysql://usuario:senha@localhost/escola',
          DB_NAME: 'outro',
        }),
      ),
    ).toThrow('DB_NAME diverge de DATABASE_URL');
  });

  it.each([
    'postgres://usuario:senha@localhost/escola',
    'mysql://usuario:senha@localhost',
  ])('rejeita URL incompatível: %s', (DATABASE_URL) => {
    expect(() => databaseConfig(config({ DATABASE_URL }))).toThrow();
  });
});
