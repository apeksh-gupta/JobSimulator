import express from "express";
import {
  mapFieldsController,
  updateStatusController
} from "../controllers/autoApplyController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const autoApplyRoutes = express.Router();

// ✅ Map form fields with optional userId and auth
autoApplyRoutes.post("/map-fields",  mapFieldsController);

// ✅ Update job status (optional) – also auth protected
autoApplyRoutes.post("/update-status", updateStatusController);

export default autoApplyRoutes;
