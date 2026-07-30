import { join } from 'path';
import { env } from 'src/config';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'mysql',
  host: env.mysql.host,   // e.g., 'localhost'
  port: 3306,
  username: env.mysql.username,
  password: env.mysql.password,
  database: 'mm_executor', // Your database name
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: env.env === 'local',
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
});

// Initialize the connection and handle any errors
dataSource
  .initialize()
  .then(() => {
    console.log('DataSource has been initialized!');
  })
  .catch((err) => {
    console.error('Error during DataSource initialization:', err);
  });

export default dataSource;
