'use client';

import ProfileView from '@/components/profile/profile-view';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering because ProfileView uses useSearchParams
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-headline font-bold mb-8 text-primary">My Profile</h1>
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <ProfileView />
      </Suspense>
    </div>
  );
}
