
'use client';

import { useEffect, useState, useRef } from 'react';

export function ScanningAnimation() {
  const [position, setPosition] = useState(-10);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.offsetHeight;
    let start = -10;
    let end = containerHeight + 10;
    
    const animate = () => {
      setPosition(prev => {
        const newPos = prev + 5; // Speed of the scan
        if (newPos > end) {
          return start; // Reset
        }
        return newPos;
      });
    };

    const interval = setInterval(animate, 15);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-lg">
      <div
        className="absolute w-full h-1 bg-green-400/50 shadow-[0_0_20px_5px_rgba(0,255,150,0.7)]"
        style={{
          transform: `translateY(${position}px)`,
        }}
      />
    </div>
  );
}
