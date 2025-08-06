
import { Metadata } from 'next';
import FeedbackForm from '@/components/feedback/feedback-form';

export const metadata: Metadata = {
  title: 'Submit Feedback - FirstLook',
  description: 'Have a suggestion or found a bug? Let us know!',
};

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary mb-2">
          Share Your Feedback
        </h1>
        <p className="text-muted-foreground">
          We'd love to hear your thoughts! Suggestions, bug reports, and feature requests are all welcome.
        </p>
      </div>
      <FeedbackForm />
    </div>
  );
}
