'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** /detect kini digabung ke /scan (tab SIH). Redirect agar bookmark lama tetap jalan. */
export default function DetectRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/scan');
  }, [router]);
  return (
    <div className="text-center py-16 text-sm text-gray-500">
      Mengalihkan ke Scan AI Terpadu (tab Deteksi SIH)…
    </div>
  );
}
