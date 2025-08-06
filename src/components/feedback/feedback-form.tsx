
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveFeedbackAction } from '@/lib/actions/feedbackActions';
import { Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FeedbackForm() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim().length < 10) {
      toast({
        variant: 'destructive',
        title: 'Feedback is too short',
        description: 'Please provide at least 10 characters of feedback.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveFeedbackAction(feedback, user?.uid);
      if (result.success) {
        toast({
          variant: 'success',
          title: 'Feedback Submitted!',
          description: "Thank you for helping us improve FirstLook.",
        });
        setFeedback('');
        router.push('/');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An unknown error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Tell us what you think..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={6}
            maxLength={2000}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center">
             <p className="text-xs text-muted-foreground">
                {feedback.length} / 2000
             </p>
            <Button type="submit" disabled={isSubmitting || feedback.trim().length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
