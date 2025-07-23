
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, AlertCircle, CheckCircle, ArrowRight, BookText, Database, Book, Layers, Library, Wrench, Tags, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateStoryAI, standardizeGenresAction, removeTagsAction, analyzePricingMetricsAction } from '@/app/actions/adminActions';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalizeWords } from '@/lib/utils';
import { type Story, type GeneratedStoryIdentifiers, type CleanupResult, type StoryCountBreakdown, type PricingMetrics } from '@/lib/types';
import { getAllStories } from '@/app/actions/storyActions';
import { generateAndUploadCoverImageAction } from '@/app/actions/adminActions';


type Log = {
    id: number;
    status: 'pending' | 'generating' | 'imaging' | 'success' | 'error';
    message: string;
    title?: string;
    storyId?: string;
    error?: string;
};

const StatusIcon = ({ status }: { status: Log['status'] }) => {
  switch (status) {
    case 'pending': return <Bot className="h-5 w-5 text-muted-foreground" />;
    case 'generating':
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

function analyzeStories(stories: Story[]): StoryCountBreakdown {
  const storiesPerGenre: Record<string, number> = {};
  const seriesGenres = new Map<string, string>(); // seriesId -> genre
  let standaloneStories = 0;
  
  stories.forEach(story => {
    const genre = story.subgenre || 'uncategorized';

    if (story.seriesId) {
      if (!seriesGenres.has(story.seriesId)) {
        seriesGenres.set(story.seriesId, genre);
      }
    } else {
      standaloneStories++;
      storiesPerGenre[genre] = (storiesPerGenre[genre] || 0) + 1;
    }
  });

  seriesGenres.forEach((genre) => {
    storiesPerGenre[genre] = (storiesPerGenre[genre] || 0) + 1;
  });

  const multiPartSeriesCount = seriesGenres.size;
  const totalUniqueStories = standaloneStories + multiPartSeriesCount;

  return {
    totalUniqueStories,
    standaloneStories,
    multiPartSeriesCount,
    storiesPerGenre,
  };
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const [numStories, setNumStories] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [completed, setCompleted] = useState(0);
  const [storyCount, setStoryCount] = useState<StoryCountBreakdown | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [countError, setCountError] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [isRemovingTags, setIsRemovingTags] = useState(false);
  const [isAnalyzingPricing, setIsAnalyzingPricing] = useState(false);
  const [pricingMetrics, setPricingMetrics] = useState<PricingMetrics | null>(null);

  const updateLog = (id: number, updates: Partial<Log>) => {
      setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const handleCountStories = async () => {
    setIsCounting(true);
    setStoryCount(null);
    setCountError(null);
    try {
      const stories = await getAllStories();
      if (!stories) {
        throw new Error("The story fetch returned null or undefined.");
      }
      const counts = analyzeStories(stories);
      setStoryCount(counts);
    } catch (error: any) {
      console.error("Failed to count stories:", error);
      setCountError(error.message || "An unknown error occurred while analyzing the database.");
    } finally {
      setIsCounting(false);
    }
  };

  const handleAnalyzePricing = async () => {
    setIsAnalyzingPricing(true);
    setPricingMetrics(null);
    setCountError(null);
    try {
      const metrics = await analyzePricingMetricsAction();
      setPricingMetrics(metrics);
    } catch (error: any) {
        console.error("Failed to analyze pricing:", error);
        setCountError(error.message || "An unknown error occurred while analyzing pricing.");
    } finally {
        setIsAnalyzingPricing(false);
    }
  };


  const handleStandardizeGenres = async () => {
    setIsCleaning(true);
    setCleanupResult(null);
    try {
      const result = await standardizeGenresAction();
      setCleanupResult(result);
      if (result.success) {
        await handleCountStories();
      }
    } catch (error: any) {
        setCleanupResult({ success: false, message: error.message || 'An unknown error occurred.', checked: 0, updated: 0 });
    } finally {
        setIsCleaning(false);
    }
  };

  const handleRemoveTags = async () => {
    setIsRemovingTags(true);
    setCleanupResult(null);
    try {
      const result = await removeTagsAction();
      setCleanupResult(result);
    } catch (error: any) {
      setCleanupResult({ success: false, message: error.message || 'An unknown error occurred.', checked: 0, updated: 0 });
    } finally {
      setIsRemovingTags(false);
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
        updateLog(logId, { status: 'generating', message: `Story ${index + 1}: Generating text and saving...` });
        const result: GeneratedStoryIdentifiers = await generateStoryAI();
        
        if (!result.success || !result.storyId) {
          throw new Error(result.error || "AI Generation failed.");
        }
        
        updateLog(logId, { status: 'imaging', message: `Story ${index + 1}: Generating cover image for "${result.title}"...`, title: result.title, storyId: result.storyId });

        if (result.coverImagePrompt) {
          await generateAndUploadCoverImageAction(result.storyId, result.coverImagePrompt);
        }
        
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

  const isToolRunning = isCounting || isGenerating || isCleaning || isRemovingTags || isAnalyzingPricing;

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
            <p className="text-sm text-muted-foreground">Analyze and maintain the story database.</p>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCountStories} disabled={isToolRunning}>
                  {isCounting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookText className="mr-2 h-4 w-4" />}
                  {isCounting ? 'Analyzing...' : 'Analyze Story Database'}
                </Button>
                <Button onClick={handleStandardizeGenres} disabled={isToolRunning} variant="outline">
                    {isCleaning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
                    {isCleaning ? 'Cleaning...' : 'Standardize Genres'}
                </Button>
                <Button onClick={handleRemoveTags} disabled={isToolRunning} variant="outline">
                    {isRemovingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
                    {isRemovingTags ? 'Removing...' : 'Remove Orphaned Tags'}
                </Button>
                <Button onClick={handleAnalyzePricing} disabled={isToolRunning} variant="outline">
                    {isAnalyzingPricing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
                    {isAnalyzingPricing ? 'Analyzing...' : 'Analyze Pricing Metrics'}
                </Button>
              </div>

              {cleanupResult && (
                <Alert variant={cleanupResult.success ? 'success' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{cleanupResult.success ? 'Cleanup Complete' : 'Cleanup Failed'}</AlertTitle>
                  <AlertDescription>{cleanupResult.message}</AlertDescription>
                </Alert>
              )}
              
              {countError && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{countError}</AlertDescription>
                </Alert>
              )}

              {pricingMetrics && (
                <Alert variant="success" className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Pricing Analysis Complete</AlertTitle>
                    <AlertDescription>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <span className="font-semibold">Total Stories Analyzed:</span>
                            <span>{pricingMetrics.totalStories}</span>
                            <span className="font-semibold">Premium Stories:</span>
                            <span>{pricingMetrics.premiumStories}</span>
                            <span className="font-semibold">Average Word Count:</span>
                            <span>{pricingMetrics.averageWordCount.toLocaleString()} words</span>
                            <span className="font-semibold">Average Coin Cost:</span>
                            <span>{pricingMetrics.averageCoinCost.toFixed(2)} coins</span>
                            <span className="font-semibold">Total Word Count:</span>
                            <span>{pricingMetrics.totalWordCount.toLocaleString()} words</span>
                            <span className="font-semibold">Total Coin Cost to Unlock All:</span>
                            <span>{pricingMetrics.totalCoinCost.toLocaleString()} coins</span>
                        </div>
                    </AlertDescription>
                </Alert>
              )}


              {storyCount !== null && !countError && !pricingMetrics && (
                 <Alert variant="success" className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Database Analysis Complete</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-md text-base">
                          <div className="font-semibold flex items-center"><Book className="mr-2 h-5 w-5" />Total Unique Stories</div>
                          <div className="font-bold text-xl">{storyCount.totalUniqueStories}</div>
                        </div>
                         
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="p-3 bg-green-500/10 rounded-md space-y-2">
                              <h4 className="font-semibold flex items-center mb-2"><Layers className="mr-2 h-4 w-4 text-primary"/>Story Types</h4>
                              <div className="flex justify-between text-sm"><span>Standalone Stories:</span> <strong>{storyCount.standaloneStories}</strong></div>
                              <div className="flex justify-between text-sm"><span>Multi-Part Stories:</span> <strong>{storyCount.multiPartSeriesCount}</strong></div>
                           </div>
                           <div className="p-3 bg-green-500/10 rounded-md">
                                <h4 className="font-semibold flex items-center mb-2"><Library className="mr-2 h-4 w-4 text-primary"/>Genre Breakdown</h4>
                                {Object.entries(storyCount.storiesPerGenre).length > 0 ? (
                                  Object.entries(storyCount.storiesPerGenre).map(([genre, count]) => (
                                      <div key={genre} className="flex justify-between text-sm">
                                        <span>{capitalizeWords(genre)}:</span>
                                        <strong>{count}</strong>
                                      </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">No genre data available.</p>
                                )}
                           </div>
                        </div>
                      </div>
                    </AlertDescription>
                </Alert>
              )}
           </CardContent>
        </Card>
        
        <Card>
           <CardHeader>
            <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5" /> Story Generator</CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate new stories from the unused seeds in your library.
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
             <Button onClick={handleGenerate} disabled={isToolRunning || !user} className="w-full">
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

    