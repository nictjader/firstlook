import ProfileView from '@/components/profile/profile-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile - Siren',
  description: 'Manage your Siren account, coin balance, and preferences.',
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-headline font-bold mb-8 text-primary">My Profile</h1>
      <ProfileView />
    </div>
  );
}
