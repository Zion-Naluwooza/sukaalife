import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const SUNBIRD_TRANSCRIPTION_URL =
  process.env.SUNBIRD_STT_URL || 'https://api.sunbird.ai/tasks/audio/transcriptions';

/**
 * Clean and polish raw ASR transcription into user-friendly, grammatically clean text
 */
export function formatAndCleanTranscript(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.trim();

  // If text is accidentally a JSON string, extract the inner transcript
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      text =
        parsed.audio_transcription ||
        parsed.formatted_diarization_output ||
        parsed.transcription ||
        parsed.transcript ||
        parsed.text ||
        parsed.output ||
        parsed.result ||
        text;
    } catch {
      // not json, keep original text
    }
  }

  // Common speech-to-text contractions & English pronoun corrections
  text = text
    .replace(/\bi m\b/gi, "I'm")
    .replace(/\bi ve\b/gi, "I've")
    .replace(/\bi ll\b/gi, "I'll")
    .replace(/\bi d\b/gi, "I'd")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bwont\b/gi, "won't")
    .replace(/\bhes\b/gi, "he's")
    .replace(/\bshes\b/gi, "she's")
    .replace(/\btheyre\b/gi, "they're")
    .replace(/\bweve\b/gi, "we've")
    .replace(/\b(i)\b/g, "I"); // Standalone 'i' -> 'I'

  // Normalize spacing around punctuation
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\s+([,.;?!])/g, '$1');
  text = text.replace(/([,.;?!])(?=[A-Za-z0-9])/g, '$1 ');

  // Sentence capitalization (at start of text or after . / ? / !)
  text = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_match, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });

  // Ensure the very first character is capitalized
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text.trim();
}

export const transcribeWithSunbird = async (req: Request, res: Response): Promise<void> => {
  let tempFilePath: string | null = null;
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file provided. Please record or upload an audio file.' });
      return;
    }

    // Reject micro-recordings under ~1.5KB which are too short for ASR models
    const fileSize = req.file.size || (req.file.buffer ? req.file.buffer.length : 0);
    if (fileSize > 0 && fileSize < 1200) {
      res.status(400).json({
        error: 'Recording was too short. Please hold the record button and speak clearly for at least 1-2 seconds.',
      });
      return;
    }

    const token = process.env.SUNBIRD_API_TOKEN;
    if (!token) {
      console.warn('Warning: SUNBIRD_API_TOKEN is not configured in backend environment.');
    }

    const language = (req.body.language || req.query.language || 'eng').toString().trim().toLowerCase();
    const formData = new FormData();

    // Support memory buffer (single audio field)
    if (req.file.buffer) {
      const originalName = req.file.originalname || 'recording.webm';
      const contentType = req.file.mimetype || 'audio/webm';
      formData.append('audio', req.file.buffer, {
        filename: originalName,
        contentType: contentType,
      });
    } else if (req.file.path) {
      tempFilePath = path.resolve(req.file.path);
      formData.append('audio', fs.createReadStream(tempFilePath));
    }

    formData.append('language', language);

    console.log(`[Sunbird AI STT] Requesting transcription from ${SUNBIRD_TRANSCRIPTION_URL} (Language: ${language}, Size: ${fileSize} bytes)...`);

    const response = await axios.post(SUNBIRD_TRANSCRIPTION_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      timeout: 35000,
    });

    // Clean up temporary local file if one was used
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupErr) {
        console.warn('Failed to remove temp file:', cleanupErr);
      }
    }

    // Extract transcription text cleanly from Sunbird response schema
    let transcriptText = '';
    const resData = response.data;

    if (typeof resData === 'string') {
      try {
        const parsed = JSON.parse(resData);
        transcriptText =
          parsed.audio_transcription ||
          parsed.formatted_diarization_output ||
          parsed.transcription ||
          parsed.transcript ||
          parsed.text ||
          resData;
      } catch {
        transcriptText = resData;
      }
    } else if (resData && typeof resData === 'object') {
      transcriptText =
        resData.audio_transcription ||
        resData.formatted_diarization_output ||
        resData.transcription ||
        resData.transcript ||
        resData.text ||
        resData.output ||
        resData.result ||
        (resData.data && (resData.data.audio_transcription || resData.data.text || resData.data.transcription)) ||
        '';

      if (!transcriptText && Array.isArray(resData.segments)) {
        transcriptText = resData.segments.map((s: any) => s.text || '').join(' ').trim();
      }
    }

    // Format and polish into user-friendly text
    const cleanTranscript = formatAndCleanTranscript(transcriptText);

    console.log(`[Sunbird AI STT] Transcription complete: "${cleanTranscript.slice(0, 80)}..."`);

    res.status(200).json({
      message: 'Transcription successful',
      transcript: cleanTranscript,
      raw_transcript: transcriptText,
      language: language,
      duration_seconds: resData?.duration_seconds || null,
      raw: resData,
    });
  } catch (error: any) {
    // Clean up temporary local file if error occurred
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupErr) {
        console.warn('Failed to remove temp file:', cleanupErr);
      }
    }

    const apiErrorData = error.response?.data;
    const statusCode = error.response?.status || 500;
    console.error('[Sunbird AI STT] API error:', apiErrorData || error.message);

    const rawError =
      (typeof apiErrorData === 'string' ? apiErrorData : null) ||
      apiErrorData?.detail ||
      apiErrorData?.message ||
      apiErrorData?.error ||
      error.message ||
      '';

    let friendlyErrorMessage = 'Failed to transcribe audio via Sunbird AI.';
    if (
      rawError.includes('ASR API error') ||
      rawError.includes('Internal Server Error') ||
      statusCode === 500
    ) {
      friendlyErrorMessage =
        'Sunbird AI could not recognize speech in this recording. The audio may have been too brief, silent, or noisy. Please speak clearly for at least 1-2 seconds and try again.';
    } else if (statusCode === 403 || rawError.includes('verification')) {
      friendlyErrorMessage =
        'Sunbird API authentication error: Email verification required for your account.';
    } else if (rawError) {
      friendlyErrorMessage = rawError;
    }

    res.status(statusCode).json({
      error: friendlyErrorMessage,
      raw_error: apiErrorData || error.message,
    });
  }
};
