'use client';

import React, { useState } from 'react';
import { Info, ExternalLink, ChevronDown } from 'lucide-react';

interface SourceItem {
  label: string;
  source: string;
  url?: string;
}

export default function SourcePanel({ items, title = 'Sumber & cara hitung' }: { items: SourceItem[]; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer"
      >
        <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
        <span className="text-xs font-black text-sky-800 dark:text-sky-200">{title}</span>
        <ChevronDown className={`w-4 h-4 ml-auto text-sky-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-2">
          {items.map((it) => (
            <li key={it.label} className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-200">{it.label}:</span> {it.source}
              {it.url && (
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 ml-1 text-sky-700 dark:text-sky-300 font-semibold hover:underline"
                >
                  tautan <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
