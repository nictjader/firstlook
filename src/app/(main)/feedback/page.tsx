
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    // To get this, open your Google Form, click "Send", go to the link tab, and get the link.
    // Then, open the live form, inspect the <form> element, and copy its `action` attribute.
    const googleFormActionUrl = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/formResponse';
    
    // This is a placeholder. You must replace it or the form will not work.
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
        mode: 'no-cors', // Important: 'no-cors' is required for this to work without errors.
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
          Have a suggestion, a bug report, or a feature request? We'd love to hear from you!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 
          This form submits data to a Google Form. You need to configure two things:
          1. The `action` URL in the handleSubmit function above.
          2. The `name` attribute for each input/textarea below.
          
          To get the `name` attributes:
          - Open your live Google Form.
          - Right-click on an input field and select "Inspect".
          - Find the `name` attribute of the <input> element (e.g., `entry.123456789`).
          - Copy that and use it for the corresponding field below.
        */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Type of Feedback</Label>
            <select
              id="feedback-type"
              name="entry.YOUR_FEEDBACK_TYPE_ID" // <-- REPLACE THIS
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Suggestion">Suggestion</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Praise">Praise</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Your Message</Label>
            <Textarea
              id="feedback-message"
              name="entry.YOUR_MESSAGE_ID" // <-- REPLACE THIS
              placeholder="Tell us what's on your mind..."
              required
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-email">Your Email (Optional)</Label>
            <Input
              id="feedback-email"
              name="entry.YOUR_EMAIL_ID" // <-- REPLACE THIS
              type="email"
              placeholder="you@example.com"
            />
             <p className="text-xs text-muted-foreground">
              Provide your email if you'd like us to be able to contact you about your feedback.
            </p>
          </div>
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
