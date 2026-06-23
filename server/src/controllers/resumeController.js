import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";

import Resume from "../models/Resume.js";

import fs from "fs";
import pdf from "pdf-parse";


export const uploadResume = asyncHandler(async(req,res)=>{


    if(!req.file){
        throw new ApiError(
            400,
            "Resume PDF required"
        )
    }


    const dataBuffer = fs.readFileSync(
        req.file.path
    )


    const pdfData = await pdf(dataBuffer)


    const resume = await Resume.create({

        user:req.user._id,

        fileName:req.file.filename,

        extractedText:pdfData.text

    })


    return res.status(201).json(

        new ApiResponse(
            201,
            resume,
            "Resume uploaded successfully"
        )

    )
})