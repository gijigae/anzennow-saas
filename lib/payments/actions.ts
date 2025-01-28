'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { ActionState } from '@/lib/auth/middleware';
import { currentUser } from '@clerk/nextjs/server';
import { getUserTeam } from '@/app/(dashboard)/actions';

export async function checkoutAction(formData: FormData) {
  const user = await currentUser();
  if (!user?.id) {
    redirect('/login');
  }

  const userTeam = await getUserTeam(user.id);
  if (!userTeam?.team) {
    redirect('/signup');
  }

  const priceId = formData.get('priceId');
  if (!priceId || typeof priceId !== 'string') {
    redirect('/pricing');
  }

  await createCheckoutSession({ team: userTeam.team, priceId });
}

export async function customerPortalAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await currentUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const userTeamData = await getUserTeam(user.id);
  if (!userTeamData?.team) {
    return { error: 'Team not found' };
  }

  try {
    const portalSession = await createCustomerPortalSession(userTeamData.team);
    return { success: portalSession.url };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return { error: 'Failed to create customer portal session' };
  }
}
