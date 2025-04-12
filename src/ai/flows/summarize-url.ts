// src/ai/flows/summarize-url.ts
'use server';
/**
 * @fileOverview Summarizes content from a given URL.
 *
 * - summarizeUrl - A function that summarizes the content of a URL.
 * - SummarizeUrlInput - The input type for the summarizeUrl function.
 * - SummarizeUrlOutput - The return type for the summarizeUrl function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {parseUrl, ContentType} from '@/services/url-parser';

const SummarizeUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to summarize.'),
});
export type SummarizeUrlInput = z.infer<typeof SummarizeUrlInputSchema>;

const SummarizeUrlOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the content.'),
  contentType: z.string().describe('The type of content that was summarized.'),
});
export type SummarizeUrlOutput = z.infer<typeof SummarizeUrlOutputSchema>;

export async function summarizeUrl(input: SummarizeUrlInput): Promise<SummarizeUrlOutput> {
  return summarizeUrlFlow(input);
}

const summarizePrompt = ai.definePrompt({
  name: 'summarizePrompt',
  input: {
    schema: z.object({
      url: z.string().url().describe('The URL to summarize.'),
      contentType: z.string().describe('The type of content at the URL.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('The concise summary of the content.'),
    }),
  },
  prompt: `You are an expert summarizer. You will summarize the content at the given URL in a concise manner.

Content Type: {{{contentType}}}
URL: {{{url}}}

Summary:`,
});

const summarizeUrlFlow = ai.defineFlow<
  typeof SummarizeUrlInputSchema,
  typeof SummarizeUrlOutputSchema
>(
  {
    name: 'summarizeUrlFlow',
    inputSchema: SummarizeUrlInputSchema,
    outputSchema: SummarizeUrlOutputSchema,
  },
  async input => {
    const contentMetadata = await parseUrl(input.url);
    const {output} = await summarizePrompt({
      url: input.url,
      contentType: contentMetadata.type,
    });
    return {
      summary: output!.summary,
      contentType: contentMetadata.type,
    };
  }
);
