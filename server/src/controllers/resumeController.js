import Resume from "../models/Resume.js";
import cloudinary from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { analyzeResume } from "../utils/analyzeResume.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// -------------------------
// PDF TEXT EXTRACTOR
// -------------------------
const extractTextFromPDF = async (buffer) => {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    if (!fullText.trim()) {
      throw new ApiError(400, "PDF unreadable or scanned image PDF");
    }

    return fullText.trim();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(400, "Failed to parse PDF: " + err.message);
  }
};

// -------------------------
// UPLOAD RESUME
// -------------------------
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    throw new ApiError(400, "No file uploaded");
  }

  const buffer = Buffer.from(req.file.buffer);
  let uploadResult;
  let extractedText;

  try {
    [uploadResult, extractedText] = await Promise.all([
      new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "raw", folder: "InterviewOS/resumes" },
            (error, result) => (error ? reject(error) : resolve(result))
          )
          .end(buffer);
      }),
      extractTextFromPDF(buffer),
    ]);

    const resume = await Resume.create({
      user: req.user._id,
      fileUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      extractedText,
      analysisStatus: "pending",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, resume, "Resume uploaded successfully"));

  } catch (err) {
    if (uploadResult?.public_id) {
      await cloudinary.uploader.destroy(uploadResult.public_id, {
        resource_type: "raw",
      });
    }
    throw err;
  }
});

// -------------------------
// ANALYZE RESUME
// -------------------------
export const analyzeResumeController = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  if (!resume.extractedText) {
    throw new ApiError(400, "No extracted text found in this resume");
  }

  if (resume.analysisStatus === "completed") {
    return res
      .status(200)
      .json(new ApiResponse(200, resume, "Resume already analyzed"));
  }

  // Mark as processing
  resume.analysisStatus = "processing";
  await resume.save();

  try {
    const analysis = await analyzeResume(resume.extractedText);

    resume.skills = analysis.skills || [];
    resume.experience = analysis.experience || [];
    resume.education = analysis.education || [];
    resume.projects = analysis.projects || [];
    resume.atsScore = analysis.atsScore || 0;
    resume.atsFeedback = analysis.atsFeedback || "";
    resume.analysisStatus = "completed";

    await resume.save();

    return res
      .status(200)
      .json(new ApiResponse(200, resume, "Resume analyzed successfully"));

  } catch (err) {
    resume.analysisStatus = "failed";
    await resume.save();
    throw new ApiError(500, "AI analysis failed: " + err.message);
  }
});

// -------------------------
// GET RESUME
// -------------------------
export const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resume, "Resume fetched successfully"));
});

// -------------------------
// GET ALL RESUMES OF USER
// -------------------------
export const getAllResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, resumes, "Resumes fetched successfully"));
});

// -------------------------
// DELETE RESUME
// -------------------------
export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  await cloudinary.uploader.destroy(resume.cloudinaryId, {
    resource_type: "raw",
  });

  await resume.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Resume deleted successfully"));
});