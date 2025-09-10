'use client';

import { AlertTriangle } from 'lucide-react';

export function Disclaimer() {
  return (
    <div className="p-4 text-xs text-muted-foreground bg-background/50 rounded-lg border border-dashed">
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
