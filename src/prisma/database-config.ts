import { ConfigService } from '@nestjs/config';

export function databaseConfig(config: ConfigService) {
  const url = new URL(config.getOrThrow<string>('DATABASE_URL'));
  if (url.protocol !== 'mysql:') {
    throw new Error('DATABASE_URL deve usar o protocolo mysql://');
  }

  const options = {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
  };
  if (!options.database) throw new Error('DATABASE_URL deve informar o banco');

  const legacy = {
    DB_HOST: options.host,
    DB_PORT: String(options.port),
    DB_USER: options.user,
    DB_PASSWORD: options.password,
    DB_NAME: options.database,
  };
  for (const [key, value] of Object.entries(legacy)) {
    const configured = config.get<string>(key);
    if (configured !== undefined && String(configured) !== value) {
      throw new Error(`${key} diverge de DATABASE_URL`);
    }
  }
  return options;
}
