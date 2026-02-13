// consolidated error handler

const multer = require("multer");

const errorHandler = (error, _request, response, _next) => {
    console.error("Error: ", error);

    // multer-related errors
    if (error instanceof multer.MulterError) {
        return response.status(400).json({
            message: `Upload error: ${error.message}`,
        });
    }

    // invalid faile-type errors
    if (typeof error?.message === "string" && error.message.toLowerCase().includes("invalid file type")) {
        return response.status(400).json({ message: error.message });
    }

    // default error response
    return response.status(500).json({
        message: error?.message || "Server error",
    });
};

module.exports = errorHandler;
