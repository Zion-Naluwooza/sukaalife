'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Loader2,
  Globe,
  Check,
  AlertCircle,
  Volume2,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export interface VoiceDictationButtonProps {
  onTranscribe: (text: string) => void;
  defaultLanguage?: string;
  className?: string;
  buttonLabel?: string;
  compact?: boolean;
  disabled?: boolean;
  placeholderContext?: string;
}

const SUNBIRD_LANGUAGES = [
  { code: 'eng', label: 'English', native: 'English' },
  { code: 'lug', label: 'Luganda', native: 'Oluganda' },
  { code: 'swa', label: 'Kiswahili', native: 'Kiswahili' },
  { code: 'nyn', label: 'Runyankole', native: 'Runyankore-Rukiga' },
  { code: 'ach', label: 'Acholi', native: 'Leb Acholi' },
  { code: 'lgg', label: 'Lugbara', native: 'Lugbarati' },
  { code: 'teo', label: 'Ateso', native: 'Ateso' },
];

export default function VoiceDictationButton({
  onTranscribe,
  defaultLanguage = 'eng',
  className = '',
  buttonLabel,
  compact = false,
  disabled = false,
  placeholderContext,
}: VoiceDictationButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startRecording = async () => {
    setErrorMessage(null);

    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Audio recording is not supported in this browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        audioChunksRef.current = [];

        if (audioBlob.size < 1500) {
          setErrorMessage('Recording was too brief. Please speak clearly for at least 1-2 seconds.');
          return;
        }

        await handleTranscribeAudio(audioBlob);
      };

      mediaRecorder.start(250); // Collect slice every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 120) {
            // Auto stop after 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start microphone recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
      } else {
        setErrorMessage(err.message || 'Unable to access microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    audioChunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setErrorMessage(null);
  };

  function cleanTranscriptText(rawInput: any): string {
    if (!rawInput) return '';

    let text = typeof rawInput === 'string' ? rawInput.trim() : '';

    // If object was passed directly or string is JSON
    if (typeof rawInput === 'object') {
      text =
        rawInput.transcript ||
        rawInput.audio_transcription ||
        rawInput.formatted_diarization_output ||
        rawInput.transcription ||
        rawInput.text ||
        '';
    } else if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const parsed = JSON.parse(text);
        text =
          parsed.transcript ||
          parsed.audio_transcription ||
          parsed.formatted_diarization_output ||
          parsed.transcription ||
          parsed.text ||
          text;
      } catch {
        // keep text as-is
      }
    }

    // Contractions & pronoun polish for natural reading
    text = text
      .replace(/\bi m\b/gi, "I'm")
      .replace(/\bi ve\b/gi, "I've")
      .replace(/\bi ll\b/gi, "I'll")
      .replace(/\bi d\b/gi, "I'd")
      .replace(/\bdont\b/gi, "don't")
      .replace(/\bcant\b/gi, "can't")
      .replace(/\bwont\b/gi, "won't")
      .replace(/\b(i)\b/g, "I");

    // Spacing around punctuation
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\s+([,.;?!])/g, '$1');
    text = text.replace(/([,.;?!])(?=[A-Za-z0-9])/g, '$1 ');

    // Capitalize sentences
    text = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_m, p, l) => p + l.toUpperCase());

    if (text.length > 0) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }

    return text.trim();
  }

  const handleTranscribeAudio = async (blob: Blob) => {
    try {
      setIsTranscribing(true);
      setErrorMessage(null);

      const response = await api.transcribeAudio(blob, selectedLanguage);
      const rawText = (response as any)?.transcript || (response as any)?.audio_transcription || response;
      const cleanResult = cleanTranscriptText(rawText);

      if (cleanResult) {
        onTranscribe(cleanResult);
      } else {
        setErrorMessage('No speech recognized in the recording. Please try speaking again.');
      }
    } catch (err: any) {
      const rawErr = err?.message || '';
      let displayError = rawErr;
      if (rawErr.includes('ASR API error') || rawErr.includes('Internal Server Error')) {
        displayError = 'Sunbird AI could not recognize speech. Please speak clearly into your microphone for at least 1-2 seconds.';
      } else if (rawErr.includes('403') || rawErr.includes('verification')) {
        displayError = 'Sunbird AI API requires email verification. Please check your developer account.';
      }
      setErrorMessage(displayError || 'Sunbird AI transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
      setRecordingSeconds(0);
    }
  };

  const currentLangObj = SUNBIRD_LANGUAGES.find((l) => l.code === selectedLanguage) || SUNBIRD_LANGUAGES[0];

  // --------------------------------------------------------------------------
  // COMPACT INLINE MODE
  // --------------------------------------------------------------------------
  if (compact) {
    return (
      <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
        {/* Language selector toggle */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled || isRecording || isTranscribing}
            onClick={() => setShowLanguagePicker(!showLanguagePicker)}
            className="h-8 px-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1 hover:bg-purple-100 transition cursor-pointer"
            title="Change Speech-to-Text Language"
          >
            <Globe className="w-3 h-3 text-purple-600" />
            <span>{currentLangObj.code.toUpperCase()}</span>
          </button>

          {showLanguagePicker && (
            <div className="absolute top-full left-0 mt-1 z-30 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-1.5 shadow-xl animate-fade-in space-y-0.5">
              <span className="text-[10px] font-black uppercase text-slate-400 px-2 py-1 block">Voice Language</span>
              {SUNBIRD_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setShowLanguagePicker(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    selectedLanguage === lang.code
                      ? 'bg-purple text-white font-black'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <span>{lang.native} ({lang.label})</span>
                  {selectedLanguage === lang.code && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dictation Action Button */}
        {isRecording ? (
          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl px-2.5 py-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span className="text-xs font-black text-rose-700 dark:text-rose-300 font-mono">
              {formatTimer(recordingSeconds)}
            </span>
            <button
              type="button"
              onClick={stopRecording}
              className="ml-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              title="Stop and transcribe"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Done</span>
            </button>
            <button
              type="button"
              onClick={cancelRecording}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Cancel recording"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : isTranscribing ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-purple text-xs font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Transcribing...</span>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={startRecording}
            className="h-8 px-2.5 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            title={`Dictate with Sunbird AI (${currentLangObj.native})`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{buttonLabel || 'Dictate'}</span>
          </button>
        )}

        {errorMessage && (
          <div className="absolute top-full right-0 mt-1 z-30 max-w-xs bg-rose-50 border border-rose-200 text-rose-800 p-2 rounded-xl text-[11px] shadow-lg flex items-start gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="ml-auto text-rose-500 hover:text-rose-800">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // FULL / EXPANDED BANNER MODE
  // --------------------------------------------------------------------------
  return (
    <div className={`p-3.5 rounded-2xl bg-gradient-to-r from-purple/10 via-[#DFD2F0]/30 to-purple/5 border border-purple/20 space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-purple text-white flex items-center justify-center shadow-xs">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Sunbird AI Voice Dictation</span>
              <span className="text-[10px] font-bold px-2 py-0.2 bg-purple/15 text-purple rounded-full">
                East Africa STT
              </span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              {placeholderContext || 'Speak in your native language to auto-populate text.'}
            </p>
          </div>
        </div>

        {/* Language Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-purple/15 self-start sm:self-auto">
          {SUNBIRD_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              disabled={isRecording || isTranscribing}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                selectedLanguage === lang.code
                  ? 'bg-purple text-white shadow-2xs font-black'
                  : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {lang.native}
            </button>
          ))}
        </div>
      </div>

      {/* Recording & Dictation Controls */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-purple/10">
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl p-2.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <span className="text-xs font-black text-rose-800 dark:text-rose-300">
                Listening ({currentLangObj.native})...
              </span>
              <span className="text-xs font-black text-rose-900 dark:text-rose-200 font-mono bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded-lg">
                {formatTimer(recordingSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop & Transcribe</span>
              </button>
            </div>
          </div>
        ) : isTranscribing ? (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-zinc-800 border border-purple/20 rounded-xl text-xs font-black text-purple">
            <Loader2 className="w-4 h-4 animate-spin text-purple" />
            <span>Transcribing with Sunbird AI ({currentLangObj.label})...</span>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-purple" />
              <span>Press to dictate in <strong>{currentLangObj.native}</strong></span>
            </span>

            <button
              type="button"
              disabled={disabled}
              onClick={startRecording}
              className="px-4 py-2 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Mic className="w-4 h-4" />
              <span>{buttonLabel || `Start Voice Dictation (${currentLangObj.native})`}</span>
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
