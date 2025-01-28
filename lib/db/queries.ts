import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams } from './schema';
import { currentUser } from '@clerk/nextjs/server';
import { TeamDataWithMembers } from './schema';

export async function getTeamForUser(userId: string) {
  const result = await db
    .select({
      team: teams,
      teamMember: teamMembers,
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  return result[0]?.team;
}

export async function getTeamWithMembers(teamId: number): Promise<TeamDataWithMembers | null> {
  const result = await db
    .select({
      team: teams,
      teamMembers: teamMembers,
    })
    .from(teams)
    .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teams.id, teamId));

  if (result.length === 0) return null;

  const team = result[0].team;
  const members = result
    .map((r) => r.teamMembers)
    .filter((member): member is typeof member & { userId: string } => member !== null);

  return {
    ...team,
    teamMembers: members,
  };
}

export async function getActivityLogs(userId: string) {
  const userTeam = await getTeamForUser(userId);
  if (!userTeam) return [];

  return db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.teamId, userTeam.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(50);
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result[0] || null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  },
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}
