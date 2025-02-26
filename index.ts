import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
