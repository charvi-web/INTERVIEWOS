import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema(
    {
        interview:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Interview",
            required:true,
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        startTime:{
            type:Date,
            default:Date.now,
        },
        endTime:{
            type:Date,
        },
        duration:{
            type:Number,
            default:0,
        },
        status:{
            type:String,
            enum:["active","completed","abandoned"],
            default:"active",
        },
        recordingUrl:{
            type:String,
            default:"",
        },
        transcript:{
            type:String,
            default:"",
        },
        //cheating detection 
        tabSwitchCount:{
            type:Number,
            default:0,
        },
        faceDetectionFlags:{
            type:Number,
            default:0,
        },
    },{timestamps:true}
)

export default mongoose.model("Session",sessionSchema);