
'use server';
import { config } from 'dotenv';
config();


import '@/ai/flows/generate-academic-content.ts';
import '@/ai/flows/paraphrase-text.ts';
import '@/ai/flows/scan-text-snippet.ts';
import '@/ai/flows/check-plagiarism.ts';
import '@/ai/flows/edit-section.ts';
import '@/ai/flows/verify-references.ts';
import '@/ai/flows/generate-image-for-section.ts';


