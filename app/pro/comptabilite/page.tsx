'use client'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { usePro, ProIcon } from '@/components/pro/ProWorkspace'
import { CATEGORIES, PAYMENT_METHODS, FinanceEntry, financeCsv, localDate, money, parseAmount, summarize } from '@/lib/pro-finance'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const statusLabels = { paid: 'Réglé', pending: 'En attente', cancelled: 'Annulé' }
type Form = { id: string; kind: 'income' | 'expense'; label: string; category: string; amount: string; tax: string; occurred_on: string; paid_on: string; status: 'paid' | 'pending' | 'cancelled'; payment_method: string; reference: string; notes: string; receipt_path: string | null; receipt_name: string | null; updated_at?: string }
function blank(kind: 'income' | 'expense'): Form { return { id: crypto.randomUUID(), kind, label: '', category: CATEGORIES[kind][0], amount: '', tax: '0', occurred_on: localDate(), paid_on: localDate(), status: 'paid', payment_method: 'Virement', reference: '', notes: '', receipt_path: null, receipt_name: null } }
export default function FinancePage() {
  const { request, profile, practice } = usePro(), now = new Date()
  const [from, setFrom] = useState(`${now.getFullYear()}-01-01`), [to, setTo] = useState(localDate())
  const [entries, setEntries] = useState<FinanceEntry[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [tab, setTab] = useState('all'), [search, setSearch] = useState(''), [status, setStatus] = useState('all')
  const [form, setForm] = useState<Form | null>(null), [file, setFile] = useState<File | null>(null), [saving, setSaving] = useState(false), [formError, setFormError] = useState(''), [exporting, setExporting] = useState(false)
  const version = useRef(0), dialog = useRef<HTMLDivElement>(null)
  const load = useCallback(async () => {
    const current = ++version.current; setLoading(true); setError('')
    try { const r = await request(`/api/pro/finance?from=${from}&to=${to}`); if (current === version.current) setEntries(r.entries) }
    catch (e) { if (current === version.current) { setEntries([]); setError(e instanceof Error ? e.message : 'Chargement impossible.') } }
    finally { if (current === version.current) setLoading(false) }
  }, [request, from, to])
  useEffect(() => { load(); return () => { version.current++ } }, [load])
  useEffect(() => { const kind = new URLSearchParams(window.location.search).get('new'); if (kind === 'income' || kind === 'expense') setForm(blank(kind)) }, [])
  useEffect(() => {
    if (!form) return
    const previous = document.activeElement as HTMLElement | null; dialog.current?.focus()
    function keyboard(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) setForm(null)
      if (e.key !== 'Tab') return
      const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, textarea, [href]')
      if (!controls?.length) return
      const first = controls[0], last = controls[controls.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keyboard); return () => { document.removeEventListener('keydown', keyboard); previous?.focus() }
  }, [!!form, saving])
  const filtered = entries.filter(e => (tab === 'all' || e.kind === tab) && (status === 'all' || e.status === status) && `${e.label} ${e.reference} ${e.category}`.toLowerCase().includes(search.toLowerCase()))
  const totals = summarize(entries)
  function open(kind: 'income' | 'expense', entry?: FinanceEntry) {
    setForm(entry ? { ...entry, amount: (entry.amount_cents / 100).toFixed(2), tax: String(entry.tax_rate_bps / 100), paid_on: entry.paid_on || localDate() } : blank(kind)); setFile(null); setFormError('')
  }
  async function save(e: FormEvent) {
    e.preventDefault(); if (!form) return
    setSaving(true); setFormError('')
    try {
      const amount = parseAmount(form.amount), rate = Number(form.tax.replace(',', '.')) * 100
      if (!Number.isInteger(rate) || rate < 0 || rate > 10000) throw new Error('Le taux de TVA doit être compris entre 0 et 100 %.')
      let receipt_path = form.receipt_path, receipt_name = form.receipt_name
      if (file) {
        const types: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
        if (!types[file.type] || file.size > 10 * 1024 * 1024 || file.size === 0) throw new Error('Choisissez un PDF, JPG, PNG ou WebP de 10 Mo maximum.')
        receipt_path = `${profile.id}/${crypto.randomUUID()}.${types[file.type]}`
        const { error } = await createSupabaseBrowserClient().storage.from('pro-receipts').upload(receipt_path, file, { contentType: file.type, upsert: false })
        if (error) throw new Error('Le justificatif n’a pas pu être enregistré. Réessayez avant de valider.')
        receipt_name = file.name.slice(0, 240); setForm(f => f ? { ...f, receipt_path, receipt_name } : f); setFile(null)
      }
      await request('/api/pro/finance', { method: form.updated_at ? 'PATCH' : 'POST', body: JSON.stringify({ ...form, amount_cents: amount, tax_rate_bps: rate, paid_on: form.status === 'paid' ? form.paid_on : null, receipt_path, receipt_name }) })
      setForm(null); setNotice('Opération enregistrée. La liste suit la période et les filtres sélectionnés.'); await load()
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Enregistrement impossible.') } finally { setSaving(false) }
  }
  async function receipt(entry: FinanceEntry) {
    if (!entry.receipt_path) return
    try { const { data, error } = await createSupabaseBrowserClient().storage.from('pro-receipts').download(entry.receipt_path); if (error || !data) throw error; const { downloadFile } = await import('@/lib/pro-export'); downloadFile(data, entry.receipt_name || 'justificatif.pdf', data.type) }
    catch { setNotice('Impossible de télécharger ce justificatif. Réessayez.') }
  }
  async function exportReport(format: 'csv' | 'pdf') {
    setExporting(true); setNotice('')
    try { const { reportPdf, downloadFile } = await import('@/lib/pro-export'); if (format === 'csv') downloadFile(financeCsv(filtered), `capsule-operations-${from}-${to}.csv`, 'text/csv;charset=utf-8'); else { const bytes = await reportPdf(entries, from, to, practice); downloadFile(new Uint8Array(bytes).buffer, `capsule-bilan-${from}-${to}.pdf`, 'application/pdf') } }
    catch { setNotice('L’export a échoué. Réessayez.') } finally { setExporting(false) }
  }
  return <><div className="cp-heading"><div><p className="cp-kicker">UNE VISION CLAIRE DE VOTRE ACTIVITÉ</p><h1>Comptabilité</h1><p>Recettes, dépenses et justificatifs. Tout au même endroit.</p></div><div className="cp-actions"><button className="cp-button secondary" onClick={() => open('expense')}><ProIcon name="plus" size={15}/>Une dépense</button><button className="cp-button" onClick={() => open('income')}><ProIcon name="plus" size={15}/>Une recette</button></div></div>
    <div className="cp-toolbar"><label className="cp-field">Du<input aria-label="Début de période" type="date" value={from} onChange={e => setFrom(e.target.value)}/></label><label className="cp-field">Au<input aria-label="Fin de période" type="date" value={to} onChange={e => setTo(e.target.value)}/></label><button className="cp-button quiet" onClick={() => { setFrom(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`); setTo(localDate()) }}>Ce mois</button><div className="cp-actions" style={{ marginLeft: 'auto' }}><button disabled={loading || !!error || exporting} className="cp-button secondary" onClick={() => exportReport('csv')}>Exporter CSV</button><button disabled={loading || !!error || exporting} className="cp-button secondary" onClick={() => exportReport('pdf')}>Télécharger le bilan PDF</button></div></div>
    {error && <div className="cp-notice error" role="alert">{error}<button onClick={load}>Réessayer</button></div>}{notice && <div className="cp-notice" role="status">{notice}</div>}
    <div className="cp-stats">{[['Recettes encaissées', totals.income, 'Paiements reçus'], ['Dépenses réglées', totals.expenses, 'Paiements effectués'], ['Solde de la période', totals.balance, 'Encaissements moins décaissements'], ['À encaisser', totals.receivable, `${money(totals.payable)} à régler`]].map(([label, amount, desc], i) => <div className={`cp-stat ${i === 2 ? 'featured' : ''}`} key={label}><div><small>{label}</small><ProIcon name="wallet" size={18}/></div><strong>{loading || error ? '—' : money(Number(amount))}</strong><p>{desc}</p></div>)}</div>
    <section className="cp-card"><div className="cp-card-head"><div><h2>Journal des opérations</h2><p>{loading ? 'Chargement…' : `${filtered.length} opération(s) affichée(s)`}</p></div><label className="cp-field"><input aria-label="Rechercher une opération" placeholder="Rechercher un libellé, une référence…" value={search} onChange={e => setSearch(e.target.value)}/></label></div><div className="cp-tabs" role="tablist" aria-label="Type d’opération">{[['all', 'Tout'], ['income', 'Recettes'], ['expense', 'Dépenses']].map(([id, label]) => <button role="tab" aria-selected={tab === id} key={id} onClick={() => setTab(id)}>{label}</button>)}<label className="cp-field" style={{ marginLeft: 'auto', marginBottom: 8 }}><select aria-label="Filtrer par statut" value={status} onChange={e => setStatus(e.target.value)}><option value="all">Tous les statuts</option><option value="paid">Réglé</option><option value="pending">En attente</option><option value="cancelled">Annulé</option></select></label></div>
    {loading ? <p role="status">Chargement des opérations…</p> : !error && filtered.length === 0 ? <div className="cp-empty"><ProIcon name="wallet" size={30}/><h3>Aucune opération sur cette sélection</h3><p>Ajoutez votre première recette ou dépense, ou ajustez la période et les filtres.</p><button className="cp-button secondary" onClick={() => open('expense')}>Ajouter une dépense</button></div> : <div className="cp-table-wrap"><table className="cp-table"><thead><tr><th>Date</th><th>Opération</th><th>Catégorie</th><th>Statut</th><th className="cp-number">Montant TTC</th><th>Justificatif</th><th>Action</th></tr></thead><tbody>{filtered.map(e => <tr key={e.id}><td data-label="Date">{(e.paid_on || e.occurred_on).split('-').reverse().join('/')}<small>{e.paid_on ? 'Règlement' : 'Date de pièce'}</small></td><td data-label="Opération"><strong>{e.label}</strong><small>{e.kind === 'income' ? 'Recette' : 'Dépense'}{e.reference && ` · ${e.reference}`}</small></td><td data-label="Catégorie">{e.category}</td><td data-label="Statut"><span className={`cp-tag ${e.status}`}>{statusLabels[e.status]}</span></td><td data-label="Montant TTC" className={`cp-number ${e.kind === 'income' ? 'cp-positive' : 'cp-negative'}`}>{e.kind === 'income' ? '+' : '−'}{money(e.amount_cents)}</td><td data-label="Justificatif">{e.receipt_path ? <button className="cp-button quiet" onClick={() => receipt(e)}>Télécharger</button> : '—'}</td><td data-label="Action"><button className="cp-button quiet" aria-label={`Modifier ${e.label}`} onClick={() => open(e.kind, e)}>Modifier</button></td></tr>)}</tbody></table></div>}
    <p className="cp-note">Le PDF reprend toute la période ; le CSV reprend les opérations filtrées. Les montants réglés suivent la date de règlement, les montants en attente la date de pièce. Les opérations annulées sont conservées mais exclues des totaux.</p></section><p className="cp-note">Bilan d’activité de gestion interne, non certifié. La TVA indiquée est calculée à partir des taux saisis ; son traitement fiscal et sa déductibilité dépendent de votre activité.</p>
    {form && <div className="cp-modal-backdrop"><div className="cp-modal" role="dialog" aria-modal="true" aria-labelledby="entry-title" ref={dialog} tabIndex={-1}><div className="cp-card-head"><div><p className="cp-kicker">{form.kind === 'income' ? 'RECETTE' : 'DÉPENSE'}</p><h2 id="entry-title">{form.updated_at ? 'Modifier l’opération' : 'Nouvelle opération'}</h2></div><button className="cp-close" disabled={saving} aria-label="Fermer le formulaire" onClick={() => setForm(null)}>×</button></div>{formError && <div role="alert" className="cp-notice error">{formError}</div>}<form onSubmit={save}><div className="cp-form-grid"><label className="cp-field full">Libellé<input required maxLength={180} value={form.label} placeholder={form.kind === 'expense' ? 'Ex. Consommables du cabinet' : 'Ex. Consultation'} onChange={e => setForm({ ...form, label: e.target.value })}/></label><label className="cp-field">Montant TTC (€)<input required inputMode="decimal" value={form.amount} placeholder="0,00" onChange={e => setForm({ ...form, amount: e.target.value })}/></label><label className="cp-field">Catégorie<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES[form.kind].map(c => <option key={c}>{c}</option>)}</select></label><label className="cp-field">Date de pièce<input required type="date" value={form.occurred_on} onChange={e => setForm({ ...form, occurred_on: e.target.value })}/></label><label className="cp-field">Statut<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Form['status'] })}>{Object.entries(statusLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>{form.status === 'paid' && <label className="cp-field">Date de règlement<input required type="date" max={localDate()} value={form.paid_on} onChange={e => setForm({ ...form, paid_on: e.target.value })}/></label>}<label className="cp-field">Mode de paiement<select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>{PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}</select></label><label className="cp-field">Taux de TVA (%)<input inputMode="decimal" required value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })}/><small>0 pour une opération sans TVA. Reprenez le taux du justificatif.</small></label><label className="cp-field">Référence de pièce<input maxLength={120} value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })}/></label><label className="cp-field full">Justificatif privé (PDF ou image, 10 Mo max.)<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] || null)}/>{form.receipt_name && <small>Pièce enregistrée : {form.receipt_name}</small>}</label><label className="cp-field full">Notes<textarea maxLength={2000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}/></label></div><div className="cp-actions" style={{ marginTop: 24, justifyContent: 'flex-end' }}><button type="button" disabled={saving} className="cp-button secondary" onClick={() => setForm(null)}>Annuler</button><button disabled={saving} className="cp-button">{saving ? 'Enregistrement…' : 'Enregistrer l’opération'}</button></div></form></div></div>}
  </>
}
