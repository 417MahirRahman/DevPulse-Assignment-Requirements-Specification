import express, { type Application, type Request, type Response } from "express";
import config from "./config";
import { initDB } from "./database";

const app : Application = express();
const port = config.port;

app.use(express.json());

initDB();

app.get("/", (req : Request, res : Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
