import mongoose from "mongoose";
const resumeSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        fileUrl:{
            type:String,
            required:true,
        },
        cloudinaryId:{
            type:String,
            required:true
        },
        extractedText:{
            type:String,
            default:"",
        },
        skills:{
            type:[String],
            default:[],
        },
        experience: {
      type: [String],
      default: [],
    },

    education: {
      type: [String],
      default: [],
    },

    projects: {
      type: [String],
      default: [],
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
   