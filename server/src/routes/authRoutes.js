import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
} from "../controllers/authController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

// public routes — koi bhi access kar sakta hai
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// protected routes — sirf logged in user access kar sakta hai
// verifyJWT middleware pehle chalega — phir logout
router.post("/logout", verifyJWT, logout);

export default router;



// POST /api/auth/signup  → signup controller
// POST /api/auth/login   → login controller
// POST /api/auth/refresh-token → refreshToken controller
// POST /api/auth/logout  → verifyJWT middleware → logout controller