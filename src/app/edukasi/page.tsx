'use client';

import React from 'react';
import { ECOLABELS, GREENWASHING_FLAGS } from '@/data/reference';
import SourcePanel from '@/components/SourcePanel';
import { ShieldCheck, ShieldAlert, ExternalLink, Search, BadgeCheck } from 'lucide-react';

const RISK_STYLE: Record<string, string> = {
  rendah: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  sedang: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  tinggi: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
};

export default function EdukasiPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-3xl text-white shadow-lg">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Literasi Konsumen</span>
        <h1 className="text-3xl sm:text-4xl font-black leading-tight mt-1">Kenali Label, Hindari Greenwashing</h1>
        <p className="text-emerald-100 text-sm mt-2 max-w-xl">
          Klaim &ldquo;ramah lingkungan&rdquo; tanpa bukti mudah ditemui. Pelajari arti sertifikasi resmi
          dan cara memverifikasinya sebelum percaya.
        </p>
      </div>

      {/* How to verify */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-600" /> Tiga Langkah Verifikasi
        </h2>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', t: 'Cek jenis label', d: 'Apakah sertifikasi resmi (ada lembaga & nomor) atau sekadar ikon/klaim merek sendiri?' },
            { n: '2', t: 'Cari nomor sertifikat', d: 'Buka registry resmi lembaga (tautan di bawah) dan cocokkan nomor/status produk.' },
            { n: '3', t: 'Bandingkan klaim', d: 'Klaim yang baik menyebut kriteria spesifik & angka, bukan hanya kata "eco"/"green".' },
          ].map((s) => (
            <li key={s.n} className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-black flex items-center justify-center mb-2">
                {s.n}
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">{s.t}</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Ecolabels */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-emerald-600" /> Kamus Sertifikasi Hijau
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ECOLABELS.map((e) => (
            <div key={e.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{e.name}</h3>
                  <span className="text-[11px] text-slate-500">{e.scope}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${RISK_STYLE[e.greenwashingRisk]}`}>
                  risiko {e.greenwashingRisk}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{e.means}</p>
              <a
                href={e.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                Verifikasi resmi <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
        <SourcePanel
          title="Catatan"
          items={[
            { label: 'Definisi', source: 'Ringkasan peran tiap lembaga dari situs resminya masing-masing' },
            { label: 'Risiko greenwashing', source: 'Penilaian indikatif seberapa mudah klaim disalahartikan tanpa verifikasi' },
          ]}
        />
      </div>

      {/* Red flags */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" /> Checklist Red Flags
        </h2>
        <ul className="space-y-2">
          {GREENWASHING_FLAGS.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Ingat: klaim hijau terbaik adalah yang <b>spesifik, terukur, dan bisa diverifikasi</b> di
            registry resmi — bukan sekadar warna hijau pada kemasan.
          </p>
        </div>
      </div>
    </div>
  );
}
