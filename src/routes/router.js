import express from "express";
import {
  getExperiments,
  createExperiment,
  updateExperiment,
  deleteExperiment,
  createVariants,
  updateVariants,
} from "../controllers/controller.js";
import { createEvent, getEvents, getEventsForExperiment } from "../controllers/eventsController.js";

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

// dummy route <- MVP
router.get("/api/events", getEvents);

// dummy route <- MVP
router.get("/api/events/experiment/:id", getEventsForExperiment);

// dummy route
// router.post("/api/users", addUser);
// sample PSQL for adding users:
// INSERT INTO users (id, variant_id, ip_address) VALUES ('65b5b74c-b79e-11ed-afa1-0242ac120002', 23, '192.168.101.20');

// dummy route
// router.get("/api/users/:id", getUser);

export default router;
