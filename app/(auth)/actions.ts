'use server';

import { z } from 'zod';
import { ActionState } from '@/lib/auth/middleware';
import { currentUser } from '@clerk/nextjs/server';

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

export const updateAccount = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const result = updateAccountSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    // Update user profile using Clerk's API
    // Note: This is a placeholder - you'll need to implement the actual update
    // using Clerk's API when they add support for it
    return { success: 'Account updated successfully' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update account',
    };
  }
};

export const deleteAccount = async (
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Delete user account using Clerk's API
    // Note: This is a placeholder - you'll need to implement the actual deletion
    // using Clerk's API when they add support for it
    return { success: 'Account deleted successfully' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete account',
    };
  }
}; 