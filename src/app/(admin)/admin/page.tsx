
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, AlertCircle, CheckCircle, ArrowRight, BookText, Database, Book, Layers, Library, Wrench, Tags, Coins, FileText, Type, Lock, Search, DollarSign, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateStoryAI, standardizeGenresAction, removeTagsAction, analyzeDatabaseAction, standardizeStoryPricesAction } from '@/app/actions/adminActions';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { capitalizeWords } from '@/lib/utils';
import { type GeneratedStoryIdentifiers, type CleanupResult, type DatabaseMetrics } from '@/lib/types';
import { generateAndUploadCoverImageAction } from '@/app/actions/adminActions';
import { Separator } from '@/components/ui/separator';


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

const MetricCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ElementType, description: string }) => {
    const Icon = icon;
    return (
        <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DatabaseMetrics | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [isPricing, setIsPricing] = useState(false);
  const [isRemovingTags, setIsRemovingTags] = useState(false);

  const updateLog = (id: number, updates: Partial<Log>) => {
      setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const handleAnalyzeDatabase = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    try {
      const result = await analyzeDatabaseAction();
      setAnalysisResult(result);
    } catch (error: any) {
      console.error("Failed to analyze database:", error);
      setAnalysisError(error.message || "An unknown error occurred while analyzing the database.");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleStandardizeGenres = async () => {
    setIsCleaning(true);
    setCleanupResult(null);
    try {
      const result = await standardizeGenresAction();
      setCleanupResult(result);
      if (result.success && analysisResult) {
        await handleAnalyzeDatabase();
      }
    } catch (error: any) {
        setCleanupResult({ success: false, message: error.message || 'An unknown error occurred.', checked: 0, updated: 0 });
    } finally {
        setIsCleaning(false);
    }
  };
  
  const handleStandardizePrices = async () => {
    setIsPricing(true);
    setCleanupResult(null);
    try {
      const result = await standardizeStoryPricesAction();
      setCleanupResult(result);
      if (result.success && analysisResult) {
        await handleAnalyzeDatabase();
      }
    } catch (error: any) {
        setCleanupResult({ success: false, message: error.message || 'An unknown error occurred.', checked: 0, updated: 0 });
    } finally {
        setIsPricing(false);
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

  const isToolRunning = isAnalyzing || isGenerating || isCleaning || isRemovingTags || isPricing;

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
            <CardDescription>Analyze and maintain the story database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAnalyzeDatabase} disabled={isToolRunning}>
                  {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Database'}
                </Button>
                 <Button onClick={handleStandardizePrices} disabled={isToolRunning} variant="outline">
                    {isPricing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                    {isPricing ? 'Updating...' : 'Standardize Story Prices'}
                </Button>
                <Button onClick={handleStandardizeGenres} disabled={isToolRunning} variant="outline">
                    {isCleaning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
                    {isCleaning ? 'Cleaning...' : 'Standardize Genres'}
                </Button>
                <Button onClick={handleRemoveTags} disabled={isToolRunning} variant="outline">
                    {isRemovingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
                    {isRemovingTags ? 'Removing...' : 'Remove Orphaned Tags'}
                </Button>
              </div>

              {cleanupResult && (
                <Alert variant={cleanupResult.success ? 'success' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{cleanupResult.success ? 'Operation Complete' : 'Operation Failed'}</AlertTitle>
                  <AlertDescription>{cleanupResult.message}</AlertDescription>
                </Alert>
              )}
              
              {analysisError && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{analysisError}</AlertDescription>
                </Alert>
              )}

              {analysisResult && (
                <Alert variant="success" className="mt-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Database Analysis Complete</AlertTitle>
                    <AlertDescription asChild>
                         <div className="space-y-6 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center"><Book className="mr-2 h-5 w-5 text-primary" />Content Composition</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <MetricCard 
                                            title="Total Unique Stories" 
                                            value={analysisResult.totalUniqueStories.toLocaleString()} 
                                            icon={Library}
                                            description="Standalone stories + series."
                                        />
                                        <MetricCard 
                                            title="Total Chapters" 
                                            value={analysisResult.totalChapters.toLocaleString()} 
                                            icon={BookText}
                                            description="Total individual story chapters."
                                        />
                                        <MetricCard 
                                            title="Total Words" 
                                            value={analysisResult.totalWordCount.toLocaleString()} 
                                            icon={FileText}
                                            description="Across all story content."
                                        />
                                    </div>
                                    <Card>
                                      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-border">
                                        <div className="p-2">
                                          <h4 className="font-semibold text-base flex items-center mb-2"><Layers className="mr-2 h-4 w-4 text-primary" />Story Types</h4>
                                          <div className="text-sm space-y-2">
                                            <p className="flex justify-between"><span>Standalone Stories:</span> <strong>{analysisResult.standaloneStories}</strong></p>
                                            <p className="flex justify-between"><span>Multi-Chapter Series:</span> <strong>{analysisResult.multiPartSeriesCount}</strong></p>
                                          </div>
                                        </div>
                                        <div className="p-2 pt-4 md:pt-2 md:pl-4">
                                          <h4 className="font-semibold text-base flex items-center mb-2"><Tags className="mr-2 h-4 w-4 text-primary" />Genre Breakdown</h4>
                                          <div className="text-sm space-y-1">
                                            {Object.entries(analysisResult.storiesPerGenre).length > 0 ? (
                                              Object.entries(analysisResult.storiesPerGenre).map(([genre, count]) => (
                                                <div key={genre} className="flex justify-between">
                                                  <span>{capitalizeWords(genre)}:</span>
                                                  <strong>{count}</strong>
                                                </div>
                                              ))
                                            ) : (
                                              <p className="text-muted-foreground">No genre data.</p>
                                            )}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center"><Coins className="mr-2 h-5 w-5 text-primary" />Monetization Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                     <Card className="lg:col-span-1">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center"><Lock className="mr-2 h-4 w-4 text-primary" />Paid Chapters</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <p className="text-2xl font-bold">{analysisResult.totalPaidChapters.toLocaleString()}</p>
                                            <Separator />
                                            <div className="text-sm text-muted-foreground pt-2">
                                                <p className="flex justify-between"><span>Standalone:</span> <strong>{analysisResult.paidStandaloneStories}</strong></p>
                                                <p className="flex justify-between"><span>Series Chapters:</span> <strong>{analysisResult.paidSeriesChapters}</strong></p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <MetricCard 
                                        title="Total Library Value" 
                                        value={`$${analysisResult.totalValueUSD.toLocaleString()}`}
                                        icon={DollarSign}
                                        description={`${analysisResult.totalCoinCost.toLocaleString()} Coins to unlock all paid content.`}
                                    />
                                    <MetricCard 
                                        title="Avg. Cost / Paid Chapter" 
                                        value={`~$${analysisResult.avgValuePerPaidChapterUSD.toFixed(2)}`}
                                        icon={Type}
                                        description={`${analysisResult.avgCoinCostPerPaidChapter} Coins. Based on the 50-coin premium price.`}
                                    />
                                </CardContent>
                            </Card>
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

    