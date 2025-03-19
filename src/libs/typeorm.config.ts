import { join } from 'path';
import { env } from 'src/config';
import { DataSource } from 'typeorm';

// const dataSource = new DataSource({
//   type: 'postgres',
//   url: `postgres://${env.postgres.username}:${env.postgres.password}@${env.postgres.host}:5432/mm_executor`,
//   entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
//   synchronize: false,
//   migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
// });

const dataSource = new DataSource({
  type: 'mysql',  // Changed to 'mysql'
  url: `mysql://${env.mysql.username}:${env.mysql.password}@${env.mysql.host}:3306/mm_executor`,  // MySQL default port is 3306
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: false,
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  extra: {
    authPlugin: 'mysql_native_password' // ✅ Add this to support MySQL 8+
  }
});

// const dataSource = new DataSource({
//   type: 'mysql',  // Using MySQL instead of Postgres
//   host: env.mysql.host,  // Explicitly define host
//   port: 3306,  // MySQL default port
//   username: env.mysql.username,  // Explicitly define username
//   password: env.mysql.password,  // Explicitly define password
//   database: 'mm_executor',  // Database name
//   entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
//   synchronize: false,
//   migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
//   // extra: {
//   //   authPlugin: 'caching_sha2_password' // ✅ Ensure MySQL 8+ authentication works
//   // }
//   extra: {
//     authPlugin: "mysql_native_password"
//   }
// });



export default dataSource;
