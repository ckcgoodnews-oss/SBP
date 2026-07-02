export const integrationProviders = [
  'stripe',
  'square',
  'twilio',
  'sendgrid',
  'quickbooks'
] as const;

export type IntegrationProvider = typeof integrationProviders[number];

export function isPaymentProvider(provider: IntegrationProvider): boolean {
  return provider === 'stripe' || provider === 'square';
}

export function isNotificationProvider(provider: IntegrationProvider): boolean {
  return provider === 'twilio' || provider === 'sendgrid';
}

export function isAccountingProvider(provider: IntegrationProvider): boolean {
  return provider === 'quickbooks';
}
