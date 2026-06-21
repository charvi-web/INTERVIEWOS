import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // Step 1: token lo — cookie se ya header se
  // frontend header mein bhejta hai: Authorization: Bearer <token>
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized - No token provided");
  }

  // Step 2: token verify karo
  // agar token tampered ya expired hai toh jwt.verify error throw karega
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // Step 3: decoded token se user dhundo DB mein
  const user = await User.findById(decoded.id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Unauthorized - Invalid token");
  }

  // Step 4: user ko req pe attach karo
  // ab kisi bhi protected route mein req.user available hoga
  req.user = user;

  // Step 5: next middleware ya controller pe jao
  next();
});



// Request aati hai
//       ↓
// verifyJWT middleware
//       ↓
// Token check karo (cookie/header)
//       ↓
// jwt.verify se decode karo
//       ↓
// User DB mein dhundo
//       ↓
// req.user = user (attach karo)
//       ↓
// next() — controller pe jao