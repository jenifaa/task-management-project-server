import * as dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, Document, ObjectId } from "mongodb";
import { createServer } from "http"; // Changed from 'node:http'
import { Server } from "socket.io";

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri: string = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5lka3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

interface Task extends Document {
  email: string;
  taskName: string;
  description?: string;
  completed?: boolean;
}

async function run(): Promise<void> {
  try {
    const taskCollection = client.db("allTask").collection<Task>("tasks");

    // HTTP POST route for adding tasks
    app.post("/tasks", async (req: Request, res: Response) => {
      const task: Task = req.body;

      const result = await taskCollection.insertOne(task);
      io.emit("taskAdded", task);
      res.send(result);
    });

    app.get("/taskAdded", async (req: Request, res: Response) => {
      const email = req.query.email as string;

      try {
        const query = { email };
        const result = await taskCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).json({ message: "Server error", error });
      }
    });
    app.put("/tasks/:id", async (req: Request, res: Response) => {
      const taskId = req.params.id;
      const updatedTask: Partial<Task> = req.body;

      try {
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updatedTask }
        );

        io.emit("taskUpdated", { ...updatedTask, _id: taskId });

        res.json({ message: "Task updated successfully" });
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error", error });
      }
    });
    app.delete("/tasks/:id", async (req: Request, res: Response) => {
      const taskId = req.params.id;

      try {
        const result = await taskCollection.deleteOne({
          _id: new ObjectId(taskId),
        });

        io.emit("taskDeleted", taskId);

        res.json({ message: "Task deleted successfully" });
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Server error", error });
      }
    });

    // Ping MongoDB to ensure connection is working
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Run the function to connect to MongoDB
run().catch(console.dir);

app.get("/", (req: Request, res: Response) => {
  res.send("Task Manager is on work");
});

server.listen(port, () => {
  console.log(`Task Manager is working in port: ${port}`);
});
