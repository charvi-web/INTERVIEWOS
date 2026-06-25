import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// tokens generate karo
const generateTokens = async (userId) => {
  try {
    //pehle user dhundo db mei
    const user = await User.findById(userId);
    //ACCESS TOKEN -- short lived (15min)
    //hr api request ke saath behja jata h
    // frontend localStorage mei store krta h
    const accessToken = jwt.sign(
      { id: user._id },  //payload - user ki identity 
      process.env.ACCESS_TOKEN_SECRET, // secret key -- sirf server jaanta h
      { expiresIn: "1h" } // 1 hr baad expire
    );
    //REFRESH TOKEN -- long lived(7 din)
    //sirf naya access token lene ke liye use hota h 
    // httpOnly cookie mein store hota h - JS Access nhi kr skti 
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    //refresh token db mei save kro
    //taaki logout pe invalidate kr sakein
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // validateBeforeSve -- false rkhne ka mtlb ki baaki required fields ko check mt kro just refreshToken save krna h 

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating tokens");
  }
};

// SIGNUP
export const signup = asyncHandler(async (req, res) => {
    //step 1: frontend se data lo 
  const { name, email, password } = req.body;

  //step 2 : validation - koi field empty toh nhi h ?
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  //step 3: check in DB email already registered toh nhi h ?
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  //step 4: create user
  // password yahan plain text hai — User.js ka pre hook
  // automatically bcrypt se hash kar dega save se pehle
  const user = await User.create({ name, email, password });

  // Step 5: created user fetch karo — password aur refreshToken hata ke
  // .select("-password -refreshToken") — minus matlab exclude karo
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error while creating user");
  }
// Step 6: tokens generate karo
  const { accessToken, refreshToken } = await generateTokens(user._id);
// Step 7: cookie options
  const options = {
    httpOnly: true, // JS se access nahi hoga — XSS attacks se protection
    secure: process.env.NODE_ENV === "production", // production mein HTTPS only
    sameSite: "strict", // CSRF attacks se protection
  };
// Step 8: response bhejo
  return res
    .status(201)
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din milliseconds mein
    })
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken },
        "User created successfully"
      )
      // ApiResponse — { statusCode, data, message, success }
    );
});

// LOGIN
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }
// email se user dhundo
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
// password check karo
  // isPasswordCorrect — User.js mein banaya tha
  // bcrypt.compare(enteredPassword, hashedPassword)
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Login successful"
      )
    );
});

// LOGOUT
export const logout = asyncHandler(async (req, res) => {
  // req.user — middleware se aayega (baad mein banayenge)
  // middleware verify karega token aur user attach karega req pe

  // DB mein refreshToken clear karo
  // $set — MongoDB operator — specific field update karo
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// REFRESH TOKEN
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully"
      )
    );
});