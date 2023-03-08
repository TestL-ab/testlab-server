import express from "express";
import {
  getExperiments,
  getExperimentByID,
  createExperiment,
  updateExperiment,
  deleteExperiment,
  createVariants,
  updateVariants,
  getVariantsByExpID,
} from "../controllers/experimentsController.js";
import { createEvent, getEvents, getEventsForExperiment, getEventData } from "../controllers/eventsController.js";
import { getUsers, createUser, deleteUser } from "../controllers/usersController.js";

const router = express.Router();

router.get("/api/experiment", getExperiments);

router.get("/api/experiment/:id", getExperimentByID);

router.post("/api/experiment", createExperiment);

// dummy route
// router.put("/api/experiment/:id", getExperiment);

// dummy route
router.put("/api/experiment/:id", updateExperiment);

router.delete("/api/experiment/:id", deleteExperiment);

router.post("/api/experiment/:id/variants", createVariants);

router.get("/api/experiment/:id/variants", getVariantsByExpID);

// dummy route
router.put("/api/experiment/:id/variants", updateVariants);

router.post("/api/events", createEvent);

router.get("/api/events", getEvents);

router.get("/api/events/experiment/:id", getEventsForExperiment);

router.get("/api/analysis/experiment/:id", getEventData)

//clicks for day, hour, minute
//"/api/analysis/experiment/:id/timeframe/:time"

router.get("/api/users", getUsers);

router.post("/api/users", createUser);

router.delete("/api/users/:id", deleteUser);

export default router;
