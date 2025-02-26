import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

import { MongoClient, ServerApiVersion } from "mongodb";

// Replace with your actual MongoDB connection URI
const uri: string = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5lka3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client: MongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run(): Promise<void> {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

// Run the function
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Manager is on work");
});

app.listen(port, () => {
  console.log(`Task Manager is working in port: ${port}`);
});
