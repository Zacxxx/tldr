"use client";

import { useState, useCallback, useEffect } from 'react';
import {summarizeUrl} from '@/ai/flows/summarize-url';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Icons} from "@/components/icons";
import {Sidebar, SidebarProvider, SidebarContent} from "@/components/ui/sidebar";
import {Card, CardDescription, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {motion} from "framer-motion";

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [summaryHistory, setSummaryHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load summary history from local storage on mount
    const storedHistory = localStorage.getItem('summaryHistory');
    if (storedHistory) {
      setSummaryHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleSummarize = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSummary('');
    setLogs([]);

    try {
      if (!url) {
        setError("Please enter a URL to summarize.");
        return;
      }

      const result = await summarizeUrl({ url });
      setSummary(result.summary);
      setContentType(result.contentType);
      setLogs(result.logs);

      // Update summary history
      const newHistory = [result.summary, ...summaryHistory];
      setSummaryHistory(newHistory);

      // Save to local storage
      localStorage.setItem('summaryHistory', JSON.stringify(newHistory));

    } catch (e: any) {
      console.error("Error summarizing URL:", e);
      setError(`Failed to summarize the URL. Please try again. ${e.message}`);
      setLogs([`Error: ${e.message}`]);
    } finally {
      setLoading(false);
    }
  }, [url, summaryHistory]);

  return (
    <SidebarProvider>
      <div className="app-layout">
        <Sidebar>
          <Card>
            <CardHeader>
              <CardTitle>TL;DR</CardTitle>
              <CardDescription>AI-Powered Summarizer</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Summary History</CardTitle>
              <CardDescription>Your past summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <ul>
                {summaryHistory.map((summary, index) => (
                  <li key={index} className="truncate">{summary}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Sidebar>

        <main className="main-content">
          <motion.header
            className="header"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>AI-Powered Summarizer</h1>
            <a href="https://ko-fi.com/example" target="_blank" rel="noopener noreferrer">
              <Button className="donation-button">Support via Ko-Fi</Button>
            </a>
          </motion.header>

          <div className="container">
            <motion.div
              className="input-area"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
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
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <Icons.close className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {loading && (
              <motion.div
                className="loading-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2>Summarizing...</h2>
                <p>Detected Content Type: {contentType || "Detecting..."}</p>
                <h3>Logs:</h3>
                <ul>
                  {logs.map((log, index) => (
                    <li key={index}>{log}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {summary && (
              <motion.div
                className="summary-display"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2>Summary</h2>
                <p className="summary-text">{summary}</p>
                <div className="source-details">
                  Content Type: {contentType || "Unknown"} | Source URL: {url}
                </div>
              </motion.div>
            )}
          </div>

          <footer className="footer">
            <p>© {new Date().getFullYear()} TL;DR - AI Summarizer</p>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
