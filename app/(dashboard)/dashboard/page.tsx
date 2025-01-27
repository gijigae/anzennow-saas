import { redirect } from 'next/navigation';
import { Settings } from './settings';
import { getTeamForUser, getTeamWithMembers } from '@/lib/db/queries';
import { currentUser } from '@clerk/nextjs/server';
import { createTeam } from '@/app/(dashboard)/actions';

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }

  // First get the user's team ID
  const userTeam = await getTeamForUser(user.id);
  if (!userTeam) {
    // Create a default team for the user
    const team = await createTeam(`${user.firstName || user.username}'s Team`);
    if (!team) {
      throw new Error('Failed to create team');
    }
    // Redirect to refresh the page with the new team
    redirect('/dashboard');
  }

  // Then get the full team data with members
  const team = await getTeamWithMembers(userTeam.id);
  if (!team) {
    throw new Error('Team not found');
  }

  return <Settings team={team} />;
}
