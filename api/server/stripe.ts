import * as stripe from 'stripe';

// TODO: below is code from builderbook repo (single payments)
// TODO: add recurring subscription code here instead

export function charge({ amount, token, buyerEmail }) {
  const dev = process.env.NODE_ENV !== 'production';

  const API_KEY = dev ? process.env.Stripe_Test_SecretKey : process.env.Stripe_Live_SecretKey;
  const client = new stripe(API_KEY);

  return client.charges.create({
    amount,
    currency: 'usd',
    source: token,
    receipt_email: buyerEmail,
    description: 'Payment for the book at builderbook.org',
  });
}
