import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import {authRoute} from "./modules/auth/auth.route";
import { userRoute } from "./modules/users/user.route";
import { issueRoute } from "./modules/issues/issue.route";

const app: Application = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running...");
});

app.use("/api/users", userRoute);
app.use("/api/issues", issueRoute);
app.use("/api/auth", authRoute);

export default app;