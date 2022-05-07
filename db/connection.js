import mongoClient from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.URL;

const client = new mongoClient.MongoClient(url);

let connection = null;

async function getConnection() {
  if (connection === null) {
    try {
        connection = await client.connect();
        return connection;
      } catch (error) {
        console.log(error);
        throw new Error('Error en data - connection - getConnection(): ', error);
      }
  }
  return connection;
}

export default {getConnection};