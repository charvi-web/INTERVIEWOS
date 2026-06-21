import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Interview from "../models/Interview.js";
import Session from "../models/Session.js";

// CREATE INTERVIEW
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
export const getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 }); // latest pehle

  return res
    .status(200)
    .json(new ApiResponse(200, interviews, "Interviews fetched successfully"));
});

// GET SINGLE INTERVIEW
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
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // total interviews
  const totalInterviews = await Interview.countDocuments({
    createdBy: userId,
  });

  // completed interviews
  const completedInterviews = await Interview.countDocuments({
    createdBy: userId,
    status: "completed",
  });

  // average score
  const scoreData = await Interview.aggregate([
    {
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
        _id: "$difficulty",
        count: { $sum: 1 },
      },
    },
  ]);

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
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

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