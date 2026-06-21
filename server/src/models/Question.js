import mongoose from "mongoose";
const questionSchema = new mongoose.Schema(
    {
        interview:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Interview",
            required:true,
        },
        text:{
            type: String,
            required: true,
        },
        type:{
            type:String,
            enum:["technical","behavioral","coding","resume"],
            default:"technical",
        },
        difficulty:{
            type:String,
            enum:["easy","medium","hard"],
            default:"medium"
        },
        order:{
            type:Number,
            default:0
        },
        isFollowUp:{
            type:Boolean,
            default:false
        },
        parentQuestion:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Question",
            default:null,
        },
        aiGenerated:{
            type:Boolean,
            default:true
        },
    },
    {timestamps:true}
);
export default mongoose.model("Question", questionSchema);
