
"use client";

import { useState, useEffect } from 'react';

export default function CurrentDateDisplay() {
  const [currentDate, setCurrentDate] = useState<string | null>(null);

  useEffect(() => {
    // This code will only run on the client, after the component has mounted.
    // This avoids a hydration mismatch between server and client rendering.
    setCurrentDate(new Date().toLocaleDateString());
  }, []); // Empty dependency array means this runs once on mount

  // Render a placeholder or null on the server and initial client render.
  if (!currentDate) {
    return null; 
  }

  return <>{currentDate}</>;
}
