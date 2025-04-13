"use client";

import {useState, useCallback, useEffect, useRef} from 'react';
import {summarizeUrl} from '@/ai/flows/summarize-url';
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Icons} from "@/components/icons";
import {Card} from "@/components/ui/card";
import {motion, AnimatePresence} from "framer-motion";
import {useToast} from "@/hooks/use-toast";
import LiquidButton from '@/components/ui/liquid-button/liquid-button';

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const {toast} = useToast();

  const handleSummarize = useCallback(async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL to summarize.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');
    setLogs([]);

    try {
      const result = await summarizeUrl({url});
      setSummary(result.summary);
      setContentType(result.contentType);
      setLogs(result.logs);

      toast({
        title: "Success",
        description: "Content summarized successfully!",
      });
    } catch (e: any) {
      console.error("Error summarizing URL:", e);
      setError(e.message);
      toast({
        title: "Error",
        description: `Failed to summarize. ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [url, toast]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Summarize Any Content
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant AI-powered summaries of articles, videos, and more. Save time and get the key points in seconds.
            </p>
          </div>
          
          <Card className="w-full shadow-lg">
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Enter URL to summarize..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="flex-shrink-0">
                  <LiquidButton
                    onClick={handleSummarize}
                    disabled={loading}
                    text={loading ? "Summarizing..." : "Summarize"}
                    width={150}
                    height={48}
                    backgroundColor="#7C3AED"
                    gradientColorInner="#C084FC"
                    gradientColorOuter="#4C1D95"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {loading ? (
                  <>
                    <Icons.loader className="h-4 w-4 animate-spin" />
                    <span>Summarizing content...</span>
                  </>
                ) : (
                  <>
                    <span>Ready to summarize</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                  </>
                )}
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -10}}
              >
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20}}
              >
                <Card className="shadow-lg">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Summary</h2>
                      <span className="text-sm text-muted-foreground">{contentType}</span>
                    </div>
                    <p className="text-base leading-relaxed">{summary}</p>
                    <div className="pt-4 border-t">
                      <a 
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-accent transition-colors inline-flex items-center"
                      >
                        View original content
                        <span className="ml-1">→</span>
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

