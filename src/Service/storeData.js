const mysql = require('mysql2/promise');
const { Connector } = require('@google-cloud/cloud-sql-connector');

async function storeData() {
  try {
    // Create a Connector instance
    const connector = new Connector();

    // Configure connection options for Cloud SQL
    const clientOpts = await connector.getOptions({
      instanceConnectionName: 'capstonec242-ps168:asia-southeast2:refind-project', // Replace with your instance connection name
      ipType: 'PUBLIC', // Use 'PRIVATE' if your instance is private
    });

    // Create a connection pool
    const pool = await mysql.createPool({
      ...clientOpts,
      user: 'refind', // Replace with your database username
      password: 'root', // Replace with your database password
      database: 'refind', // Replace with your database name
    });

    console.log('Testing connection to the database...');

    // Test query to verify the connection
    const conn = await pool.getConnection();
    const [result] = await conn.query(`SELECT NOW();`);

    console.log('Connection successful! Server time:', result[0]['NOW()']);

    // Close the connection
    await pool.end();
    connector.close();
  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
  }
}


module.exports = storeData;
