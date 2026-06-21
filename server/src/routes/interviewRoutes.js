import { Router } from "express";
import {
  createInterview,
  getMyInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getDashboardStats,
} from "../controllers/interviewController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

// sab routes protected hain — verifyJWT middleware lagage
router.use(verifyJWT);

// dashboard stats
router.get("/stats", getDashboardStats);

// interview CRUD
router.post("/", createInterview);
router.get("/", getMyInterviews);
router.get("/:id", getInterviewById);
router.patch("/:id", updateInterview);
router.delete("/:id", deleteInterview);

export default router;