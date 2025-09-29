'use client';

import { ProfileCreationForm } from '@/features/auth/components/forms/ProfileCreationForm';
import { useRouter } from 'next/navigation';

export default function CreateProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <ProfileCreationForm
          onSuccess={(profile) => {
            console.log('Profile created successfully:', profile);
            router.push('/dashboard');
          }}
          onError={(error) => {
            console.error('Error creating profile:', error);
          }}
        />
      </div>
    </div>
  );
}