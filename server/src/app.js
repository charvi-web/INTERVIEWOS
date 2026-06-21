import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js"; // ← add karo

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

//test route
app.get("/",(req,res)=>{
    res.json(
        {
            message:"InterviewOS API running 🚀"
        }
    );
});

export default app;