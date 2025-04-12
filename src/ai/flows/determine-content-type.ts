'use server';
/**
 * @fileOverview Determines the content type of a given URL.
 *
 * - determineContentType - A function that determines the content type of a URL.
 * - DetermineContentTypeInput - The input type for the determineContentType function.
 * - DetermineContentTypeOutput - The return type for the determineContentType function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {parseUrl, ContentType} from '@/services/url-parser';

const DetermineContentTypeInputSchema = z.object({
  url: z.string().describe('The URL to determine the content type of.'),
});
export type DetermineContentTypeInput = z.infer<typeof DetermineContentTypeInputSchema>;

const DetermineContentTypeOutputSchema = z.object({
  contentType: z.enum(['article', 'video', 'tweet', 'thread', 'unknown']).describe('The content type of the URL.'),
});
export type DetermineContentTypeOutput = z.infer<typeof DetermineContentTypeOutputSchema>;

export async function determineContentType(input: DetermineContentTypeInput): Promise<DetermineContentTypeOutput> {
  return determineContentTypeFlow(input);
}

const determineContentTypeFlow = ai.defineFlow<
  typeof DetermineContentTypeInputSchema,
  typeof DetermineContentTypeOutputSchema
>({
  name: 'determineContentTypeFlow',
  inputSchema: DetermineContentTypeInputSchema,
  outputSchema: DetermineContentTypeOutputSchema,
}, async (input) => {
  const metadata = await parseUrl(input.url);
  return {contentType: metadata.type};
});