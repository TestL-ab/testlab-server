import express from "express";
import { createExperiment } from "../controllers/controller.js";
const router = express.Router();

router.post("/api/experiment", createExperiment);

export default router;
