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
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files are allowed"));
      return;
    }
    cb(null, true);
  }
});

pdfRoutes.post("/upload", upload.single("file"), uploadLabReport);
