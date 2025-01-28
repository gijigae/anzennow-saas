import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { PricingClient } from './pricing-client';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const prices = await getStripePrices();
  const products = await getStripeProducts();

  const pricesWithProducts = prices.map(price => {
    const product = products.find(p => p.id === price.productId);
    return {
      price,
      product: product ? {
        ...product,
        features: [
          'Unlimited Usage',
          'Team Collaboration',
          'Email Support',
          'Security Features',
        ]
      } : {
        id: 'unknown',
        name: 'Unknown Plan',
        description: null,
        features: ['No features available']
      }
    };
  });

  return <PricingClient pricesWithProducts={pricesWithProducts} />;
}
