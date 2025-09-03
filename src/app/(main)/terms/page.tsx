import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import CurrentDateDisplay from '@/components/layout/current-date-display';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms of Service - FirstLook',
  description: 'Read the Terms of Service for FirstLook.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Last updated: <CurrentDateDisplay /></p>

          <h2>1. Introduction</h2>
          <p>Welcome to FirstLook ("App", "Service"), a mobile web application dedicated to romance novels. These Terms of Service ("Terms") govern your use of FirstLook. By accessing or using our Service, you agree to be bound by these Terms.</p>

          <h2>2. User Accounts</h2>
          <p>To use certain features of FirstLook, you may need to create an account. You are responsible for safeguarding your account and for any activities or actions under your account. You agree to provide accurate and complete information when creating your account.</p>
          
          <h2>3. Content</h2>
          <p>FirstLook provides access to original romance stories. Some content is free, while other content ("Premium Content") requires purchase using virtual coins.</p>
          <p>All content provided on FirstLook is for your personal, non-commercial use only. You may not reproduce, distribute, modify, or create derivative works from any content without explicit permission.</p>

          <h2>4. Virtual Coins</h2>
          <p>Virtual coins can be purchased through the App and used to unlock Premium Content. Coin purchases are processed via Stripe. Coins have no monetary value outside of the FirstLook App and are non-refundable except as required by law.</p>

          <h2>5. Intellectual Property</h2>
          <p>The Service and its original content (excluding content provided by users, if applicable in the future), features, and functionality are and will remain the exclusive property of FirstLook and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of FirstLook.</p>
          
          <h2>6. Termination</h2>
          <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not in any way limited to a breach of the Terms.</p>

          <h2>7. Limitation of Liability</h2>
          <p>In no event shall FirstLook, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          
          <h2>8. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

          <h2>9. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

          <h2>10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at <a href="mailto:contact@tryfirstlook.com" className="underline hover:text-primary">contact@tryfirstlook.com</a>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
