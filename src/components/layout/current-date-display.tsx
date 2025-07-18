
"use client";

import { useState, useEffect } from 'react';

export default function CurrentDateDisplay() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // This code will only run on the client, after the component has mounted.
    // This avoids a hydration mismatch between server and client rendering.
    setCurrentDate(new Date().toLocaleDateString());
  }, []); // Empty dependency array means this runs once on mount

  if (!currentDate) {
    // Return a placeholder or null to ensure server and initial client render match.
    return null; 
  }

  return <>{currentDate}</>;
}
