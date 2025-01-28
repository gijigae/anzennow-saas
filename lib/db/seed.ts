import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { teams, teamMembers } from './schema';
import { createClerkClient } from '@clerk/clerk-sdk-node';

// Initialize Clerk
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 14,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 14,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function createTestUser() {
  console.log('Creating test user in Clerk...');
  
  const user = await clerk.users.createUser({
    emailAddress: ['test@test.com'],
    password: 'admin123',
    firstName: 'Test',
    lastName: 'User',
  });

  console.log('Test user created in Clerk:', user.id);
  return user;
}

async function seed() {
  // Create test user in Clerk
  const user = await createTestUser();

  console.log('Creating team...');
  // Create team
  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning();

  console.log('Linking user to team...');
  // Link Clerk user to team
  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  console.log('Creating Stripe products...');
  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seed process finished. Cleaning up...');
    // Optional: Clean up test users in development
    if (process.env.NODE_ENV === 'development') {
      const { data: users } = await clerk.users.getUserList();
      for (const user of users) {
        if (user.emailAddresses[0]?.emailAddress === 'test@test.com') {
          await clerk.users.deleteUser(user.id);
        }
      }
    }
    process.exit(0);
  });
