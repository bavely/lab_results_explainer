import { Router } from "express";
import multer from "multer";
import { env } from "../../config/env.js";
import { uploadLabReport } from "./pdf.controller.js";

export const pdfRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.mimetype)) {
      cb(new Error("Only PDF, PNG, JPG, JPEG, and WEBP files are allowed"));
      return;
    }
    cb(null, true);
  }
});

pdfRoutes.post("/upload", upload.single("file"), uploadLabReport);
