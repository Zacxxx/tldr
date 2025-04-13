'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import History from '@/components/History';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8">
            <div className="container flex h-14 items-center justify-between">
              <div className="flex items-center space-x-4">
                <a href="/" className="flex items-center space-x-2">
                  <div className="h-8 w-24 rounded bg-white flex items-center justify-center">
                    <span className="text-accent font-bold text-lg">TL;DR</span>
                  </div>
                </a>
                <a href="/login" className="text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md transition-colors">
                  Login
                </a>
                <a 
                  href="https://ko-fi.com" 
                  className="text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Support via Ko-Fi
                </a>
              </div>
            </div>
          </header>
          
          <div className="flex-1 flex">
            <aside className={`${isSidebarCollapsed ? 'w-12' : 'w-[300px]'} flex-shrink-0 border-r hidden lg:block transition-all duration-300 relative`}>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute -right-3 top-6 p-1.5 rounded-full bg-background border shadow-sm hover:bg-accent/5 transition-colors"
              >
                {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              <div className={`h-full py-6 ${isSidebarCollapsed ? 'px-3' : 'pl-8 pr-6'} overflow-hidden`}>
                {!isSidebarCollapsed && <History />}
              </div>
            </aside>
            <main className="flex-1">
              <div className="h-full px-8 py-6">
                {children}
              </div>
            </main>
          </div>

          <footer className="border-t py-6 bg-background">
            <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm text-muted-foreground">
                <a href="/about" className="hover:text-foreground transition-colors">About</a>
                <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
                <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</a>
                <a href="/gdpr" className="hover:text-foreground transition-colors">GDPR</a>
              </div>
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} TL;DR. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
