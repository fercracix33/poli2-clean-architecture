/**
 * GlobalHeader Component
 *
 * Persistent header visible across all pages (public and authenticated).
 * Contains logo and theme toggle for consistent UX.
 *
 * Responsibilities:
 * - Brand logo linking to home
 * - Theme toggle accessible from any page
 * - Sticky navbar with backdrop blur
 * - Responsive design with dark mode support
 *
 * Created by: UI/UX Expert Agent
 * Date: 2025-10-09
 * Feature: Dark/Light Mode Toggle - Global Visibility Fix
 */

'use client'

import { ThemeToggle } from '@/features/theme/components/ThemeToggle'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

export function GlobalHeader() {
  return (
    <nav className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-black/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            aria-label="Go to homepage"
          >
            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                PoliOrganizaT
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                for software teams
              </span>
            </div>
          </Link>

          {/* Right side: Theme Toggle */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
