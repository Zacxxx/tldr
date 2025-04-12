// src/ai/flows/summarize-url.ts
'use server';
/**
 * @fileOverview Summarizes content from a given URL.
 *
 * - summarizeUrl - A function that summarizes the content of a URL.
 * - SummarizeUrlInput - The input type for the summarizeUrl function.
 * - SummarizeUrlOutput - The return type for the SummarizeUrl function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {parseUrl, ContentType, extractContent} from '@/services/url-parser';

const SummarizeUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to summarize.'),
});
export type SummarizeUrlInput = z.infer<typeof SummarizeUrlInputSchema>;

const SummarizeUrlOutputSchema = z.object({
  summary: z.string().describe('The concise summary of the content.'),
  contentType: z.string().describe('The type of content that was summarized.'),
  logs: z.array(z.string()).describe('Logs from the summarization process.'),
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
      content: z.string().describe('The extracted content from the URL.')
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('The concise summary of the content.'),
    }),
  },
  prompt: `You are an expert summarizer. You will summarize the content from the given URL in a concise and informative manner.
Focus on extracting the key information and presenting it in a way that is easy to understand.

Content Type: {{{contentType}}}
URL: {{{url}}}
Content: {{{content}}}

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
    const logs: string[] = [];
    logs.push(`Fetching content metadata from ${input.url}`);
    const contentMetadata = await parseUrl(input.url);
    logs.push(`Content type detected: ${contentMetadata.type}`);

    logs.push(`Extracting content from ${input.url}`);
    const extractedContent = await extractContent(input.url, contentMetadata.type);
    logs.push(`Content extracted successfully.`);

    logs.push(`Summarizing content from ${input.url}`);
    const {output} = await summarizePrompt({
      url: input.url,
      contentType: contentMetadata.type,
      content: extractedContent,
    });
    logs.push(`Content summarized successfully.`);

    return {
      summary: output!.summary,
      contentType: contentMetadata.type,
      logs: logs,
    };
  }
);
