import { hello } from "../controllers/controller.js";
import express from "express";
const router = express.Router();

router.get("/", hello);

export default router;
