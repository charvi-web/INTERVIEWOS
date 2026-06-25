import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    cloudinaryId: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
        },
      ],
      default: [],
    },

    education: {
      type: [
        {
          institution: String,
          degree: String,
          year: String,
          grade: String,
        },
      ],
      default: [],
    },

    projects: {
      type: [
        {
          name: String,
          description: String,
          techStack: [String],
        },
      ],
      default: [],
    },

    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    atsFeedback: {
      type: String,
      default: "",
    },

    analysisStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resume", resumeSchema);