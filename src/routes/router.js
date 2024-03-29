import express from "express";
import {
  getFeatures,
  getFeatureByID,
  createFeature,
  updateFeature,
  deleteFeature,
  createVariants,
  deleteVariants,
  getVariantsByExpID,
  getCurrentFeatures,
} from "../controllers/featuresController.js";
import { createEvent, getEvents, getEventsForFeature, getEventData } from "../controllers/eventsController.js";
import { getUsers, createUser, deleteUser } from "../controllers/usersController.js";
import { getUserblocks, setUserBlock, resetUserBlock, getUserblockByName } from "../controllers/userblocksController.js";

const router = express.Router();

router.get("/api/feature", getFeatures);

router.get("/api/feature/current", getCurrentFeatures);

router.get("/api/feature/:id", getFeatureByID);

router.post("/api/feature", createFeature);

router.put("/api/feature/:id", updateFeature);

router.delete("/api/feature/:id", deleteFeature);

router.post("/api/feature/:id/variants", createVariants);

router.get("/api/feature/:id/variants", getVariantsByExpID);

// dummy route
// router.put("/api/feature/:id/variants", updateVariants);

// router.delete("/api/feature/:id/variants", deleteVariants);

router.post("/api/events", createEvent);

router.get("/api/events", getEvents);

router.get("/api/events/feature/:id", getEventsForFeature);

router.get("/api/analysis/feature/:id", getEventData)

//clicks for day, hour, minute
//"/api/analysis/feature/:id/timeframe/:time"

router.get("/api/users", getUsers);

router.post("/api/users", createUser);

router.delete("/api/users/:id", deleteUser);

router.get("/api/userblocks", getUserblocks);

router.get("/api/userblocks/:name", getUserblockByName);

router.put("/api/userblocks", setUserBlock);

router.put("/api/userblocks/reset", resetUserBlock);

export default router;
