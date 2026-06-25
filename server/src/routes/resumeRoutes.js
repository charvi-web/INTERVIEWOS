import express from "express";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth.js";
import {
  uploadResume,
  analyzeResumeController,
  getResume,
  getAllResumes,
  deleteResume,
} from "../controllers/resumeController.js";

const router = express.Router();

router.use(verifyJWT); // all routes protected

router.post("/upload", upload.single("file"), uploadResume);
router.post("/analyze/:id", analyzeResumeController);
router.get("/all", getAllResumes);
router.get("/:id", getResume);
router.delete("/:id", deleteResume);

export default router;