import multer from "multer";

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const allowed = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
    if (allowed) {
      callback(null, true);
      return;
    }

    callback(new Error("Only PDF files are allowed."));
  },
});
