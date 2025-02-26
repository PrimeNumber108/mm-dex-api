import { join } from 'path';
import { env } from 'src/config';
import { DataSource } from 'typeorm';

const dataSourceTest = new DataSource({
  type: 'postgres',
  url: env.postgres.testUrl,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: false,
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
});

export default dataSourceTest;
