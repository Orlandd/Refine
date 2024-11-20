const crypto = require("crypto");
const predictClassification = require("../Service/inferenceService");
const storeData = require("../Service/storeData");

const mysql = require('mysql2/promise');
const { Connector } = require('@google-cloud/cloud-sql-connector');
const { log } = require("console");


async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const imageSize = Buffer.byteLength(image, "base64");

  console.log(imageSize);

  if (imageSize > 1000000) {
    const response = h.response({
      status: "fail",
      message: "Payload content length greater than maximum allowed: 1000000",
    });
    response.code(413);
    return response;
  }
  // console.log(model);

  const { label } = await predictClassification(model, image);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    id,
    result: label,
    createdAt,
  };

  const response = h.response({
    status: "success",
    message: "Model is predicted successfully",
    data,
  });
  response.code(201);

  const allcraft = await getDataCrafts(label);

  // foreach -> database -> histori  

  console.log(allcraft);
  console.log("tets")
  await storeData(1, allcraft)
  console.log("tetssss")

  return response;
}

async function getDataCrafts(label) { // Tambahkan parameter yang diperlukan
  try {
    // Create a Connector instance
    const connector = new Connector();

    // Configure connection options for Cloud SQL
    const clientOpts = await connector.getOptions({
      instanceConnectionName: 'capstonec242-ps168:asia-southeast2:refind-app', // Ganti dengan nama koneksi instance Anda
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


    const query = `SELECT id FROM Trash WHERE type = ?;`;
    const [rows] = await conn.query(query, [label]);

    const id = rows[0].id; // Ambil id dari hasil query pertama
    console.log(`id : ${id}`);

    const query2 = `
        SELECT * 
        FROM Trash_Crafts AS TC
        JOIN Crafts AS C ON TC.craft_id = C.id
        WHERE TC.trash_id = ?;
    `;
    const [result] = await conn.query(query2, [id]);

    // Close the connection
    await conn.release(); // Lepaskan koneksi
    await pool.end(); // Tutup pool
    connector.close();

    return result;

  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
  }
}


module.exports = postPredictHandler;
