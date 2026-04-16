import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);  //edit the filename in actual project
  },
});

export const upload = multer({ 
    storage, 
    limits: {
        fileSize: 10 * 1024 * 1024, // Updated to 10MB
    },
})
