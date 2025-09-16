'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { submitFeedback } from '../../../lib/actions/feedbackActions';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { type FeedbackInput } from '../../../ai/flows/submit-feedback-flow';

type FeedbackCategory = 'suggestion' | 'bugReport' | 'praise' | 'other';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [content, setContent] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const feedbackContent: FeedbackInput = {
        [category]: content
    };

    try {
      const result = await submitFeedback(feedbackContent);
      if (result.success) {
        setSubmitted(true);
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (e: any) {
      console.error('Feedback submission error:', e);
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto w-fit bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-2">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
          <CardTitle className="text-2xl text-primary">Thank You!</CardTitle>
          <CardDescription>
            Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">Share Your Feedback</CardTitle>
        <CardDescription>
          Your feedback is essential to improving FirstLook. Let us know what's on your mind!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Submission Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <form 
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="feedback-category">Feedback Category</Label>
            <Select
              name="category"
              value={category}
              onValueChange={(value: FeedbackCategory) => setCategory(value)}
            >
              <SelectTrigger id="feedback-category" className="w-full">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="bugReport">Bug Report</SelectItem>
                <SelectItem value="praise">Praise</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
            
          <div className="space-y-2">
            <Label htmlFor="feedback-content">Your Feedback</Label>
             <Textarea
                id="feedback-content"
                name="content"
                placeholder="Share your thoughts here..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />
          </div>
          
          <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting || !content}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="mr-2 h-5 w-5" /> Submit Feedback</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
