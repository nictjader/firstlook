
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // IMPORTANT: Replace this with your Google Form's action URL.
    const googleFormActionUrl = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/formResponse';
    
    if (googleFormActionUrl.includes('YOUR_FORM_ID_HERE')) {
        toast({
            variant: 'destructive',
            title: 'Setup Required',
            description: 'The form is not yet configured. Please update the action URL in the code.',
        });
        setIsSubmitting(false);
        return;
    }

    try {
      await fetch(googleFormActionUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors', 
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Something went wrong. Please try again later.',
      });
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
        {/* 
          This form submits data to a Google Form. You need to configure two things:
          1. The `action` URL in the handleSubmit function above.
          2. The `name` attribute for each textarea below.
          
          To get the `name` attributes:
          - Open your live Google Form.
          - Right-click on an input field and select "Inspect".
          - Find the `name` attribute of the <input> or <textarea> element (e.g., `entry.123456789`).
          - Copy that and use it for the corresponding field below.
        */}
        <form onSubmit={handleSubmit} className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="suggestion">
                <AccordionTrigger className="text-lg font-semibold">Suggestion</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="entry.YOUR_SUGGESTION_ID" // <-- REPLACE THIS
                    placeholder="Have an idea to improve the app? Let us know!"
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="bug">
                <AccordionTrigger className="text-lg font-semibold">Bug Report</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="entry.YOUR_BUG_REPORT_ID" // <-- REPLACE THIS
                    placeholder="Something not working right? Please describe the issue."
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="praise">
                <AccordionTrigger className="text-lg font-semibold">Praise</AccordionTrigger>
                <AccordionContent>
                  <Textarea
                    name="entry.YOUR_PRAISE_ID" // <-- REPLACE THIS
                    placeholder="Enjoying the app? We'd love to hear what you like!"
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="other">
                <AccordionTrigger className="text-lg font-semibold">Other</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="entry.YOUR_OTHER_ID" // <-- REPLACE THIS
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
