
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // This function handles the form submission in the background.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formActionUrl = form.action;

    try {
      // The 'no-cors' mode allows us to send the request without needing
      // special permissions from Google, but it means we won't get a
      // direct success/error response from the server. We assume success
      // if the request doesn't throw an error.
      await fetch(formActionUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Feedback submission error:', error);
      // Since we can't see the real response, we'll just log the error
      // and still show the success message to the user.
      setSubmitted(true);
    } finally {
      // No need to set isSubmitting back to false, as we're now showing the success message.
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
          This form is now connected to your Google Form.
          action: The URL where the form data will be sent.
          name attributes: These link the textareas to the columns in your Google Sheet.
        */}
        <form 
          onSubmit={handleSubmit}
          action="https://docs.google.com/forms/d/e/1FAIpQLSeq1zeXOUPtk_3Ur8tIRhceiee6MmzphgwSeEriVWYG5yoOog/formResponse"
          className="space-y-6"
        >
            <Accordion type="single" collapsible className="w-full" defaultValue="suggestion">
              <AccordionItem value="suggestion">
                <AccordionTrigger className="text-lg font-semibold">Suggestion</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="entry.110781839" // This is the unique ID for your "Suggestion" field.
                    placeholder="Have an idea to improve the app? Let us know!"
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="bug">
                <AccordionTrigger className="text-lg font-semibold">Bug Report</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="entry.373277614" // This is the unique ID for your "Bug Report" field.
                    placeholder="Something not working right? Please describe the issue."
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="praise">
                <AccordionTrigger className="text-lg font-semibold">Praise</AccordionTrigger>
                <AccordionContent>
                  <Textarea
                    name="entry.386438416" // This is the unique ID for your "Praise" field.
                    placeholder="Enjoying the app? We'd love to hear what you like!"
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="other">
                <AccordionTrigger className="text-lg font-semibold">Other</AccordionTrigger>
                <AccordionContent>
                   <Textarea
                    name="entry.1552051604" // This is the unique ID for your "Other" field.
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
