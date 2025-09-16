
'use client';

import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface TemplateEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function TemplateEditor({ value, onChange }: TemplateEditorProps) {
    const placeholder = `- Introduction
- Literature Review
  - Sub-topic 1
  - Sub-topic 2
- Methodology
- Results
- Conclusion
- References`;

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Custom Template Editor</CardTitle>
                    <CardDescription>
                        Define the structure of your document here. Use hyphens (-) for sections and indent with spaces for sub-sections. The AI will follow this structure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="min-h-[400px] font-mono text-sm"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
