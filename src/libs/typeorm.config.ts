import { join } from 'path';
import { env } from 'src/config';
import { DataSource } from 'typeorm';

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



export default dataSource;
