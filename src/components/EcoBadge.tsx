import React from 'react';

interface EcoBadgeProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  score?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const gradeColors: Record<'A' | 'B' | 'C' | 'D' | 'E', { bg: string; text: string; border: string; label: string }> = {
  A: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600', label: 'Sangat Ramah Lingkungan' },
  B: { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-600', label: 'Ramah Lingkungan' },
  C: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600', label: 'Cukup Ramah' },
  D: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600', label: 'Kurang Ramah' },
  E: { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-600', label: 'Tinggi Jejak Karbon' },
};

export default function EcoBadge({ grade, score, size = 'md', showLabel = false }: EcoBadgeProps) {
  const conf = gradeColors[grade] || gradeColors.C;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs font-bold rounded-md',
    md: 'w-8 h-8 text-sm font-black rounded-lg',
    lg: 'w-12 h-12 text-xl font-black rounded-xl shadow-md',
    xl: 'w-16 h-16 text-3xl font-black rounded-2xl shadow-lg',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`flex items-center justify-center font-sans tracking-tight transition-transform hover:scale-105 ${conf.bg} ${conf.text} ${sizeClasses[size]}`}
        title={`Eco-Score: ${grade} (${score ?? ''})`}
      >
        {grade}
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Eco-Score: {grade} {score !== undefined && `(${score}/100)`}
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{conf.label}</span>
        </div>
      )}
    </div>
  );
}
