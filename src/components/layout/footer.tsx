"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // This code will only run on the client, after the component has mounted.
    // This avoids a hydration mismatch between server and client rendering.
    setYear(new Date().getFullYear());
  }, []); // Empty dependency array means this runs once on mount

  return (
    <footer className="border-t border-border/40 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <div className="flex justify-center space-x-4 mb-4">
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </div>
        {year ? (
          <p>&copy; {year} Siren. All rights reserved.</p>
        ) : (
          <p className="h-5">&nbsp;</p> 
        )}
        <p className="mt-1">Stories that feel alive.</p>
      </div>
    </footer>
  );
}
