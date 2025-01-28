'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ExternalLink } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const { openUserProfile, signOut } = useClerk();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmed) {
      try {
        await signOut();
        router.push('/');
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">
        Security Settings
      </h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Manage your security settings, including password, two-factor authentication, 
            and other security features through your Clerk profile.
          </p>
          <Button
            onClick={() => openUserProfile()}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Shield className="mr-2 h-4 w-4" />
            Manage Security Settings
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Deleting your account will permanently remove all your data from our system. 
            This action cannot be undone.
          </p>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
