import { Router } from "express";
// Router — Express ka feature
// Alag alag routes group karne ke liye
// Jaise ek folder jisme saare interview related URLs hain
import {
  createInterview,
  getMyInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getDashboardStats,
} from "../controllers/interviewController.js";
// ye sab functions hain jo actual kaam karte hain
// Route sirf batata hai — "is URL pe ye function chalao"
import { verifyJWT } from "../middleware/auth.js";
// verifyJWT — token check karta hai
// Bina login ke koi bhi interview nahi dekh sakta
const router = Router();

// sab routes protected hain — verifyJWT middleware lagage
router.use(verifyJWT);
// router.use matlab — is router ke SAARE routes pe
// verifyJWT pehle chalega
// Matlab har request mein pehle token check hoga
// Ek baar likha — baar baar nahi likhna pada har route pe

// dashboard stats
router.get("/stats", getDashboardStats);
// GET /api/interviews/stats
// Dashboard ke liye data — total interviews, avg score etc

// interview CRUD
router.post("/", createInterview);
router.get("/", getMyInterviews);
router.get("/:id", getInterviewById);
// GET /api/interviews/123abc
// :id — dynamic parameter — koi bhi ID daal sakte ho
// Ek specific interview dekho

router.patch("/:id", updateInterview);
// Ek specific interview update karo
// PATCH matlab sirf kuch fields update karo
// PUT matlab puri cheez replace karo
router.delete("/:id", deleteInterview);

export default router;