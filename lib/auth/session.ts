import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { User } from './index';

/**
 * Gets the current authenticated user's session
 * @returns The user object or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    imageUrl: user.imageUrl,
    emailAddress: user.primaryEmailAddress?.emailAddress || '',
  };
}

/**
 * Ensures the user is authenticated, redirects to sign-in if not
 * @returns The authenticated user
 */
export async function requireAuth(): Promise<User> {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    imageUrl: user.imageUrl,
    emailAddress: user.primaryEmailAddress?.emailAddress || '',
  };
}

/**
 * Checks if the user is authenticated
 * @returns boolean indicating if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session.userId;
} 
