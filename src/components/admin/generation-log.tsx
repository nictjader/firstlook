
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Loader2, Bot, AlertCircle, CheckCircle, ArrowRight, BookText } from 'lucide-react';

export type Log = {
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

export default function GenerationLog({ logs }: { logs: Log[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl"><BookText className="mr-2 h-5 w-5" /> Generation Log</CardTitle>
        <CardDescription>A real-time log of the story generation process.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6 space-y-4">
          {logs.map((log) => (
              <Card key={log.id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
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
                </CardContent>
              </Card>
          ))}
      </CardContent>
    </Card>
  );
}
