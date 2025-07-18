
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, AlertCircle, CheckCircle, ArrowRight, BookText, Database, Book, Users, Layers, Library } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateStoryAI, generateAndUploadCoverImageAction, countStoriesInDB, StoryCountBreakdown } from '@/app/actions/adminActions';
import Link from 'next/link';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalizeWords } from '@/lib/utils';
import { ALL_SUBGENRES } from '@/lib/types';

type Log = {
    id: number;
    status: 'pending' | 'generating' | 'saving' | 'imaging' | 'success' | 'error';
    message: string;
    title?: string;
    storyId?: string;
    error?: string;
};

const StatusIcon = ({ status }: { status: Log['status'] }) => {
  switch (status) {
    case 'pending': return <Bot className="h-5 w-5 text-muted-foreground" />;
    case 'generating':
    case 'saving':
    case 'imaging': 
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
    case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
  }
};

const GenerationLog = ({ logs }: { logs: Log[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><BookText className="mr-2 h-5 w-5" /> Generation Log</CardTitle>
      <p className="text-sm text-muted-foreground">A real-time log of the story generation process.</p>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-md">
            <StatusIcon status={log.status} />
            <div className="flex-1">
              <p className="font-semibold text-sm">{log.message}</p>
              {log.status === 'success' && log.title && (
                 <p className="text-xs text-primary font-medium">Successfully generated: "{log.title}"</p>
              )}
              {log.error && (
                 <p className="text-xs text-destructive">Error: {log.error}</p>
              )}
            </div>
            {log.status === 'success' && log.storyId && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/stories/${log.storyId}`} target="_blank">
                  View <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

function AdminDashboardContent() {
  const { user } = useAuth();
  const [numStories, setNumStories] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [completed, setCompleted] = useState(0);
  const [storyCount, setStoryCount] = useState<StoryCountBreakdown | null>(null);
  const [isCounting, setIsCounting] = useState(false);

  const updateLog = (id: number, updates: Partial<Log>) => {
      setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const handleCountStories = async () => {
    setIsCounting(true);
    setStoryCount(null);
    try {
      const count = await countStoriesInDB();
      setStoryCount(count);
    } catch (error) {
      console.error("Failed to count stories:", error);
      setStoryCount({
        totalStories: 0,
        standaloneStories: 0,
        multiPartSeriesCount: 0,
        storiesPerGenre: {},
      });
    } finally {
      setIsCounting(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) {
        alert("You must be logged in to generate stories.");
        return;
    }
    setIsGenerating(true);
    setLogs([]);
    setCompleted(0);

    const promises = Array.from({ length: numStories }).map(async (_, index) => {
      const logId = Date.now() + index;
      setLogs(prev => [...prev, { id: logId, status: 'pending', message: `Story ${index + 1}: Queued...` }]);
      
      try {
        // Step 1: AI Text Generation
        updateLog(logId, { status: 'generating', message: `Story ${index + 1}: Generating text...` });
        const result = await generateStoryAI();
        
        if (!result.success || !result.aiStoryResult) {
          throw new Error(result.error || "AI Generation failed.");
        }
        updateLog(logId, { status: 'saving', message: `Story ${index + 1}: Saving story "${result.title}"...`, title: result.title, storyId: result.storyId });

        // Step 2: Save Story to Firestore (Client-side)
        const storyDocRef = doc(db, 'stories', result.aiStoryResult.storyId);
        await setDoc(storyDocRef, {
            ...result.aiStoryResult.storyData,
            publishedAt: serverTimestamp(),
            // Start with a placeholder image
            coverImageUrl: 'https://placehold.co/600x900/D87093/F9E4EB.png?text=Generating...'
        });
        updateLog(logId, { status: 'imaging', message: `Story ${index + 1}: Generating cover image...` });

        // Step 3: Generate and Upload Cover Image
        const coverImageUrl = await generateAndUploadCoverImageAction(result.storyId, result.aiStoryResult.storyData.coverImagePrompt);
        
        // Step 4: Update Story with Cover Image URL (Client-side)
        await updateDoc(storyDocRef, { coverImageUrl });
        updateLog(logId, { status: 'success', message: `Story ${index + 1}: Complete!` });

      } catch (error: any) {
        console.error(`Error generating story ${index + 1}:`, error);
        updateLog(logId, { status: 'error', message: `Story ${index + 1}: Failed`, error: error.message || "An unknown error occurred." });
      } finally {
        setCompleted(prev => prev + 1);
      }
    });

    await Promise.all(promises);
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
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Database className="mr-2 h-5 w-5" /> Database Tools</CardTitle>
            <p className="text-sm text-muted-foreground">Verify the contents of your database.</p>
          </CardHeader>
          <CardContent className="space-y-4">
              <Button onClick={handleCountStories} disabled={isCounting || isGenerating}>
                {isCounting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookText className="mr-2 h-4 w-4" />}
                {isCounting ? 'Counting Stories...' : 'Analyze Story Database'}
              </Button>
              {storyCount !== null && (
                 <Alert variant="success">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Database Analysis Complete</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-md">
                          <div className="font-semibold flex items-center"><Book className="mr-2 h-4 w-4" />Total Stories</div>
                          <div className="font-bold text-lg">{storyCount.totalStories}</div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                           <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center"><Layers className="mr-2 h-4 w-4 text-primary"/>Story Types</CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex justify-between text-sm"><span>Standalone Stories:</span> <strong>{storyCount.standaloneStories}</strong></div>
                                  <div className="flex justify-between text-sm"><span>Multi-Part Series:</span> <strong>{storyCount.multiPartSeriesCount}</strong></div>
                              </CardContent>
                           </Card>
                           <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base flex items-center"><Library className="mr-2 h-4 w-4 text-primary"/>Genre Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {Object.entries(storyCount.storiesPerGenre).map(([genre, count]) => (
                                      <div key={genre} className="flex justify-between text-sm">
                                        <span>{capitalizeWords(genre)}:</span>
                                        <strong>{count}</strong>
                                      </div>
                                  ))}
                                </CardContent>
                           </Card>
                        </div>
                      </div>
                    </AlertDescription>
                </Alert>
              )}
           </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5" /> AI Story Generator</CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate multiple romance stories in parallel using different AI models.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
             <Button onClick={handleGenerate} disabled={isGenerating || !user} className="w-full">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              {isGenerating ? `Generating ${completed}/${numStories}...` : `Generate ${numStories} ${numStories > 1 ? 'Stories' : 'Story'}`}
            </Button>
          </CardContent>
        </Card>

        {logs.length > 0 && <GenerationLog logs={logs} />}
      </div>
    </>
  );
}

export default function AdminPage() {
    return <AdminDashboardContent />;
}
