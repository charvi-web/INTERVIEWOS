import mongoose from "mongoose";
const answerSchema = new mongoose.Schema(
    {
        question:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Question",
            required:true,
        },
        session:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Session",
            required:true
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        transcript: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },improvements: {
      type: [String],
      default: [],
    },

    timeTaken: {
      type: Number, // seconds mein
      default: 0,
    },
    },{timestamps:true}
);
export default mongoose.model("Answer", answerSchema);
