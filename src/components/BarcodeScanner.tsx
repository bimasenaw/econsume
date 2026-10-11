'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Loader2,
  RefreshCw,
  SwitchCamera,
  Upload,
  AlertCircle,
  ScanBarcode,
  Keyboard,
} from 'lucide-react';

type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'error';

interface ScannerHandle {
  stop: () => Promise<void>;
  clear: () => void;
}

interface BarcodeScannerProps {
  /** Called once with the first successfully decoded barcode. */
  onDetected: (barcode: string) => void;
  /** Pause scanning while a result is being processed. */
  paused?: boolean;
}

export default function BarcodeScanner({ onDetected, paused = false }: BarcodeScannerProps) {
  const elementId = useId().replace(/:/g, '');
  const scannerRef = useRef<ScannerHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detectedRef = useRef(false);

  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  // When false, the scanner stays idle after a hit until the user restarts it.
  const [armed, setArmed] = useState(true);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      // already stopped / never started
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;
    setStatus('starting');
    setError(null);
    detectedRef.current = false;

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

      // Ask permission once & list cameras (also triggers the browser prompt).
      let cameras: Awaited<ReturnType<typeof Html5Qrcode.getCameras>> = [];
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch {
        // permission may still be granted on start()
      }
      setHasMultipleCameras(cameras.length > 1);

      // Prefer a rear/environment camera when available.
      const back = cameras.find((c) => /back|rear|environment/i.test(c.label));
      const cameraConfig = back
        ? { deviceId: { exact: back.id } }
        : { facingMode: { ideal: 'environment' } };

      const formats = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
      ];

      const scanner = new Html5Qrcode(elementId, { verbose: false, formatsToSupport: formats });
      scannerRef.current = scanner as unknown as ScannerHandle;

      await scanner.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: (viewW, viewH) => {
            const width = Math.min(viewW, Math.floor(viewW * 0.82));
            const height = Math.min(viewH, Math.max(120, Math.floor(viewH * 0.4)));
            return { width, height };
          },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          if (detectedRef.current) return;
          detectedRef.current = true;
          setArmed(false);
          void stopScanner().then(() => setStatus('idle'));
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(30);
            } catch {
              /* no-op */
            }
          }
          onDetected(decodedText);
        },
        () => {
          /* per-frame decode misses are expected; ignore */
        }
      );

      setStatus('scanning');
    } catch (e) {
      await stopScanner();
      setStatus('error');
      const name = (e as { name?: string })?.name || '';
      const message = e instanceof Error ? e.message : String(e);
      if (name === 'NotAllowedError' || /permission|denied/i.test(message)) {
        setError('Akses kamera ditolak. Izinkan kamera di pengaturan browser, atau unggah foto barcode.');
      } else if (name === 'NotFoundError' || /no camera|not found/i.test(message)) {
        setError('Kamera tidak ditemukan. Gunakan unggah foto barcode atau masukkan kode manual.');
      } else {
        setError('Gagal menyalakan kamera. Coba lagi, unggah foto barcode, atau masukkan kode manual.');
      }
    }
  }, [elementId, onDetected, stopScanner]);

  // Auto start when mounted, armed & idle; stop when paused or unmounted.
  useEffect(() => {
    if (armed && !paused && status === 'idle') {
      void startScanner();
    }
    if (paused && scannerRef.current) {
      void stopScanner().then(() => setStatus('idle'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, armed]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const handleScanFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setStatus('starting');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      await stopScanner();
      const temp = new Html5Qrcode(elementId, { verbose: false });
      const text = await temp.scanFile(file, true);
      temp.clear();
      setStatus('idle');
      if (text) onDetected(text);
    } catch {
      setStatus('error');
      setError('Barcode tidak terbaca dari foto. Pastikan gambar jelas & tidak terpotong.');
    }
  };

  const switchCamera = async () => {
    await stopScanner();
    setStatus('idle');
    setTimeout(() => void startScanner(), 120);
  };

  const showVideo = status === 'scanning' || status === 'starting';

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 border border-slate-800">
        {/* Camera viewport */}
        <div
          id={elementId}
          className={`w-full ${showVideo ? 'min-h-[240px]' : 'h-0'} [&_video]:!w-full [&_video]:!rounded-[20px] [&_video]:object-cover`}
        />

        {/* Scan overlay */}
        {status === 'scanning' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative w-[80%] max-w-[320px] aspect-[2/1]">
              <span className="absolute -top-0.5 -left-0.5 h-7 w-7 rounded-tl-2xl border-t-4 border-l-4 border-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 h-7 w-7 rounded-tr-2xl border-t-4 border-r-4 border-emerald-400" />
              <span className="absolute -bottom-0.5 -left-0.5 h-7 w-7 rounded-bl-2xl border-b-4 border-l-4 border-emerald-400" />
              <span className="absolute -bottom-0.5 -right-0.5 h-7 w-7 rounded-br-2xl border-b-4 border-r-4 border-emerald-400" />
              <span className="absolute left-0 right-0 top-1/2 h-0.5 bg-emerald-400/90 shadow-[0_0_12px_2px_rgba(52,211,153,0.8)] animate-scanline" />
            </div>
          </div>
        )}

        {/* Idle / starting / error placeholder */}
        {!showVideo && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center text-slate-300">
            {status === 'error' ? (
              <AlertCircle className="w-10 h-10 text-rose-400" />
            ) : (
              <ScanBarcode className="w-10 h-10 text-emerald-400" />
            )}
            <p className="text-sm font-semibold">
              {status === 'error' ? 'Kamera tidak aktif' : 'Kamera barcode siap'}
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Arahkan kamera ke barcode kemasan (EAN/UPC/Code-128).
            </p>
          </div>
        )}

        {status === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 text-slate-200">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
            <span className="text-xs font-semibold">Menyalakan kamera…</span>
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl px-3 py-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </p>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {status === 'scanning' ? (
          <button
            type="button"
            onClick={() => void stopScanner().then(() => setStatus('idle'))}
            className="flex-1 min-w-[140px] cursor-pointer px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <CameraOff className="w-4 h-4" /> Hentikan Kamera
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startScanner()}
            disabled={status === 'starting'}
            className="flex-1 min-w-[140px] cursor-pointer px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-colors"
          >
            {status === 'starting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {status === 'error' ? 'Coba Nyalakan Lagi' : 'Nyalakan Kamera'}
          </button>
        )}

        {status === 'scanning' && hasMultipleCameras && (
          <button
            type="button"
            onClick={() => void switchCamera()}
            className="cursor-pointer px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            title="Ganti kamera"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer px-4 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          title="Opsi 2: unggah foto barcode dari galeri"
        >
          <Upload className="w-4 h-4" /> Unggah Foto
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            void handleScanFile(file);
          }}
        />
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <Keyboard className="w-3.5 h-3.5" />
        Tanpa kamera? Masukkan kode barcode secara manual di bawah.
      </p>
      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <RefreshCw className="w-3.5 h-3.5" />
        Pemindaian berjalan otomatis — tanpa perlu menekan tombol.
      </p>
    </div>
  );
}
