import multer from "multer";


// store file temporarily in RAM buffer
// because we directly send it to Cloudinary

const storage = multer.memoryStorage();



export const upload = multer({

    storage,


    limits: {

        // 5 MB max resume size

        fileSize: 5 * 1024 * 1024

    },


    fileFilter: (req, file, cb) => {


        // only PDF allowed

        if(file.mimetype === "application/pdf") {


            cb(null, true);


        } else {


            cb(
                new Error("Only PDF files are allowed"),
                false
            );


        }

    }


});