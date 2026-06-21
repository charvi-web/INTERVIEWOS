import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Interview from "../models/Interview.js";
import Session from "../models/Session.js";

// CREATE INTERVIEW
// User naya interview create karta hai
// req.body se data aata hai — title, company, type etc
// req.user._id — verifyJWT middleware ne attach kiya tha
// createdBy mein logged in user ki ID save hoti hai
// Taaki baad mein sirf uske interviews fetch kar sakein
export const createInterview = asyncHandler(async (req, res) => {
  const { title, company, type, difficulty, role } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  const interview = await Interview.create({
    title,
    company: company || "",
    type: type || "technical",
    difficulty: difficulty || "medium",
    role: role || "sde",
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, interview, "Interview created successfully"));
});

// GET ALL INTERVIEWS OF LOGGED IN USER
// Sirf logged in user ke interviews fetch karo
// createdBy: req.user._id — filter lagaya
// sort({createdAt: -1}) — latest pehle aayega
// -1 matlab descending order
export const getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 }); // latest pehle

  return res
    .status(200)
    .json(new ApiResponse(200, interviews, "Interviews fetched successfully"));
});

// GET SINGLE INTERVIEW
// :id se ek specific interview dhundo
// 2 checks:
// 1. Interview exist karta hai?
// 2. Ye interview is user ka hai? (dusra user na dekh sake)
// interview.createdBy.toString() !== req.user._id.toString()
// toString() isliye kyunki MongoDB ObjectId aur string compare nahi hote directly
export const getInterviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await Interview.findById(id);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  // sirf apna interview dekh sakta hai
  if (interview.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, interview, "Interview fetched successfully"));
});

// UPDATE INTERVIEW
// $set — MongoDB operator
// Sirf jo fields bheje hain unhe update karo
// Baaki same rehta hai
// title: title || interview.title
// matlab — agar naya title bheja toh update karo
// warna purana wala rakho
export const updateInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, company, type, difficulty, role, status, score, feedback } =
    req.body;

  const interview = await Interview.findById(id);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  if (interview.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const updatedInterview = await Interview.findByIdAndUpdate(
    id,
    {
      $set: {
        title: title || interview.title,
        company: company || interview.company,
        type: type || interview.type,
        difficulty: difficulty || interview.difficulty,
        role: role || interview.role,
        status: status || interview.status,
        score: score || interview.score,
        feedback: feedback || interview.feedback,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedInterview, "Interview updated successfully")
    );
});

// DELETE INTERVIEW
export const deleteInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await Interview.findById(id);

  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  if (interview.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  await Interview.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Interview deleted successfully"));
});

// GET DASHBOARD STATS
// Ye function charts ke liye data deta hai
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // total interviews
  // countDocuments — kitne documents hain count karo
  const totalInterviews = await Interview.countDocuments({
    createdBy: userId,
  });

  // completed interviews
  const completedInterviews = await Interview.countDocuments({
    createdBy: userId,
    status: "completed",
  });
// sirf completed interviews count
// aggregate — MongoDB ka powerful feature--pipelines ke liye hota h
// Multiple operations ek saath karo
  // average score
  const scoreData = await Interview.aggregate([
    {// $match — filter karo (WHERE clause jaisa SQL mein)
      $match: {
        createdBy: userId,
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        avgScore: { $avg: "$score" },
        maxScore: { $max: "$score" },
      },
    },
  ]);

  // interviews by difficulty
  const byDifficulty = await Interview.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: "$difficulty",  // difficulty ke basis pe group karo
        count: { $sum: 1 }   // har group mein kitne hain count karo
      },
    },
  ]);
// Result: [{_id: "easy", count: 3}, {_id: "hard", count: 5}]
// Ye data pie chart mein jayega frontend pe

  // interviews by type
  const byType = await Interview.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  // last 7 days activity
  const last7Days = await Interview.aggregate([
    {
      $match: {
        createdBy: userId,
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
    // $gte — greater than or equal
    // last 7 din ka data
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        // date ko string mein convert karo — "2026-06-21"
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
// Result: [{_id: "2026-06-15", count: 2}, {_id: "2026-06-16", count: 1}]
// Ye data line chart mein jayega — activity graph

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalInterviews,
        completedInterviews,
        pendingInterviews: totalInterviews - completedInterviews,
        avgScore: scoreData[0]?.avgScore?.toFixed(1) || 0,
        maxScore: scoreData[0]?.maxScore || 0,
        byDifficulty,
        byType,
        last7Days,
      },
      "Dashboard stats fetched successfully"
    )
  );
});