'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Leaf,
  LayoutDashboard,
  ScanLine,
  ShoppingBag,
  Scale,
  LineChart,
  Recycle,
  GraduationCap,
  ChevronDown,
  ListTodo,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavLink[];
}

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan', label: 'Scan AI', icon: ScanLine },
];

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Produk',
    icon: ShoppingBag,
    items: [
      { href: '/products', label: 'Eco Finder', icon: ShoppingBag },
      { href: '/shopping-list', label: 'Daftar Belanja', icon: ListTodo },
    ],
  },
  {
    label: 'Konsumsi',
    icon: LineChart,
    items: [
      { href: '/konsumsi', label: 'Ringkasan Konsumsi', icon: LineChart },
      { href: '/sampah', label: 'Catat Sampah', icon: Recycle },
    ],
  },
  {
    label: 'Wawasan',
    icon: GraduationCap,
    items: [
      { href: '/impact', label: 'Dampak & Poin', icon: TrendingUp },
      { href: '/edukasi', label: 'Edukasi', icon: GraduationCap },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, compareList } = useApp();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenu]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
          <img
            src="/logo.png"
            alt="econsume"
            className="h-10 w-auto group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Econsume
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium">
              Smart &amp; Sustainable Living
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav ref={navRef} className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {NAV_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openMenu === group.label;
            const isActive = group.items.some((item) => pathname === item.href);
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(group.label)}
                onMouseLeave={() => setOpenMenu((current) => (current === group.label ? null : current))}
              >
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  onClick={() => setOpenMenu((current) => (current === group.label ? null : group.label))}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isActive || isOpen
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                  }`}
                >
                  <GroupIcon className={`w-4 h-4 ${isActive || isOpen ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{group.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full pt-2 w-56">
                    <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 shadow-xl shadow-emerald-500/5">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const itemActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={itemActive ? 'page' : undefined}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                              itemActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                            }`}
                          >
                            <ItemIcon className={`w-4 h-4 ${itemActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Compare Indicator */}
          {compareList.length > 0 && (
            <Link
              href="/products"
              className="relative hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
            >
              <Scale className="w-4 h-4" />
              <span>Bandingkan ({compareList.length})</span>
            </Link>
          )}

          {/* Green Points Pill */}
          <Link
            href="/impact"
            title="Poin Hijau"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 transition-colors shadow-sm"
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>{user.greenPoints}</span>
            <span className="hidden sm:inline text-emerald-600 dark:text-emerald-300">Poin</span>
          </Link>

          <ThemeToggle />

          {/* Profile link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow">
              {user.name.charAt(0)}
            </div>
            <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate">{user.name}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
