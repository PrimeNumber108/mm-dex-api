import { join } from 'path';
import { env } from 'src/config';
import { DataSource } from 'typeorm';

// import { User } from 'src/modules/user/user.entity';

// import { Order } from 'src/modules/user/order.entity';



// const dataSource = new DataSource({
//   type: 'mysql',  // Changed to 'mysql'
//   url: `mysql://${env.mysql.username}:${env.mysql.password}@${env.mysql.host}:3306/mm_executor`,  // MySQL default port is 3306
//   entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
//   synchronize: true,
//   migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
//   extra: {
//     authPlugin: 'mysql_native_password' // ✅ Add this to support MySQL 8+
//   }
// });

const dataSource = new DataSource({
  type: 'mysql',
  host: env.mysql.host,   // e.g., 'localhost'
  port: 3306,
  username: env.mysql.username,
  password: env.mysql.password,
  database: 'mm_executor', // Your database name
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: true,
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  // extra: {
  //   authPlugin: 'mysql_native_password',
  // },
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
