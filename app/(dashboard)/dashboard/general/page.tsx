'use client';

import { startTransition, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { updateAccount } from '@/app/(auth)/actions';

type ActionState = {
  error?: string;
  success?: string;
};

export default function GeneralPage() {
  const { user } = useUser();
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    { error: '', success: '' }
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      formAction(new FormData(event.currentTarget));
    });
  };

  if (!user) {
    return null;
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        General Settings
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                defaultValue={user.fullName || ''}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                defaultValue={user.primaryEmailAddress?.emailAddress || ''}
                required
              />
            </div>
            {state.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-500 text-sm">{state.success}</p>
            )}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
