'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePro, ProIcon } from '@/components/pro/ProWorkspace'
import { localDate, money, summarize, FinanceEntry } from '@/lib/pro-finance'

export default function ProHome() {
  const { profile, practice, request } = usePro()
  const [appointments, setAppointments] = useState<any[]>([]), [finance, setFinance] = useState<FinanceEntry[] | null>(null)
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [financeError, setFinanceError] = useState('')
  useEffect(() => {
    let active = true
    const now = new Date(), from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    Promise.allSettled([
      request('/api/appointments').then(r => { if (active) setAppointments(r.appointments || []) }).catch(e => { if (active) setError(e.message) }),
      request(`/api/pro/finance?from=${from}&to=${localDate()}`).then(r => { if (active) setFinance(r.entries) }).catch(e => { if (active) setFinanceError(e.message) }),
    ]).then(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [request])
  const today = localDate(), now = new Date()
  const todayApts = appointments.filter(a => localDate(new Date(a.scheduled_at)) === today && a.status !== 'cancelled')
  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= now && a.status !== 'cancelled').slice(0, 4)
  const pending = appointments.filter(a => a.status === 'pending').length
  const summary = finance ? summarize(finance) : null
  return <>
    <div className="cp-heading"><div><p className="cp-kicker">VOTRE QUOTIDIEN, EN UN COUP D’ŒIL</p><h1>Bonjour, {profile.name || 'bienvenue'}.</h1><p>{practice?.profession || profile.specialty || 'Votre activité professionnelle'} · {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div><Link href="/pro/agenda" className="cp-button"><ProIcon name="calendar" size={16}/>Ouvrir mon agenda</Link></div>
    {error && <div className="cp-notice error" role="alert">{error}</div>}
    <div className="cp-stats">{[
      ['Rendez-vous aujourd’hui', loading || error ? '—' : todayApts.length, 'Votre journée au cabinet', 'calendar'],
      ['Demandes en attente', loading || error ? '—' : pending, 'À retrouver dans l’agenda', 'patients'],
      ['Recettes du mois', summary ? money(summary.income) : '—', 'Encaissements enregistrés', 'wallet'],
      ['Solde du mois', summary ? money(summary.balance) : '—', 'Recettes moins dépenses réglées', 'overview'],
    ].map(([label, value, desc, icon], i) => <div key={label} className={`cp-stat ${i === 3 ? 'featured' : ''}`}><div><small>{label}</small><ProIcon name={String(icon)} size={18}/></div><strong>{value}</strong><p>{desc}</p></div>)}</div>
    <div className="cp-grid"><div className="cp-stack"><section className="cp-card"><div className="cp-card-head"><div><h2>Vos prochains rendez-vous</h2><p>Consultations, soins et accompagnements.</p></div><Link href="/pro/agenda">Voir l’agenda →</Link></div>{loading ? <p role="status">Chargement…</p> : upcoming.length ? upcoming.map(a => <Link href="/pro/agenda" className="cp-row" key={a.id}><span className="cp-row-time">{new Date(a.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span><div><strong>{a.patient?.name || 'Rendez-vous'}</strong><small>{new Date(a.scheduled_at).toLocaleDateString('fr-FR')} · {a.duration_minutes} min</small></div><span className={`cp-tag ${a.status === 'pending' ? 'pending' : ''}`}>{a.status === 'pending' ? 'À confirmer' : 'Confirmé'}</span></Link>) : <div className="cp-empty"><ProIcon name="calendar" size={30}/><h3>Une place pour vos prochains rendez-vous</h3><p>Organisez vos disponibilités et retrouvez ici les réservations de votre cabinet.</p><Link className="cp-button secondary" href="/pro/agenda">Gérer mes disponibilités</Link></div>}</section>
    <section className="cp-card"><div className="cp-card-head"><div><h2>Les finances de votre cabinet</h2><p>Ce mois-ci · opérations enregistrées dans Capsule.</p></div><Link href="/pro/comptabilite">Tout voir →</Link></div>{financeError ? <p className="cp-note">{financeError}</p> : <><div className="cp-row"><div><strong>Recettes encaissées</strong><small>Règlements reçus</small></div><strong className="cp-positive">{summary ? money(summary.income) : '—'}</strong></div><div className="cp-row"><div><strong>Dépenses réglées</strong><small>Achats, matériel, charges et prestations</small></div><strong>{summary ? money(summary.expenses) : '—'}</strong></div><div className="cp-row"><div><strong>À encaisser</strong><small>Opérations en attente de règlement</small></div><strong>{summary ? money(summary.receivable) : '—'}</strong></div><div className="cp-actions" style={{ marginTop: 20 }}><Link href="/pro/comptabilite?new=income" className="cp-button secondary">Ajouter une recette</Link><Link href="/pro/comptabilite?new=expense" className="cp-button secondary">Ajouter une dépense</Link></div></>}</section></div>
    <div className="cp-stack"><section className="cp-banner"><p className="cp-kicker">UN CABINET À VOTRE IMAGE</p><h2>Votre métier.<br/>Votre façon de travailler.</h2><p>Renseignez votre profession et les coordonnées de votre activité pour personnaliser vos bilans.</p><Link href="/pro/profile" className="cp-button secondary">Configurer mon cabinet <ProIcon name="arrow" size={14}/></Link></section><section className="cp-card"><h2>Accès rapides</h2>{[
      ['/pro/patients', 'patients', 'Mes patients', 'Dossiers, historique et notes'], ['/pro/messages', 'messages', 'Ma messagerie', 'Retrouver mes échanges'], ['/pro/comptabilite', 'resources', 'Mes bilans', 'Synthèse PDF et export CSV'], ['/pro/resources', 'resources', 'Mes ressources', 'Proposer et partager des contenus'],
    ].map(([href, icon, label, desc]) => <Link href={href} key={href} className="cp-quick-link"><span className="cp-quick-icon"><ProIcon name={icon}/></span><div><strong>{label}</strong><small>{desc}</small></div><ProIcon name="arrow" size={15}/></Link>)}</section><p className="cp-note">Votre tableau de bord est toujours accessible depuis le menu et le lien en haut de chaque page.</p></div></div>
  </>
}
