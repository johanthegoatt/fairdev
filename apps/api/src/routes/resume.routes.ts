import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadResumeRateLimit } from "../middleware/rate-limit.js";
import { resumeUpload } from "../lib/upload.js";
import { parseResumeBuffer } from "../services/resume/parse-resume.service.js";

export const resumeRouter = Router();

resumeRouter.post("/", requireAuth, uploadResumeRateLimit, resumeUpload.single("file"), async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "A resume PDF file is required under form field 'file'." });
    }

    const parsed = await parseResumeBuffer(req.file.buffer);

    const resume = await prisma.resume.create({
      data: {
        userId: req.user!.id,
        skillsJson: parsed.skills,
        yearsExperience: parsed.yearsExperience,
        educationJson: parsed.education,
        workHistoryJson: parsed.workHistory,
      },
    });

    return res.status(200).json({
      resumeId: resume.id,
      parsed: {
        skills: parsed.skills,
        yearsExperience: parsed.yearsExperience,
        education: parsed.education,
        workHistory: parsed.workHistory,
      },
    });
  } catch (error) {
    return next(error);
  }
});