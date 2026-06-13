export const TEST_EMAILS = [
  'goocciland@gmail.com',
  'test-ado@capsule.app',
  'test-parent@capsule.app',
  'test-pro@capsule.app',
]

export const TEST_SUBSCRIPTION = {
  plan_id: 'famille_plus',
  status: 'active',
  current_period_end: '2099-12-31T00:00:00.000Z',
}

export function isTestAccount(email: string | undefined): boolean {
  return !!email && TEST_EMAILS.includes(email.toLowerCase())
}
