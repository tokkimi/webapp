// Test accounts with full Elite access — no Stripe needed
export const TEST_EMAILS = ['goocciland@gmail.com']

export const TEST_SUBSCRIPTION = {
  plan_id: 'elite',
  status: 'active',
  current_period_end: '2099-12-31T00:00:00.000Z',
}

export function isTestAccount(email: string | undefined): boolean {
  return !!email && TEST_EMAILS.includes(email.toLowerCase())
}
