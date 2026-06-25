import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js"; // ← add karo
import interviewRoutes from "./routes/interviewRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
const app = express();

//middlewares
app.use(
    cors(
        {
            origin:"http://localhost:5173",
            credentials:true
        }
    )
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes); // ← add karo
app.use("/api/interviews", interviewRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/resume",resumeRoutes);
//test route
app.get("/",(req,res)=>{
    res.json(
        {
            message:"InterviewOS API running 🚀"
        }
    );
});

export default app;