'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { ActionState } from '@/lib/auth/middleware';
import { currentUser } from '@clerk/nextjs/server';
import { getUserTeam } from '@/app/(dashboard)/actions';

export const checkoutAction = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return { error: 'Not authenticated' };
    }

    const userTeam = await getUserTeam(user.id);
    if (!userTeam?.team) {
      return { error: 'Team not found' };
    }

    const priceId = formData.get('priceId');
    if (!priceId || typeof priceId !== 'string') {
      return { error: 'Invalid price ID' };
    }

    await createCheckoutSession({ team: userTeam.team, priceId });
    return { success: 'Redirecting to checkout...' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
};

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
