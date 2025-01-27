'use server';

import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  teams,
  teamMembers,
  activityLogs,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations,
} from '@/lib/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { validatedAction, ActionState } from '@/lib/auth/middleware';

async function logActivity(
  teamId: number | null | undefined,
  userId: string,
  type: ActivityType,
  ipAddress?: string,
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || '',
  };
  await db.insert(activityLogs).values(newActivity);
}

// Helper function to get user's team
export async function getUserTeam(userId: string) {
  const result = await db
    .select({
      teamId: teamMembers.teamId,
      team: teams,
    })
    .from(teamMembers)
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  return result[0];
}

export async function createTeam(name: string) {
  const user = await currentUser();
  if (!user?.id) throw new Error('Not authenticated');

  // Check if user already has a team
  const existingTeam = await getUserTeam(user.id);
  if (existingTeam) {
    throw new Error('User already has a team');
  }

  const newTeam: NewTeam = { 
    name,
    planName: 'free',
    subscriptionStatus: 'active'
  };
  const [createdTeam] = await db.insert(teams).values(newTeam).returning();

  if (!createdTeam) {
    throw new Error('Failed to create team');
  }

  const newTeamMember: NewTeamMember = {
    userId: user.id,
    teamId: createdTeam.id,
    role: 'owner',
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(createdTeam.id, user.id, ActivityType.CREATE_TEAM),
  ]);

  return createdTeam;
}

const removeTeamMemberSchema = z.object({
  memberId: z.number(),
});

export const removeTeamMember = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    const result = removeTeamMemberSchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { memberId } = result.data;
    const userTeam = await getUserTeam(user.id);

    if (!userTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userTeam.teamId),
        ),
      );

    await logActivity(
      userTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER,
    );

    return { success: 'Team member removed successfully' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to remove member',
    };
  }
};

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner']),
});

export const inviteTeamMember = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    const result = inviteTeamMemberSchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { email, role } = result.data;
    const userTeam = await getUserTeam(user.id);

    if (!userTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, userTeam.teamId))
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userTeam.teamId),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending',
    });

    await logActivity(
      userTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER,
    );

    // TODO: Send invitation email with Clerk-specific sign-up URL
    // const signUpUrl = `${process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}?invitation_token=${invitationToken}`;
    // await sendInvitationEmail(email, userTeam.team.name, role, signUpUrl);

    return { success: 'Invitation sent successfully' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to send invitation',
    };
  }
}; 
