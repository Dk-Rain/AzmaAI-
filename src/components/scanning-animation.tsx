
'use client';

import { useEffect, useState, useRef } from 'react';

export function ScanningAnimation() {
  const [position, setPosition] = useState(-10);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use scrollHeight to get the full height of the content, not just the visible part.
    const fullHeight = container.scrollHeight;
    const startPosition = -10;
    const endPosition = fullHeight + 10;
    const speed = 8; // Adjust speed as needed

    const animate = () => {
      setPosition(prevPosition => {
        let newPosition = prevPosition;
        if (direction === 'down') {
          newPosition += speed;
          if (newPosition >= endPosition) {
            setDirection('up');
            return endPosition;
          }
        } else { // direction === 'up'
          newPosition -= speed;
          if (newPosition <= startPosition) {
            setDirection('down');
            return startPosition;
          }
        }
        return newPosition;
      });
    };

    const interval = setInterval(animate, 15);

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-lg">
      <div
        className="absolute w-full h-1 bg-green-400/50 shadow-[0_0_20px_5px_rgba(0,255,150,0.7)]"
        style={{
          transform: `translateY(${position}px)`,
          transition: 'transform 0.015s linear',
        }}
      />
    </div>
  );
}
