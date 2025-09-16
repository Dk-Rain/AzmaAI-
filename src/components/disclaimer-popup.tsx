
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

export function DisclaimerPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the disclaimer has been shown in the current session
    const hasBeenShown = sessionStorage.getItem('azma_disclaimer_shown');
    if (!hasBeenShown) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    // Mark as shown for the current session and close the dialog
    sessionStorage.setItem('azma_disclaimer_shown', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent onEscapeKeyDown={handleClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Important Notices
          </DialogTitle>
          <DialogDescription>
            Please read the following information before you begin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground py-4">
          <div>
            <h4 className="font-semibold text-foreground mb-1">AI Generation Notice</h4>
            <p>
              This tool uses AI to generate content. Always review all text for
              accuracy, originality, and appropriateness for your specific needs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Plagiarism & Academic Integrity</h4>
            <p>
              You are responsible for citing your sources correctly. Using AI-generated 
              text without proper attribution may be considered plagiarism by your institution. 
              Use this tool as a writing assistant, not a replacement for your own work.
            </p>
          </div>
        </div>
        <Button onClick={handleClose} className="w-full">
          I Understand
        </Button>
      </DialogContent>
    </Dialog>
  );
}
