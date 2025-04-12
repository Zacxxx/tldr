"use client";

import { useState } from 'react';
import {summarizeUrl} from '@/ai/flows/summarize-url';
import {Button} from "@/components/ui/button";

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const result = await summarizeUrl({ url });
      setSummary(result.summary);
      setContentType(result.contentType);
    } catch (error) {
      console.error("Error summarizing URL:", error);
      setSummary("Failed to summarize the URL. Please try again.");
      setContentType('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-container">
      <h1>TL;DR - AI-Powered Summarizer</h1>
      <input
        type="url"
        className="url-input"
        placeholder="Enter URL to summarize"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button
        className="summarize-button"
        onClick={handleSummarize}
        disabled={loading}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </Button>

      {summary && (
        <>
          <div className="summary-text">{summary}</div>
          <div className="source-details">
            Content Type: {contentType || "Unknown"} | Source URL: {url}
          </div>
        </>
      )}

      <a href="https://ko-fi.com/example" target="_blank" rel="noopener noreferrer">
        <button className="donation-button">Support via Ko-Fi</button>
      </a>
    </div>
  );
}
