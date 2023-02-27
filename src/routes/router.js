import express from "express";
import {
  createExperiment,
  updateExperiment,
  createVariants,
  updateVariants,
} from "../controllers/controller.js";
const router = express.Router();

router.post("/api/experiment", createExperiment);

router.put("/api/experiment/:id", updateExperiment);

router.post("/api/experiment/:id/variants", createVariants);

router.put("/api/experiment/:id/variants", updateVariants);

export default router;
