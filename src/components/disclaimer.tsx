'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

export function Disclaimer() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const disclaimerState = localStorage.getItem('azmaDisclaimerState');
      if (disclaimerState === 'closed') {
        setIsOpen(false);
      }
    } catch (error) {
        // If localStorage is not available, default to open.
        setIsOpen(true);
    }
  }, []);

  const toggleDisclaimer = (openState: boolean) => {
    setIsOpen(openState);
    if(isMounted) {
        try {
            localStorage.setItem('azmaDisclaimerState', openState ? 'open' : 'closed');
        } catch (error) {
            // Silently fail if localStorage is not available.
        }
    }
  };

  if (!isMounted) {
    return null;
  }

  if (!isOpen) {
    return (
        <div className="flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => toggleDisclaimer(true)}>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
            </Button>
        </div>
    )
  }

  return (
    <div className="p-4 text-xs text-muted-foreground bg-background/50 rounded-lg border border-dashed relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6"
        onClick={() => toggleDisclaimer(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <h4 className="font-bold mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        Important Notices
      </h4>
      <div className="space-y-2">
        <div>
            <p className="font-semibold">AI Generation Notice</p>
            <p>
            This content was generated with assistance from AI. Please review for
            accuracy and originality.
            </p>
        </div>
        <div>
            <p className="font-semibold">Plagiarism Disclaimer</p>
            <p>
            Always cite your sources. Using AI-generated text without proper
            attribution may be considered plagiarism.
            </p>
        </div>
      </div>
    </div>
  );
}
