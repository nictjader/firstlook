
import type { Metadata } from 'next';
import CurrentDateDisplay from '@/components/layout/current-date-display';

export const metadata: Metadata = {
  title: 'Privacy Policy - Siren',
  description: 'Read the Privacy Policy for Siren.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-3xl font-headline font-semibold leading-none tracking-tight text-primary">Privacy Policy</h3>
        </div>
        <div className="p-6 pt-0 prose dark:prose-invert max-w-none">
          <p>Last updated: <CurrentDateDisplay /></p>

          <h2>1. Introduction</h2>
          <p>Siren (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile web application Siren (the &quot;Service&quot;). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Service.</p>

          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
          <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your email address, and name (if provided via Google Sign-In), that you voluntarily give to us when you register with the Service.</li>
            <li><strong>User Profile Data:</strong> Information related to your user profile, such as coin balance, unlocked stories, and reading preferences (e.g., selected subgenres).</li>
            <li><strong>Usage Data:</strong> Information automatically collected when you access and use the Service, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Service. Firebase Analytics may be used to collect this data.</li>
            <li><strong>Financial Data:</strong> We use Stripe for payment processing. We do not store your full payment card details. Stripe handles this information securely.</li>
          </ul>

          <h2>3. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Process your transactions for coin purchases.</li>
            <li>Enable access to free and premium story content.</li>
            <li>Personalize your user experience (e.g., based on subgenre preferences).</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
            <li>Notify you of updates to the Service.</li>
            <li>Respond to your comments and inquiries.</li>
          </ul>

          <h2>4. Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          <ul>
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (Stripe), data analysis (Firebase Analytics), email delivery, hosting services, and customer service.</li>
          </ul>

          <h2>5. Security of Your Information</h2>
          <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

          <h2>6. Your Data Rights (GDPR/CCPA)</h2>
          <p>Depending on your location, you may have certain rights regarding your personal data, including:</p>
          <ul>
            <li>The right to access – You have the right to request copies of your personal data.</li>
            <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
            <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
            <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>
          <p>To exercise these rights, please contact us. We will respond to your request within a reasonable timeframe.</p>

          <h2>7. Policy for Children</h2>
          <p>We do not knowingly solicit information from or market to children under the age of 13 (or 16 in certain jurisdictions). If you become aware of any data we have collected from children, please contact us using the contact information provided below.</p>
          
          <h2>8. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.</p>

          <h2>9. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:contact@siren.app" className="underline hover:text-primary">contact@siren.app</a>.</p>
        </div>
      </div>
    </div>
  );
}
