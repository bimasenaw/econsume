'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ScanLine, ListTodo, ShoppingBag, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const mobileNav = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/products', label: 'Produk', icon: ShoppingBag },
    { href: '/scan', label: 'Scan', icon: ScanLine, isPrimary: true },
    { href: '/shopping-list', label: 'Belanja', icon: ListTodo },
    { href: '/profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-amber-50 dark:border-gray-900 group-active:scale-95 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
