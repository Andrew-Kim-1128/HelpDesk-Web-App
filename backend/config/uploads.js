const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ----- uploads -----
//creates new folder backend/uploads from env
const uploadDir = path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads");

// if folder does not exist (check synchronously), create.
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // if exists, don't error
}

// multer config to save files to disk (local storage)
const storage = multer.diskStorage({
    // params || req: request obj (info), file: metadata (schema), cb: callback (Multer functionality)
    destination: (_request, _file, cb) => cb(null, uploadDir), // (error, destination)

    // name file + timestamp
    filename: (_request, file, cb) => cb(null, `${Date.now()}_${file.originalname}`), // (error, filename)
});

// limit file types allowed for upload
const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5mb file size limit
    },
    fileFilter: (_req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Allowed types: PNG, JPG, JPEG, PDF, DOC, DOCX"), false);
        }
        cb(null, true);
    },
});

module.exports = { upload, uploadDir };
