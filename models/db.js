const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
let db;

async function connectDB() {
  await client.connect();
  const dbName = process.env.DB_NAME || "userDB";
  db = client.db(dbName);
  console.log("Connected to MongoDB");
}

function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}

module.exports = { connectDB, getDB };
