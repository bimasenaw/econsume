'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Di mode development service worker dapat menyajikan bundle lama (hydration error),
    // jadi dinonaktifkan: bersihkan registrasi lama agar halaman kembali segar.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
        .catch(() => {
          /* abaikan */
        });
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline mode tidak tersedia — abaikan */
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
