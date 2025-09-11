
'use client';

import { useEffect, useState, useRef } from 'react';

export function ScanningAnimation() {
  const [position1, setPosition1] = useState(-10);
  const [direction1, setDirection1] = useState<'down' | 'up'>('down');
  const [position2, setPosition2] = useState(0); // Initial position doesn't matter, will be set in effect
  const [direction2, setDirection2] = useState<'up' | 'down'>('up');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fullHeight = container.scrollHeight;
    const startPosition = -10;
    const endPosition = fullHeight + 10;
    const middlePosition = fullHeight / 2;
    const speed = 8;

    // Set initial position for bottom laser
    setPosition2(endPosition);

    const animate = () => {
      // Animate top laser (full scan)
      setPosition1(prevPosition => {
        let newPosition = prevPosition;
        if (direction1 === 'down') {
          newPosition += speed;
          if (newPosition >= endPosition) {
            setDirection1('up');
            return endPosition;
          }
        } else { // direction1 === 'up'
          newPosition -= speed;
          if (newPosition <= startPosition) {
            setDirection1('down');
            return startPosition;
          }
        }
        return newPosition;
      });

      // Animate bottom laser (bottom to middle)
      setPosition2(prevPosition => {
          let newPosition = prevPosition;
          if(direction2 === 'up') {
              newPosition -= speed;
              if (newPosition <= middlePosition) {
                  setDirection2('down');
                  return middlePosition;
              }
          } else { // direction2 === 'down'
              newPosition += speed;
              if (newPosition >= endPosition) {
                  setDirection2('up');
                  return endPosition;
              }
          }
          return newPosition;
      });
    };

    const interval = setInterval(animate, 15);

    return () => clearInterval(interval);
  }, [direction1, direction2]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-lg">
      {/* Top Laser */}
      <div
        className="absolute w-full h-1 bg-green-400/50 shadow-[0_0_20px_5px_rgba(0,255,150,0.7)]"
        style={{
          transform: `translateY(${position1}px)`,
          transition: 'transform 0.015s linear',
        }}
      />
      {/* Bottom Laser */}
       <div
        className="absolute w-full h-1 bg-sky-400/50 shadow-[0_0_20px_5px_rgba(0,150,255,0.7)]"
        style={{
          transform: `translateY(${position2}px)`,
          transition: 'transform 0.015s linear',
        }}
      />
    </div>
  );
}
