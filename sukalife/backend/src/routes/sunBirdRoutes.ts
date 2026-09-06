import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { transcribeWithSunbird } from '../controllers/sunBirdController.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max audio size
  },
});

const router = Router();

// Middleware to normalize 'audio' or 'file' form fields onto req.file
const normalizeAudioUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error processing audio upload.' });
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      if (files['audio'] && files['audio'].length > 0) {
        req.file = files['audio'][0];
      } else if (files['file'] && files['file'].length > 0) {
        req.file = files['file'][0];
      }
    }
    next();
  });
};

router.post('/transcribe', normalizeAudioUpload, transcribeWithSunbird);

export default router;
