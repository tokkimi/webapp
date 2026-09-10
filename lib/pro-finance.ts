export const CATEGORIES = {
  income: ['Consultations', 'Actes et soins', 'Prestations', 'Vente de produits', 'Formation', 'Autres recettes'],
  expense: ['Loyer et charges', 'Matériel et équipement', 'Consommables', 'Laboratoire et prothèses', 'Logiciels et abonnements', 'Assurances', 'Honoraires', 'Déplacements', 'Formation', 'Communication', 'Cotisations et taxes', 'Autres dépenses'],
} as const
export const PROFESSIONS = ['Médecin généraliste', 'Médecin spécialiste', 'Chirurgien-dentiste', 'Psychologue', 'Psychothérapeute', 'Psychiatre', 'Masseur-kinésithérapeute', 'Ostéopathe', 'Infirmier / Infirmière', 'Sage-femme', 'Orthophoniste', 'Ergothérapeute', 'Psychomotricien', 'Pédicure-podologue', 'Diététicien', 'Opticien', 'Coach', 'Praticien bien-être', 'Travailleur social', 'Autre profession']
export type FinanceEntry = {
  id: string; pro_id: string; kind: 'income' | 'expense'; label: string; category: string;
  amount_cents: number; tax_rate_bps: number; occurred_on: string; paid_on: string | null;
  status: 'paid' | 'pending' | 'cancelled'; payment_method: string; reference: string;
  notes: string; receipt_path: string | null; receipt_name: string | null; updated_at: string;
}
export type EntryInput = Omit<FinanceEntry, 'id' | 'pro_id' | 'updated_at'>
export const PAYMENT_METHODS = ['Carte bancaire', 'Virement', 'Espèces', 'Chèque', 'Prélèvement', 'Autre']
export function dateIsValid(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value + 'T12:00:00Z')
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}
export function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function parseAmount(value: string): number {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(normalized)) throw new Error('Saisissez un montant positif avec deux décimales maximum.')
  const [euros, cents = ''] = normalized.split('.')
  const result = Number(euros) * 100 + Number(cents.padEnd(2, '0'))
  if (result <= 0 || result > 999999999) throw new Error('Le montant doit être compris entre 0,01 et 9 999 999,99 €.')
  return result
}
export function validateEntry(body: any, owner: string): EntryInput {
  if (!body || !['income', 'expense'].includes(body.kind)) throw new Error('Type d’opération invalide.')
  if (typeof body.label !== 'string' || !body.label.trim() || body.label.length > 180) throw new Error('Le libellé est obligatoire (180 caractères maximum).')
  if (!(CATEGORIES[body.kind as keyof typeof CATEGORIES] as readonly string[]).includes(body.category)) throw new Error('Catégorie invalide.')
  if (!Number.isSafeInteger(body.amount_cents) || body.amount_cents <= 0 || body.amount_cents > 999999999) throw new Error('Montant invalide.')
  if (!Number.isInteger(body.tax_rate_bps) || body.tax_rate_bps < 0 || body.tax_rate_bps > 10000) throw new Error('Taux de TVA invalide.')
  if (!dateIsValid(body.occurred_on) || !['paid', 'pending', 'cancelled'].includes(body.status)) throw new Error('Date ou statut invalide.')
  if (body.status === 'paid' && (!dateIsValid(body.paid_on) || body.paid_on > localDate())) throw new Error('Indiquez une date de règlement valide, non future.')
  if (!PAYMENT_METHODS.includes(body.payment_method)) throw new Error('Mode de paiement invalide.')
  for (const [key, max] of [['reference', 120], ['notes', 2000], ['receipt_name', 240]] as const) {
    if (body[key] != null && (typeof body[key] !== 'string' || body[key].length > max)) throw new Error('Champ trop long ou invalide.')
  }
  if (body.receipt_path != null && (typeof body.receipt_path !== 'string' || !new RegExp(`^${owner}/[a-f0-9-]+\\.(pdf|jpg|jpeg|png|webp)$`).test(body.receipt_path))) throw new Error('Justificatif invalide.')
  return { kind: body.kind, label: body.label.trim(), category: body.category, amount_cents: body.amount_cents, tax_rate_bps: body.tax_rate_bps, occurred_on: body.occurred_on, status: body.status, paid_on: body.status === 'paid' ? body.paid_on : null, payment_method: body.payment_method, reference: body.reference?.trim() || '', notes: body.notes?.trim() || '', receipt_path: body.receipt_path || null, receipt_name: body.receipt_name || null }
}
export const money = (cents: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
export function netCents(entry: Pick<FinanceEntry, 'amount_cents' | 'tax_rate_bps'>) {
  return Math.round(entry.amount_cents * 10000 / (10000 + entry.tax_rate_bps))
}
export function summarize(entries: FinanceEntry[]) {
  let income = 0, expenses = 0, receivable = 0, payable = 0, incomeTax = 0, expenseTax = 0
  for (const entry of entries) {
    if (entry.status === 'cancelled') continue
    if (entry.status === 'pending') {
      if (entry.kind === 'income') receivable += entry.amount_cents
      else payable += entry.amount_cents
    } else if (entry.kind === 'income') { income += entry.amount_cents; incomeTax += entry.amount_cents - netCents(entry) }
    else { expenses += entry.amount_cents; expenseTax += entry.amount_cents - netCents(entry) }
  }
  return { income, expenses, balance: income - expenses, receivable, payable, incomeTax, expenseTax }
}
export function csvCell(value: unknown): string {
  let text = String(value ?? '')
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text
  return '"' + text.replace(/"/g, '""') + '"'
}
export function financeCsv(entries: FinanceEntry[]) {
  const rows: unknown[][] = [['Date pièce', 'Date règlement', 'Type', 'Libellé', 'Catégorie', 'TTC (EUR)', 'HT (EUR)', 'TVA indiquée (EUR)', 'Taux TVA (%)', 'Statut', 'Paiement', 'Référence', 'Justificatif', 'Notes']]
  for (const e of entries) rows.push([e.occurred_on, e.paid_on, e.kind === 'income' ? 'Recette' : 'Dépense', e.label, e.category, (e.amount_cents / 100).toFixed(2).replace('.', ','), (netCents(e) / 100).toFixed(2).replace('.', ','), ((e.amount_cents - netCents(e)) / 100).toFixed(2).replace('.', ','), e.tax_rate_bps / 100, { paid: 'Réglé', pending: 'En attente', cancelled: 'Annulé' }[e.status], e.payment_method, e.reference, e.receipt_name, e.notes])
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')
}
