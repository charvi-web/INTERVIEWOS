import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Interview from "../models/Interview.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback,
} from "../services/ai.service.js";

// Interview ke liye questions generate karo
export const startInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;
// :id — URL se interview ID aati hai
  // Example: POST /api/ai/start/6a37d646e19c7b470aadf4cf

  // interview dhundo DB mein
  // interview dhundo
  const interview = await Interview.findById(id);
  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  // sirf apna interview start kar sakta hai
  if (interview.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  // AI se questions generate karo
  const generatedQuestions = await generateInterviewQuestions({
    role: interview.role,
    difficulty: interview.difficulty,
    type: interview.type,
    company: interview.company,
    count: 10,
  });

  // questions DB mein save karo
  // insertMany — ek saath multiple documents insert karta hai
  // create() se fast hota hai

  const questions = await Question.insertMany(
  generatedQuestions.map((q) => ({
    text: q.question,
    type: q.type,
    difficulty: q.difficulty,
    order: q.order,
    interview: interview._id,
  }))
);

  // interview status update karo
  interview.status = "ongoing";
  await interview.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { interview, questions },
      "Interview started successfully"
    )
  );
});

// Answer submit karo aur AI se evaluate karo
export const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, transcript, timeTaken } = req.body;
// questionId — konse question ka answer hai
  // transcript — user ne jo bola — Speech to Text se aayega
  // timeTaken — kitne seconds mein answer diya
  if (!questionId || !transcript) {
    throw new ApiError(400, "Question ID and answer are required");
  }

  // question dhundo
  // question dhundo — .populate("interview") matlab
  // question ke saath interview ka pura data bhi aayega
  // warna sirf interview ID hoti

  const question = await Question.findById(questionId).populate("interview");
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // AI se evaluate karo
  const evaluation = await evaluateAnswer({
    question: question.text,
    answer: transcript,
    role: question.interview.role,
    difficulty: question.difficulty,
  });

  // answer save karo
  const answer = await Answer.create({
    question: questionId,
    session: req.body.sessionId,
    user: req.user._id,
    transcript,
    score: evaluation.score,
    feedback: evaluation.feedback,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    timeTaken: timeTaken || 0,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { answer, evaluation },
      "Answer evaluated successfully"
    )
  );
});

// Interview complete karo — overall feedback lo
export const completeInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const interview = await Interview.findById(id);
  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  // saare answers lo
  const questions = await Question.find({ interview: id });
  const answers = await Answer.find({
    question: { $in: questions.map((q) => q._id) },
    user: req.user._id,
  }).populate("question");

  if (answers.length === 0) {
    throw new ApiError(400, "No answers found");
  }

  // AI se overall feedback lo
  const overallFeedback = await generateOverallFeedback({
    answers: answers.map((a) => ({
      question: a.question.text,
      transcript: a.transcript,
      score: a.score,
    })),
    role: interview.role,
    company: interview.company,
  });

  // interview update karo
  interview.status = "completed";
  interview.score = overallFeedback.overallScore;
  interview.feedback = overallFeedback.summary;
  await interview.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { interview, overallFeedback, answers },
      "Interview completed successfully"
    )
  );
});

// Interview ke questions fetch karo
export const getInterviewQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const questions = await Question.find({ interview: id }).sort({ order: 1 });

  if (!questions.length) {
    throw new ApiError(404, "No questions found — start interview first");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, questions, "Questions fetched successfully"));
});