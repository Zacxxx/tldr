"use client";

import { useState, useCallback } from 'react';
import {summarizeUrl} from '@/ai/flows/summarize-url';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Icons} from "@/components/icons";

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSummary(''); // Clear previous summary

    try {
      if (!url) {
        setError("Please enter a URL to summarize.");
        return;
      }

      const result = await summarizeUrl({ url });
      setSummary(result.summary);
      setContentType(result.contentType);
    } catch (e: any) {
      console.error("Error summarizing URL:", e);
      setError(`Failed to summarize the URL. Please try again. ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [url]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>TL;DR</h2>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>AI-Powered Summarizer</h1>
          <a href="https://ko-fi.com/example" target="_blank" rel="noopener noreferrer">
            <Button className="donation-button">Support via Ko-Fi</Button>
          </a>
        </header>

        <div className="container">
          <Input
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

          {error && (
            <Alert variant="destructive">
              <Icons.close className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {summary && (
            <div className="summary-display">
              <h2>Summary</h2>
              <p className="summary-text">{summary}</p>
              <div className="source-details">
                Content Type: {contentType || "Unknown"} | Source URL: {url}
              </div>
            </div>
          )}
        </div>

        <footer className="footer">
          <p>© {new Date().getFullYear()} TL;DR - AI Summarizer</p>
        </footer>
      </main>
    </div>
  );
}
