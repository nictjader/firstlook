'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, AlertCircle, CheckCircle, ArrowRight, BookText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateSingleStory, type GenerationResult } from '@/app/actions/adminActions';
import Link from 'next/link';

// --- Helper Components ---

const StatusIcon = ({ status }: { status: 'pending' | 'generating' | 'success' | 'error' }) => {
  switch (status) {
    case 'pending': return <Bot className="h-5 w-5 text-muted-foreground" />;
    case 'generating': return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
  }
};

const GenerationLog = ({ logs }: { logs: (GenerationResult & { logMessage: string })[] }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center"><BookText className="mr-2 h-5 w-5" /> Generation Log</h3>
      <p className="text-sm text-muted-foreground">A real-time log of the story generation process.</p>
    </div>
    <div className="p-6 pt-0">
      <div className="space-y-3">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
            <StatusIcon status={log.success ? 'success' : (log.error ? 'error' : 'generating')} />
            <div className="flex-1">
              <p className="font-semibold text-sm">{log.logMessage}</p>
              {log.success && log.title && (
                 <p className="text-xs text-primary font-medium">Successfully generated: "{log.title}"</p>
              )}
              {log.error && (
                 <p className="text-xs text-destructive">Error: {log.error}</p>
              )}
            </div>
            {log.success && log.storyId && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/stories/${log.storyId}`} target="_blank">
                  View <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Main Admin Dashboard Component ---

function AdminDashboardContent() {
  const [numStories, setNumStories] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<(GenerationResult & { logMessage: string })[]>([]);
  const [completed, setCompleted] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setLogs([]);
    setCompleted(0);

    const generationPromises = Array.from({ length: numStories }).map((_, index) => {
      const logMessage = `Initiating generation for story ${index + 1}...`;
      setLogs(prev => [...prev, { logMessage, success: false, error: null, title: '', storyId: '' }]);
      
      return generateSingleStory()
        .then(result => {
          setLogs(prev => prev.map(l => l.logMessage === logMessage ? { ...result, logMessage: `Story ${index + 1}: ${result.title || 'Untitled'}` } : l));
          setCompleted(prev => prev + 1);
        })
        .catch(error => {
          console.error(`Error generating story ${index + 1}:`, error);
          const errorMessage = error.message || "An unknown error occurred.";
          setLogs(prev => prev.map(l => l.logMessage === logMessage ? { logMessage: `Story ${index + 1} Failed`, success: false, error: errorMessage, title: '', storyId: '' } : l));
          setCompleted(prev => prev + 1);
        });
    });

    await Promise.all(generationPromises);
    setIsGenerating(false);
  };

  return (
    <>
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">Admin Section</p>
        <p>This area is for administrative purposes only.</p>
      </div>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-headline font-bold text-primary text-center">Admin Dashboard</h1>

        {isGenerating && (
          <Alert variant="default" className="border-primary/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Generation in Progress</AlertTitle>
            <AlertDescription>
              Generating {numStories} stories. This may take several minutes. Please do not navigate away.
              ({completed}/{numStories} completed)
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm shadow-lg">
          <div className="p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">AI Story Generator</h3>
            <p className="text-sm text-muted-foreground">
              Generate multiple romance stories in parallel using different AI models.
            </p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div>
              <Label htmlFor="num-stories">Number of Stories to Generate</Label>
              <Input
                id="num-stories"
                type="number"
                value={numStories}
                onChange={(e) => setNumStories(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="20"
                disabled={isGenerating}
              />
            </div>
          </div>
          <div className="flex items-center p-6 pt-0">
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              <Bot className="mr-2 h-4 w-4" /> 
              {isGenerating ? 'Generating...' : `Generate ${numStories} ${numStories > 1 ? 'Stories' : 'Story'}`}
            </Button>
          </div>
        </div>

        {logs.length > 0 && <GenerationLog logs={logs} />}
      </div>
    </>
  );
}

export default function AdminPage() {
    return <AdminDashboardContent />;
}
