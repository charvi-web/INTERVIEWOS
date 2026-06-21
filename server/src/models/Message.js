import mongoose from "mongoose"
const messageSchema = new mongoose.Schema(
    {
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        receiver:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        message:{
            type:String,
            required:true
        },
        isRead:{
            type:Boolean,
            default:false,
        },
        session:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Session",
            default:null,
        },
    },{timestamps:true}
)
export default mongoose.model("Message",messageSchema);