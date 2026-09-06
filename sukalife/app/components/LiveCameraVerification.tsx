'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  CheckCircle2,
  X,
  FlipHorizontal,
  AlertCircle,
  Upload,
  Eye,
  ScanLine
} from 'lucide-react';

interface LiveCameraVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (imageDataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export default function LiveCameraVerification({
  isOpen,
  onClose,
  onCaptureComplete,
  title = 'Live Test Strip & Meter Verification',
  subtitle = 'Align your glucometer display or test strip within the guideline box'
}: LiveCameraVerificationProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize live camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop any active stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or environment.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser or upload a photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can upload an image file instead.');
      } else {
        setCameraError('Unable to start live camera stream. You can upload a photo from your gallery or file system.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stream]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the current video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add optional timestamp watermark for clinical audit
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, canvas.height - 35, 320, 25);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Sukaalife Verified • ${new Date().toLocaleString()}`, 16, canvas.height - 18);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);

    // Stop live stream to conserve battery
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCaptureComplete(capturedPhoto);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedPhoto(reader.result);
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
          setStream(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{title}</h3>
              <p className="text-[11px] text-zinc-400">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Viewfinder / Capture Area */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            // Captured Snapshot Preview
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedPhoto}
                alt="Captured Strip"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                <CheckCircle2 className="h-3.5 w-3.5" /> Snapshot Ready for Verification
              </div>
            </div>
          ) : cameraError ? (
            // Fallback / Error View
            <div className="p-6 text-center text-zinc-400 flex flex-col items-center max-w-xs">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
              <p className="text-xs font-medium text-zinc-300 mb-4">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-purple-700"
              >
                <Upload className="h-4 w-4" /> Select Image from Gallery
              </button>
            </div>
          ) : (
            // Live Video Stream with HUD Guide Box
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle / Focus Target */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-full max-w-[280px] h-[180px] border-2 border-dashed border-purple-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  {/* Target Corners */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-purple-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-purple-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-purple-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-purple-400" />
                  
                  {/* Scanning Animation Line */}
                  <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[10px] text-white/90 bg-purple-900/60 px-2 py-0.5 rounded-full backdrop-blur-xs font-medium">
                    <ScanLine className="h-3 w-3 mr-1 text-purple-300 animate-pulse" />
                    Align Strip / Screen Here
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for drawing snapshot */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 sm:p-5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={retakePhoto}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Retake Photo
              </button>
              <button
                type="button"
                onClick={confirmPhoto}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" /> Confirm & Attach
              </button>
            </>
          ) : (
            <>
              {/* File upload alternative */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors shrink-0"
                title="Upload from gallery"
              >
                <Upload className="h-5 w-5" />
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                disabled={isInitializing || !!cameraError}
                onClick={takeSnapshot}
                className="h-14 w-14 rounded-full bg-white hover:bg-zinc-200 active:scale-95 text-zinc-900 flex items-center justify-center shadow-xl ring-4 ring-purple-500/40 transition-all disabled:opacity-40 disabled:scale-100 shrink-0"
                title="Capture Strip Photo"
              >
                <div className="h-10 w-10 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                  <Camera className="h-5 w-5 fill-zinc-900" />
                </div>
              </button>

              {/* Flip camera */}
              <button
                type="button"
                onClick={switchCamera}
                disabled={isInitializing || !!cameraError}
                className="h-11 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors shrink-0 disabled:opacity-40"
                title="Switch Camera"
              >
                <FlipHorizontal className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
