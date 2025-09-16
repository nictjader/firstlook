'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
import { submitFeedback } from '../../../lib/actions/feedbackActions';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    const suggestion = formData.get('suggestion') as string;
    const bugReport = formData.get('bug') as string;
    const praise = formData.get('praise') as string;
    const other = formData.get('other') as string;

    const feedbackContent = {
        suggestion,
        bugReport,
        praise,
        other,
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
          We'd love to hear from you! Your feedback is essential in helping us improve FirstLook. Please share any thoughts, suggestions, bug reports, or praise you might have. Thank you for helping us make the app better for everyone.
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
            <Accordion type="single" collapsible className="w-full" defaultValue="suggestion">
              <AccordionItem value="suggestion">
                <AccordionTrigger className="text-lg font-semibold">Suggestion</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="suggestion"
                    placeholder="Have an idea to improve the app? Let us know!"
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="bug">
                <AccordionTrigger className="text-lg font-semibold">Bug Report</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="bug"
                    placeholder="Something not working right? Please describe the issue."
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="praise">
                <AccordionTrigger className="text-lg font-semibold">Praise</AccordionTrigger>
                <AccordionContent>
                  <Textarea
                    name="praise"
                    placeholder="Enjoying the app? We'd love to hear what you like!"
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="other">
                <AccordionTrigger className="text-lg font-semibold">Other</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="other"
                    placeholder="Have some other feedback? Share it here."
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          
          <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
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
