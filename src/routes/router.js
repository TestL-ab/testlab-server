import express from "express";
import {
  getExperiments,
  createExperiment,
  updateExperiment,
  deleteExperiment,
  createVariants,
  updateVariants,
} from "../controllers/experimentsController.js";
import { createEvent, getEvents, getEventsForExperiment } from "../controllers/eventsController.js";
import { getUsers, createUser } from "../controllers/usersController.js";

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
router.post("/api/events", createEvent);


router.get("/api/events", getEvents);

// dummy route <- MVP
router.get("/api/events/experiment/:id", getEventsForExperiment);

router.get("/api/users", getUsers);

router.post("/api/users", createUser);
export default router;
