'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers } from '@/lib/db/schema';
import { removeTeamMember } from '@/app/(dashboard)/actions';
import { InviteTeamMember } from './invite-team';
import { useUser } from '@clerk/nextjs';

type ActionState = {
  error?: string;
  success?: string;
};

type SettingsProps = {
  team: TeamDataWithMembers;
};

export function Settings({ team }: SettingsProps) {
  const { user } = useUser();
  const [removeState, removeAction] = useActionState<ActionState, FormData>(
    removeTeamMember,
    { error: '', success: '' },
  );
  const [portalState, portalAction] = useActionState<ActionState, FormData>(
    customerPortalAction,
    { error: '', success: '' },
  );

  if (!user) {
    return null;
  }

  // Handle portal URL if available
  if (portalState?.success) {
    window.location.href = portalState.success;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              {team.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{member.userId}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                  {member.userId !== user.id && (
                    <form action={removeAction}>
                      <input
                        type="hidden"
                        name="memberId"
                        value={member.id}
                      />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
            {removeState?.error && (
              <p className="text-red-500">{removeState.error}</p>
            )}
            {removeState?.success && (
              <p className="text-green-500">{removeState.success}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <InviteTeamMember />

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={portalAction}>
            <Button type="submit" className="bg-black hover:bg-gray-800">
              Manage Subscription
            </Button>
          </form>
          {portalState?.error && (
            <p className="mt-2 text-red-500">{portalState.error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
