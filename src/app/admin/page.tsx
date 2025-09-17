
'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Loader2, Bot, AlertCircle, Search, Wrench, Tags, Book, Library, BookText, FileText, Layers, Coins, Lock, Trash2, PenSquare, BarChart3, Users, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { generateStoryAI, standardizeGenresAction, removeTagsAction, analyzeDatabaseAction, standardizeStoryPricesAction, generateAndUploadCoverImageAction, cleanupDuplicateStoriesAction, getChapterAnalysisAction, regenerateMissingChaptersAction } from '../../lib/actions/adminActions';
import { useAuth } from '../../contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { capitalizeWords } from '../../lib/utils';
import { type GeneratedStoryIdentifiers, type CleanupResult, type DatabaseMetrics, type ChapterAnalysis } from '../../lib/types';
import { Separator } from '../../components/ui/separator';
import MetricCard from '../../components/admin/metric-card';
import GenerationLog, { type Log } from '../../components/admin/generation-log';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import ChapterAnalysisTable from '../../components/admin/chapter-analysis-table';

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
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [isAnalyzingChapters, setIsAnalyzingChapters] = useState(false);
  const [chapterAnalysisData, setChapterAnalysisData] = useState<ChapterAnalysis[] | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const addLog = (log: Omit<Log, 'id'>) => {
      setLogs(prev => [...prev, { ...log, id: Date.now() + Math.random() }]);
  };
  
  const updateLog = (id: number, updates: Partial<Log>) => {
      setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const isToolRunning = isAnalyzing || isGenerating || isCleaning || isRemovingTags || isPricing || isCleaningDuplicates || isAnalyzingChapters || isRegenerating;

  const handleAnalyzeDatabase = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    setCleanupResult(null);
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

  const handleChapterAnalysis = async () => {
    setIsAnalyzingChapters(true);
    setChapterAnalysisData(null);
    setAnalysisError(null);
    try {
      const result = await getChapterAnalysisAction();
      setChapterAnalysisData(result);
    } catch (error: any) {
      console.error("Failed to analyze chapters:", error);
      setAnalysisError(error.message || "An unknown error occurred during chapter analysis.");
    } finally {
        setIsAnalyzingChapters(false);
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

  const handleCleanupDuplicates = async () => {
    setIsCleaningDuplicates(true);
    setCleanupResult(null);
    try {
        const result = await cleanupDuplicateStoriesAction();
        setCleanupResult(result);
        if (result.success && analysisResult) {
            await handleAnalyzeDatabase();
        }
    } catch (error: any) {
        setCleanupResult({ success: false, message: error.message || 'An unknown error occurred.', checked: 0, updated: 0 });
    } finally {
        setIsCleaningDuplicates(false);
    }
  };

  const handleRegenerateMissing = async () => {
    setIsRegenerating(true);
    setLogs([]);
    setCompleted(0);
    setAnalysisResult(null);
    setCleanupResult(null);
  
    const initialLogId = Date.now() + Math.random();
    addLog({ id: initialLogId, status: 'generating', message: 'Finding incomplete series...' });
  
    try {
      const results = await regenerateMissingChaptersAction();
  
      // Update or remove the initial "Finding..." message
      updateLog(initialLogId, { status: 'success', message: 'Scan complete. See chapter results below.' });
  
      if (results.length === 0) {
        addLog({ status: 'success', message: 'No missing chapters found. Your library is complete!' });
      } else {
        results.forEach(result => {
            if (result.success) {
                addLog({ status: 'success', message: `Successfully regenerated: "${result.title}"`, storyId: result.storyId });
            } else {
                addLog({ status: 'error', message: `Failed to regenerate chapter for "${result.title}"`, error: result.error || 'Unknown error' });
            }
        });
        addLog({ status: 'success', message: `Regeneration process complete. Processed ${results.length} chapters.` });
      }
  
    } catch (error: any) {
      updateLog(initialLogId, { status: 'error', message: 'A critical error occurred during the regeneration process.', error: error.message });
      console.error(`Critical error in handleRegenerateMissing:`, error);
    } finally {
      setIsRegenerating(false);
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
    setAnalysisResult(null); // Clear old analysis
    setCleanupResult(null);

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

  return (
    <>
      <Alert variant="warning" className="mb-6">
        <AlertCircle className="h-4 w-4"/>
        <AlertTitle>Admin Section</AlertTitle>
        <AlertDescription>This area is for administrative purposes only. Changes made here directly affect the live database.</AlertDescription>
      </Alert>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-headline font-bold text-primary text-center">Admin Dashboard</h1>

        {(isGenerating || isRegenerating) && (
          <Alert variant="default" className="border-primary/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Operation in Progress</AlertTitle>
            <AlertDescription>
              {isGenerating && `Generating ${numStories} stories. This may take several minutes. Please do not navigate away. (${completed}/${numStories} completed)`}
              {isRegenerating && 'Regenerating missing chapters. This may take several minutes. Please do not navigate away.'}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl"><Book className="mr-2 h-5 w-5" /> Database Tools</CardTitle>
            <CardDescription>Analyze and maintain the story database.</CardDescription>
          </CardHeader>
          <Separator/>
          <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <Button onClick={handleAnalyzeDatabase} disabled={isToolRunning}>
                  {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Database'}
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={isToolRunning || !analysisResult || Object.keys(analysisResult.duplicateTitles).length === 0}
                      >
                        {isCleaningDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Cleanup Duplicates
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete duplicate stories from the database, keeping only the most recently published version of each. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isToolRunning}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCleanupDuplicates} disabled={isToolRunning} className="bg-destructive hover:bg-destructive/90">
                           {isCleaningDuplicates ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                           Yes, Cleanup Duplicates
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={isToolRunning} variant="outline">
                            {isPricing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}
                            {isPricing ? 'Updating...' : 'Standardize Prices'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Bulk Price Update</AlertDialogTitle>
                            <AlertDialogDescription>
                            This will overwrite the prices of all chapters listed in the pricing data file. This action is irreversible. Are you sure you want to proceed?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isToolRunning}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleStandardizePrices} disabled={isToolRunning}>
                                {isPricing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Yes, Update Prices
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleStandardizeGenres} disabled={isToolRunning} variant="outline">
                    {isCleaning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
                    {isCleaning ? 'Cleaning...' : 'Standardize Genres'}
                </Button>
                <Button onClick={handleRemoveTags} disabled={isToolRunning} variant="outline">
                    {isRemovingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Tags className="mr-2 h-4 w-4" />}
                    {isRemovingTags ? 'Removing...' : 'Remove Tags'}
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="secondary"
                        disabled={isToolRunning}
                      >
                        {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Regenerate Missing Chapters
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate Missing Chapters?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will scan for incomplete series and use AI to write new chapters to fill the gaps. This can take a long time and will create new documents in your database. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isToolRunning}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRegenerateMissing} disabled={isToolRunning} className="bg-secondary hover:bg-secondary/90">
                           {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                           Yes, Regenerate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>

              {cleanupResult && (
                <Alert variant={cleanupResult.success ? 'success' : 'destructive'} className="mt-4">
                  <AlertTitle>{cleanupResult.success ? 'Operation Complete' : 'Operation Failed'}</AlertTitle>
                  <AlertDescription>{cleanupResult.message}</AlertDescription>
                </Alert>
              )}
              
              {analysisError && (
                 <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Operation Failed</AlertTitle>
                    <AlertDescription>{analysisError}</AlertDescription>
                </Alert>
              )}

              {analysisResult && (
                <div className="mt-6 space-y-4">
                    <h2 className="text-2xl font-headline font-semibold text-primary">Database Analysis Complete</h2>
                    
                    <div className="space-y-6">
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
                                        description="Standalone stories + multi-chapter series."
                                    />
                                    <MetricCard 
                                        title="Total Chapters" 
                                        value={analysisResult.totalChapters.toLocaleString()} 
                                        icon={BookText}
                                        description="All individual story chapters combined."
                                    />
                                    <MetricCard 
                                        title="Total Words" 
                                        value={analysisResult.totalWordCount.toLocaleString()} 
                                        icon={FileText}
                                        description="Across all story content in the database."
                                    />
                                </div>
                                <Card>
                                  <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-border">
                                    <div className="p-2">
                                      <h4 className="font-semibold text-base flex items-center mb-2"><Layers className="mr-2 h-4 w-4 text-primary" />Story Types</h4>
                                      <div className="text-sm space-y-2">
                                        <p className="flex justify-between"><span>Standalone Stories:</span> <strong>{analysisResult.standaloneStories.toLocaleString()}</strong></p>
                                        <p className="flex justify-between"><span>Multi-Chapter Series:</span> <strong>{analysisResult.multiPartSeriesCount.toLocaleString()}</strong></p>
                                      </div>
                                    </div>
                                    <div className="p-2 pt-4 md:pt-2 md:pl-4">
                                      <h4 className="font-semibold text-base flex items-center mb-2"><Tags className="mr-2 h-4 w-4 text-primary" />Genre Breakdown</h4>
                                      <div className="text-sm space-y-1">
                                        {Object.entries(analysisResult.storiesPerGenre).length > 0 ? (
                                          Object.entries(analysisResult.storiesPerGenre).map(([genre, count]) => (
                                            <div key={genre} className="flex justify-between">
                                              <span>{capitalizeWords(genre)}:</span>
                                              <strong>{count.toLocaleString()}</strong>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-muted-foreground">No genre data.</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="p-2 pt-4 md:pt-2 md:pl-4 border-t md:border-t-0 md:border-l mt-4 md:mt-0">
                                       <h4 className="font-semibold text-base flex items-center mb-2"><PenSquare className="mr-2 h-4 w-4 text-primary" />Avg. Word Count</h4>
                                        <div className="text-sm space-y-2">
                                          <p className="flex justify-between"><span>Free Chapters:</span> <strong>{analysisResult.avgWordCountFree.toLocaleString()}</strong></p>
                                          <p className="flex justify-between"><span>Paid Chapters:</span> <strong>{analysisResult.avgWordCountPaid.toLocaleString()}</strong></p>
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
                                            <p className="flex justify-between"><span>Standalone:</span> <strong>{analysisResult.paidStandaloneStories.toLocaleString()}</strong></p>
                                            <p className="flex justify-between"><span>Series Chapters:</span> <strong>{analysisResult.paidSeriesChapters.toLocaleString()}</strong></p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <MetricCard 
                                    title="Total Library Value" 
                                    value={`${analysisResult.totalCoinCost.toLocaleString()} Coins`}
                                    icon={Coins}
                                    description={`~$${analysisResult.totalValueUSD.toFixed(2)} USD to unlock all paid content.`}
                                />
                                <MetricCard 
                                    title="Avg. Cost / Paid Chapter" 
                                    value={`${analysisResult.avgCoinCostPerPaidChapter.toLocaleString()} Coins`}
                                    icon={Coins}
                                    description={`~$${analysisResult.avgValuePerPaidChapterUSD.toFixed(2)} USD, based on the 50-coin premium price.`}
                                />
                            </CardContent>
                        </Card>
                         {Object.keys(analysisResult.duplicateTitles).length > 0 && (
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center text-destructive"><AlertCircle className="mr-2 h-5 w-5" />Duplicate Titles Found</CardTitle>
                                    <CardDescription>
                                        The following story titles have multiple entries in the database. You should clean these up. The "Cleanup Duplicates" button is now enabled.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-5 text-sm text-destructive">
                                        {Object.entries(analysisResult.duplicateTitles).map(([title, count]) => (
                                            <li key={title}>{title} ({count.toLocaleString()} entries)</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
              )}
           </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl"><BarChart3 className="mr-2 h-5 w-5" /> Chapter Analysis</CardTitle>
            <CardDescription>
              Generate a detailed list of all chapters for strategic re-pricing.
            </CardDescription>
          </CardHeader>
          <Separator/>
          <CardContent className="pt-6">
            <Button onClick={handleChapterAnalysis} disabled={isToolRunning} className="w-full">
                {isAnalyzingChapters ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {isAnalyzingChapters ? 'Analyzing Chapters...' : 'Run Chapter Analysis'}
            </Button>
            {chapterAnalysisData && (
                <div className="mt-6">
                    <ChapterAnalysisTable data={chapterAnalysisData} />
                </div>
            )}
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
            <CardTitle className="flex items-center text-xl"><Bot className="mr-2 h-5 w-5" /> Story Generator</CardTitle>
            <CardDescription>
              Generate new stories from the unused seeds in your library.
            </CardDescription>
          </CardHeader>
          <Separator/>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="num-stories">Number of Stories to Generate</Label>
              <Input
                id="num-stories"
                type="number"
                value={numStories}
                onChange={(e) => setNumStories(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="20"
                disabled={isToolRunning}
              />
            </div>
             <Button onClick={handleGenerate} disabled={isToolRunning || !user} className="w-full mt-4">
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

    