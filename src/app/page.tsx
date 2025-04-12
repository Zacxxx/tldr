"use client";

import {useState, useCallback, useEffect, useRef} from 'react';
import {summarizeUrl} from '@/ai/flows/summarize-url';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Icons} from "@/components/icons";
import {Sidebar, SidebarProvider, SidebarContent} from "@/components/ui/sidebar";
import {Card, CardDescription, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {motion} from "framer-motion";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
import {toast} from "@/hooks/use-toast";
import {ScrollArea} from "@/components/ui/scroll-area";

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [summaryHistory, setSummaryHistory] = useState<string[]>([]);
  const [summarizingUrl, setSummarizingUrl] = useState<string>(''); // Track URL being summarized
  const [isLoadingHistory, setIsLoadingHistory] = useState(true); // Track if history is loading
  const {toast} = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load summary history from local storage on mount
    const storedHistory = localStorage.getItem('summaryHistory');
    if (storedHistory) {
      setSummaryHistory(JSON.parse(storedHistory));
    }
    setIsLoadingHistory(false);
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the logs when they update
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Save summary history to local storage whenever it changes
    localStorage.setItem('summaryHistory', JSON.stringify(summaryHistory));
  }, [summaryHistory]);


  const handleSummarize = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSummary('');
    setLogs([]);
    setSummarizingUrl(url); // Set the URL being summarized

    try {
      if (!url) {
        setError("Please enter a URL to summarize.");
        toast({
          title: "Error",
          description: "Please enter a URL to summarize.",
          variant: "destructive",
        });
        return;
      }

      const result = await summarizeUrl({url});
      setSummary(result.summary);
      setContentType(result.contentType);
      setLogs(result.logs);

      // Update summary history
      const newHistory = [{
        url: url,
        summary: result.summary,
        contentType: result.contentType
      }, ...summaryHistory];
      setSummaryHistory(newHistory);

      toast({
        title: "Success",
        description: "URL summarized successfully!",
      });

    } catch (e: any) {
      console.error("Error summarizing URL:", e);
      setError(`Failed to summarize the URL. Please try again. ${e.message}`);
      setLogs([`Error: ${e.message}`]);
      toast({
        title: "Error",
        description: `Failed to summarize the URL. Please try again. ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSummarizingUrl(''); // Clear the URL being summarized
    }
  }, [url, summaryHistory, toast]);

  const sidebarVariants = {
    open: {x: 0, transition: {duration: 0.3, ease: "easeInOut"}},
    closed: {x: "-100%", transition: {duration: 0.3, ease: "easeInOut"}},
  };

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
              <CardTitle>Summaries</CardTitle>
              <CardDescription>Your past summaries</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <p>Loading history...</p>
              ) : summaryHistory.length === 0 ? (
                <p>No summaries yet.</p>
              ) : (
                <ScrollArea className="h-[200px] w-full rounded-md border">
                  {summaryHistory.map((item, index) => (
                    <div key={index} className="mb-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {item.url}
                      </a>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </Sidebar>

        <main className="main-content">
          <motion.header
            className="header"
            initial={{opacity: 0, y: -50}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
          >
            <h1>AI-Powered Summarizer</h1>
            <a href="https://ko-fi.com/example" target="_blank" rel="noopener noreferrer">
              <Button className="donation-button">
                <Icons.coffee className="mr-2 h-4 w-4"/>
                Support via Ko-Fi
              </Button>
            </a>
          </motion.header>

          <div className="container">
            <motion.div
              className="input-area"
              initial={{opacity: 0, scale: 0.8}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 0.5, delay: 0.2}}
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
                {loading ? (
                  <>
                    <Icons.loader className="mr-2 h-4 w-4 animate-spin"/>
                    Summarizing...
                  </>
                ) : "Summarize"}
              </Button>
            </motion.div>

            {error && (
              <motion.div
                initial={{opacity: 0, x: -50}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.3}}
              >
                <Alert variant="destructive">
                  <Icons.close className="h-4 w-4"/>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {loading && (
              <motion.div
                className="loading-area"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.5}}
              >
                <h2>Summarizing...</h2>
                <p>Detected Content Type: {contentType || "Detecting..."}</p>
                <h3>Logs:</h3>
                <div className="logs-container" ref={scrollRef}>
                  <ul>
                    {logs.map((log, index) => (
                      <li key={index}>{log}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {summary && (
              <motion.div
                className="summary-display"
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
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
