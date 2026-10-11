'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Leaf,
  LayoutDashboard,
  ScanLine,
  ShoppingBag,
  ListTodo,
  Award,
  User,
  Scale,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, compareList } = useApp();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/scan', label: 'Scan AI', icon: ScanLine },
    { href: '/products', label: 'Eco Finder', icon: ShoppingBag },
    { href: '/shopping-list', label: 'Belanja Pintar', icon: ListTodo },
    { href: '/impact', label: 'Dampak & Skor', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100 dark:border-gray-800 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
              EcoConsume <span className="text-emerald-500 font-extrabold">AI</span>
            </span>
            <span className="block text-[10px] text-gray-500 dark:text-gray-400 -mt-1 font-medium">
              Smart & Sustainable Living
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-gray-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Compare Indicator */}
          {compareList.length > 0 && (
            <Link
              href="/products#compare-drawer"
              className="relative hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800"
            >
              <Scale className="w-4 h-4" />
              <span>Bandingkan ({compareList.length})</span>
            </Link>
          )}

          {/* Green Points Pill */}
          <Link
            href="/impact"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 transition-colors shadow-sm"
          >
            <span>🌱</span>
            <span>{user.greenPoints}</span>
            <span className="hidden sm:inline text-emerald-600 dark:text-emerald-300">Poin</span>
          </Link>

          {/* Profile link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow">
              {user.name.charAt(0)}
            </div>
            <span className="hidden lg:inline text-xs font-semibold max-w-[100px] truncate">
              {user.name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
