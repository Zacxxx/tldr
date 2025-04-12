'use server';
/**
 * @fileOverview Adapts the tone of a summary to match the input document.
 *
 * - adaptSummaryTone - A function that adapts the tone of a summary.
 * - AdaptSummaryToneInput - The input type for the adaptSummaryTone function.
 * - AdaptSummaryToneOutput - The return type for the adaptSummaryTone function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AdaptSummaryToneInputSchema = z.object({
  document: z.string().describe('The input document to summarize.'),
  summary: z.string().describe('The original summary of the document.'),
});
export type AdaptSummaryToneInput = z.infer<typeof AdaptSummaryToneInputSchema>;

const AdaptSummaryToneOutputSchema = z.object({
  adaptedSummary: z.string().describe('The summary with an adapted tone.'),
});
export type AdaptSummaryToneOutput = z.infer<typeof AdaptSummaryToneOutputSchema>;

export async function adaptSummaryTone(input: AdaptSummaryToneInput): Promise<AdaptSummaryToneOutput> {
  return adaptSummaryToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptSummaryTonePrompt',
  input: {
    schema: z.object({
      document: z.string().describe('The input document to summarize.'),
      summary: z.string().describe('The original summary of the document.'),
    }),
  },
  output: {
    schema: z.object({
      adaptedSummary: z.string().describe('The summary with an adapted tone.'),
    }),
  },
  prompt: `You are an AI expert in adapting text to match the original document's tone.

  Given the following document and summary, adapt the summary to match the tone of the document.

  Document: {{{document}}}
  Summary: {{{summary}}}

  Adapted Summary:`,
});

const adaptSummaryToneFlow = ai.defineFlow<
  typeof AdaptSummaryToneInputSchema,
  typeof AdaptSummaryToneOutputSchema
>(
  {
    name: 'adaptSummaryToneFlow',
    inputSchema: AdaptSummaryToneInputSchema,
    outputSchema: AdaptSummaryToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      adaptedSummary: output!.adaptedSummary,
    };
  }
);
