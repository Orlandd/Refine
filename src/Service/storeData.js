const mysql = require('mysql2/promise');
const { Connector } = require('@google-cloud/cloud-sql-connector');

async function storeData(user_id, trash_craft_id) { // Tambahkan parameter yang diperlukan
  try {
    // Create a Connector instance
    const connector = new Connector();

    // Configure connection options for Cloud SQL
    const clientOpts = await connector.getOptions({
      instanceConnectionName: 'capstonec242-ps168:asia-southeast2:refind-project', // Ganti dengan nama koneksi instance Anda
      ipType: 'PUBLIC', // Gunakan 'PRIVATE' jika instance Anda bersifat privat
    });

    // Create a connection pool
    const pool = await mysql.createPool({
      ...clientOpts,
      user: 'refind', // Ganti dengan username database Anda
      password: 'root', // Ganti dengan password database Anda
      database: 'Refind', // Ganti dengan nama database Anda
    });

    console.log('Testing connection to the database...');

    // Test query to verify the connection
    const conn = await pool.getConnection();
    const [result] = await conn.query(`SELECT NOW();`);

    // Pastikan untuk mendefinisikan id jika diperlukan
    const id = 1; // Ganti dengan nilai yang sesuai
    const query = `INSERT INTO Histories (user_id, trash_craft_id) 
                   VALUES (?, ?);`; // Hanya dua placeholder

    await conn.execute(query, [user_id, trash_craft_id]); // Gunakan conn di sini

    console.log('Connection successful! Server time:', result[0]['NOW()']);

    // Close the connection
    await conn.release(); // Lepaskan koneksi
    await pool.end(); // Tutup pool
    connector.close();
  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
  }
}

module.exports = storeData;