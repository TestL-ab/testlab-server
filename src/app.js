import express from "express";
import cors from "cors";
import router from "./routes/router.js";
import middleware from "./utils/middleware.js";

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/", router);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

export default app;
