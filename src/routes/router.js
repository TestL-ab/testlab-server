import express from "express";
import {
  getExperiments,
  createExperiment,
  updateExperiment,
  deleteExperiment,
  createVariants,
  updateVariants,
} from "../controllers/controller.js";
const router = express.Router();

router.get("/api/experiment", getExperiments);

router.post("/api/experiment", createExperiment);

// dummy route
// router.put("/api/experiment/:id", getExperiment);

// dummy route
router.put("/api/experiment/:id", updateExperiment);

router.delete("/api/experiment/:id", deleteExperiment);

router.post("/api/experiment/:id/variants", createVariants);

// dummy route
router.put("/api/experiment/:id/variants", updateVariants);

// dummy route <- MVP
// router.post("/api/events", addEvent);

//dummy route <- MVP
// router.get("/api/events", getEvents);

// dummy route
// router.post("/api/users", addUser);

// dummy route
// router.get("/api/users/:id", getUser);

export default router;
