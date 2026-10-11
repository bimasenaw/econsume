'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ImageIcon, Loader2, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  value: string | null;
  onChange: (dataUrl: string) => void;
  label?: string;
  hint?: string;
  maxDim?: number;
  quality?: number;
}

function fileToDataUrl(file: File, maxDim = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar valid.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function CameraCapture({
  value,
  onChange,
  label,
  hint,
  maxDim = 1280,
  quality = 0.85,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    setError(null);
    setStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Kamera tidak didukung.');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
    } catch (e) {
      const name = (e as { name?: string })?.name || '';
      const msg = e instanceof Error ? e.message : String(e);
      if (name === 'NotAllowedError' || /permission|denied/i.test(msg)) {
        setError('Akses kamera ditolak. Izinkan kamera di browser, atau unggah foto dari galeri.');
      } else if (name === 'NotFoundError' || /no camera|not found/i.test(msg)) {
        setError('Kamera tidak ditemukan. Gunakan unggah foto dari galeri.');
      } else {
        setError('Gagal menyalakan kamera. Gunakan unggah foto dari galeri.');
      }
    } finally {
      setStarting(false);
    }
  }, []);

  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {
        /* autoplay ditolak — user bisa tap untuk mulai */
      });
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onChange(canvas.toDataURL('image/jpeg', quality));
    stop();
  }, [maxDim, quality, onChange, stop]);

  const handleFile = useCallback(
    async (f: File | undefined) => {
      if (!f) return;
      setError(null);
      if (!f.type.startsWith('image/')) {
        setError('File harus berupa gambar.');
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError('Foto maksimal 10 MB.');
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(f, maxDim, quality);
        onChange(dataUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Gagal memproses foto.');
      }
    },
    [maxDim, quality, onChange]
  );

  return (
    <div>
      {label && <label className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</label>}

      <div className="mt-2 overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200 dark:border-slate-700">
        {/* Live camera viewport */}
        {active && (
          <div className="relative bg-slate-900">
            <video
              ref={attachVideo}
              autoPlay
              playsInline
              muted
              className="w-full h-56 object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative w-[78%] max-w-[300px] aspect-[3/4]">
                <span className="absolute -top-0.5 -left-0.5 h-7 w-7 rounded-tl-2xl border-t-4 border-l-4 border-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 h-7 w-7 rounded-tr-2xl border-t-4 border-r-4 border-emerald-400" />
                <span className="absolute -bottom-0.5 -left-0.5 h-7 w-7 rounded-bl-2xl border-b-4 border-l-4 border-emerald-400" />
                <span className="absolute -bottom-0.5 -right-0.5 h-7 w-7 rounded-br-2xl border-b-4 border-r-4 border-emerald-400" />
              </div>
            </div>
          </div>
        )}

        {/* Preview / placeholder */}
        {!active && (
          <div className="flex items-center gap-3 p-3">
            {value ? (
              <img
                src={value}
                alt="Pratinjau kemasan"
                className="w-20 h-20 rounded-xl object-cover bg-slate-100 shrink-0"
              />
            ) : (
              <span className="w-20 h-20 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                {starting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
              </span>
            )}

            <div className="min-w-0 flex-1">
              {active ? null : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void start()}
                      disabled={starting}
                      className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                    >
                      {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      {value ? 'Ambil Ulang via Kamera' : 'Buka Kamera'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" /> Unggah Foto
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                    {hint || (value ? 'Foto siap — bisa diganti kapan saja.' : 'Kamera utama · unggah foto sebagai opsi kedua.')}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Camera action bar */}
        {active && (
          <div className="flex flex-wrap items-center gap-2 p-3 border-t border-slate-800 bg-slate-900">
            <button
              type="button"
              onClick={capture}
              className="flex-1 min-w-[140px] cursor-pointer px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" /> Ambil Foto
            </button>
            <button
              type="button"
              onClick={stop}
              className="cursor-pointer px-4 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <CameraOff className="w-4 h-4" /> Batal
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          void handleFile(f);
        }}
      />
    </div>
  );
}
