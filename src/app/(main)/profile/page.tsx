
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Loader2 } from 'lucide-react';
import ProfileView from '../../../components/profile/profile-view';

export const metadata: Metadata = {
  title: 'My Profile - FirstLook',
  description: 'Manage your FirstLook account, view your reading history, and check your coin balance.',
};

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-headline font-bold mb-8 text-primary">My Profile</h1>
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <ProfileView />
      </Suspense>
    </div>
  );
}
