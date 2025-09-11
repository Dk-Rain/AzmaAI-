
'use client';

import { useEffect, useState } from 'react';

export function ScanningAnimation() {
  const [position, setPosition] = useState(-10); // Start off-screen

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        if (prev > 110) {
          return -10; // Reset
        }
        return prev + 1; // Speed of the scan
      });
    }, 15); // Update interval

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <div
        className="absolute w-full h-1 bg-green-400/50 shadow-[0_0_20px_5px_rgba(0,255,150,0.7)]"
        style={{
          top: `${position}%`,
          transition: 'top 0.1s linear',
        }}
      />
    </div>
  );
}
