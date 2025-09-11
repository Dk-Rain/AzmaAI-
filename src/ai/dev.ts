'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/manage-references.ts';
import '@/ai/flows/arrange-content-into-academic-format.ts';
import '@/ai/flows/generate-academic-content.ts';
import '@/ai/flows/paraphrase-text.ts';
import '@/ai/flows/scan-and-clean-document.ts';
