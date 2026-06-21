import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

//test route
app.get("/",(req,res)=>{
    res.json(
        {
            message:"InterviewOS API running 🚀"
        }
    );
});

export default app;