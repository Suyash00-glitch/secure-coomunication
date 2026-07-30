const multer = require("multer");

const storage = multer.diskStorage({

    destination(req, file, cb) {
        cb(null, "uploads/");
    },

    filename(req, file, cb) {
        cb(
            null,
            Date.now() + "_" + file.originalname
        );
    }

});

const allowedTypes = [

    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    "image/png",

    "image/jpeg",

    "text/plain",

    "text/csv"

];

const fileFilter = (req, file, cb) => {

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"), false);
    }

};

module.exports = multer({

    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter

});