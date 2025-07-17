
"use client";

import { useState, useEffect } from 'react';

export default function CurrentDateDisplay() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  if (!currentDate) {
    // You can return a placeholder or null while waiting for the date
    return <>Loading date...</>; 
  }

  return <>{currentDate}</>;
}
