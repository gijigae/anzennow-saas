'use client';

import { useUser as useClerkUser } from '@clerk/nextjs';

export type User = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  emailAddress: string;
};

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();

  if (!isLoaded) {
    return {
      user: null,
      isLoaded: false,
      isSignedIn: false,
    };
  }

  if (!isSignedIn || !user) {
    return {
      user: null,
      isLoaded: true,
      isSignedIn: false,
    };
  }

  const formattedUser: User = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    imageUrl: user.imageUrl,
    emailAddress: user.primaryEmailAddress?.emailAddress || '',
  };

  return {
    user: formattedUser,
    isLoaded: true,
    isSignedIn: true,
  };
}
