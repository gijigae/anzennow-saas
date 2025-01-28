'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkoutAction } from '@/lib/payments/actions';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type Price = {
  id: string;
  productId: string;
  unitAmount: number | null;
  currency: string;
  interval?: string;
  trialPeriodDays?: number | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  defaultPriceId?: string;
  features: string[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Subscribe Now
        </>
      )}
    </Button>
  );
}

function PriceCard({ price, product }: { price: Price; product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          ${price.unitAmount ? price.unitAmount / 100 : 0}
          <span className="text-sm font-normal text-gray-500">
            /{price.interval || 'month'}
          </span>
        </div>
        <ul className="mt-4 space-y-2">
          {product.features.map((feature: string) => (
            <li key={feature} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        <form action={checkoutAction} className="mt-6">
          <input type="hidden" name="priceId" value={price.id} />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

type PricingClientProps = {
  pricesWithProducts: {
    price: Price;
    product: Product;
  }[];
};

export function PricingClient({ pricesWithProducts }: PricingClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Pricing Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricesWithProducts.map(({ price, product }) => (
          <PriceCard key={price.id} price={price} product={product} />
        ))}
      </div>
    </div>
  );
} 