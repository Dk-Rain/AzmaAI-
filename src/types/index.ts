import type { ArrangeContentOutput } from '@/ai/flows/arrange-content-into-academic-format';
import type { ManageReferencesOutput } from '@/ai/flows/manage-references';

export type DocumentContent = ArrangeContentOutput;
export type Section = ArrangeContentOutput['sections'][0];
export type SubSection = NonNullable<Section['subSections']>[0];

export type StyleOptions = {
  fontSize: number;
  lineHeight: number;
  margin: number; // in cm
};

export type References = ManageReferencesOutput['references'];
export type Reference = References[0];
