import { Router } from "express";
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewQuestions,
} from "../controllers/aiController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

// sab routes protected hain
router.use(verifyJWT);

// interview start karo — AI questions generate karega
router.post("/start/:id", startInterview);

// interview ke questions fetch karo
router.get("/questions/:id", getInterviewQuestions);

// answer submit karo — AI evaluate karega
router.post("/answer", submitAnswer);

// interview complete karo — overall feedback
router.post("/complete/:id", completeInterview);

export default router;