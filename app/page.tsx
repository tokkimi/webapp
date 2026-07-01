'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const CAUSES = [
  { slug: 'lutte-delinquance', name: 'Lutte contre la délinquance', icon: '🚨', goal: 3500, raised: 0, color: 'from-red-500 to-red-700', desc: 'Offrir aux jeunes en rupture une alternative structurante via le judo.' },
  { slug: 'perseverance-scolaire', name: 'Persévérance scolaire', icon: '📚', goal: 2800, raised: 0, color: 'from-blue-500 to-blue-700', desc: 'Le judo apprend à tomber et se relever. Cette résilience se transfère en classe.' },
  { slug: 'inclusion-autisme', name: 'Inclusion autisme & sport', icon: '🤝', goal: 4200, raised: 0, color: 'from-purple-500 to-purple-700', desc: 'Le tatami offre un cadre prévisible et un sentiment de compétence réel.' },
  { slug: 'violences-femmes', name: 'Violences faites aux femmes', icon: '💜', goal: 3000, raised: 0, color: 'from-pink-500 to-pink-700', desc: "L'autodéfense est un droit. Reprendre le contrôle de son corps." },
  { slug: 'decouverte-ailleurs', name: "Découverte de l'ailleurs", icon: '✈️', goal: 5000, raised: 0, color: 'from-emerald-500 to-emerald-700', desc: "Le judo est une langue universelle. Partout où on pose un tatami, on se comprend." },
]

const AMOUNTS = [1, 10, 25, 50, 100, 250, 500]
const IMPACTS: Record<number, string> = {
  10: "Finance une séance pour un jeune",
  50: "Finance un stage d'autodéfense",
  100: "Finance un trimestre inclusif",
  250: "Finance une place de voyage solidaire",
  500: "Finance une action complète",
}

const HA_DON_URL = 'https://www.helloasso.com/associations/judo-club-panonnais/formulaires/1'

export default function HomePage() {
  const [causes, setCauses] = useState(CAUSES)
  const [sorted, setSorted] = useState(CAUSES)
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voted, setVoted] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [anon, setAnon] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [selCause, setSelCause] = useState('')

  useEffect(() => {
    fetch('/api/causes').then(r => r.json()).then(d => {
      if (d.causes) {
        const m = CAUSES.map(c => {
          const x = d.causes.find((i: { slug: string; collected_amount: number }) => i.slug === c.slug)
          return x ? { ...c, raised: Math.round(x.collected_amount / 100) } : c
        })
        setCauses(m)
        setSorted([...m].sort((a, b) => b.raised - a.raised))
      }
    }).catch(() => {})
  }, [])

  const eff = custom ? parseInt(custom) || 0 : amount
  const impactKey = [500, 250, 100, 50, 10].find(k => eff >= k)

  function donate(e: React.FormEvent) {
    e.preventDefault()
    if (!eff || eff < 1) return
    window.open(HA_DON_URL, '_blank')
  }

  return (
    <>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#0f1f33] via-[#1e3a5f] to-[#0f1f33] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                Bras Panon — Île de La Réunion
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Le tatami comme<br /><span className="text-orange-400">levier de<br />changement</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                Le Judo Club Panonnais porte 5 causes sociales essentielles.
                Soutenez notre projet pédagogique 2026 et transformez des vies.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#don" className="btn-primary text-base py-3.5 px-7">Faire un don</Link>
                <Link href="#causes" className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/30 text-white hover:bg-white/10 font-semibold rounded-xl transition-all text-base">Nos 5 causes →</Link>
              </div>
              <div className="flex gap-8 mt-10">
                {[['80+','Pratiquants'],['5','Causes'],['2017','Création']].map(([v,l]) => (
                  <div key={l}><div className="text-3xl font-black text-orange-400">{v}</div><div className="text-gray-400 text-sm">{l}</div></div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-2xl" />
                <Image src="/logo-jcp.jpg" alt="Judo Club Panonnais" width={340} height={340} className="relative rounded-full shadow-2xl border-4 border-white/20 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANDEAU STATS */}
      <section className="bg-orange-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center">
            {[['Affilié FFJDA','Fédération Française de Judo'],['Bras Panon','Est de La Réunion'],['Association loi 1901',''],['100%','Reversé aux projets']].map(([t,s]) => (
              <div key={t}><div className="font-bold">{t}</div><div className="text-orange-100 text-xs">{s}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* CLASSEMENT CAUSES */}
      <section id="causes" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1e3a5f] mb-4">Soutenir nos causes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Votez pour la cause qui vous tient à cœur. Les votes orientent nos priorités d'action.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sorted.map((c, idx) => {
              const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)
              const causeVotes = votes[c.slug] || 0
              const votesPct = totalVotes > 0 ? Math.round((causeVotes / totalVotes) * 100) : 0
              const hasVoted = voted !== null
              const isMyVote = voted === c.slug
              return (
                <div key={c.slug} className="card p-6 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl`}>{c.icon}</div>
                    <span className="text-3xl font-black text-gray-100">#{idx+1}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{c.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{c.desc}</p>
                  {hasVoted && (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{causeVotes} vote{causeVotes !== 1 ? 's' : ''}</span>
                        <span>{votesPct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${c.color} rounded-full transition-all duration-500`} style={{ width: `${votesPct}%` }} />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (hasVoted) return
                      setVoted(c.slug)
                      setVotes(v => ({ ...v, [c.slug]: (v[c.slug] || 0) + 1 }))
                    }}
                    disabled={hasVoted}
                    className={`w-full py-2 rounded-xl font-semibold text-sm transition-all ${isMyVote ? `bg-gradient-to-r ${c.color} text-white` : hasVoted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : `border-2 border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500`}`}>
                    {isMyVote ? '✓ Votre vote' : hasVoted ? 'Vote enregistré' : 'Voter pour cette cause'}
                  </button>
                  <Link href={`/causes/${c.slug}`} className="block text-center text-xs text-orange-500 hover:underline mt-2">En savoir plus →</Link>
                </div>
              )
            })}
          </div>
          <div className="text-center">
            <Link href="#don" className="btn-primary">Faire un don →</Link>
          </div>
        </div>
      </section>

      {/* DON */}
      <section id="don" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1e3a5f] mb-4">Faire un don</h2>
            <p className="text-gray-500">100% reversé au projet. Reçu fiscal automatique.</p>
          </div>
          <div className="card p-8">
            <form onSubmit={donate} className="space-y-6">
              {/* Cause */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Choisissez une cause (optionnel)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[{slug:'',name:'Don général (toutes causes)',icon:''},...causes].map(c => (
                    <button key={c.slug} type="button" onClick={() => setSelCause(c.slug)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${selCause === c.slug ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {c.slug ? `${c.icon} ${c.name}` : c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Montant de votre don</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {AMOUNTS.map(a => (
                    <button key={a} type="button" onClick={() => { setAmount(a); setCustom('') }}
                      className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${amount === a && !custom ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                      {a} €
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input type="number" value={custom} onChange={e => { setCustom(e.target.value); setAmount(0) }}
                    placeholder="Autre montant" min="1" className="input-field pr-10" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                </div>
                {eff >= 10 && impactKey && <p className="text-sm text-green-600 mt-2 font-medium">{IMPACTS[impactKey]}</p>}
                {eff >= 10 && <p className="text-xs text-blue-600 mt-1">Avantage fiscal : {Math.round(eff*0.66)} € remboursés (66% pour les particuliers)</p>}
              </div>

              {/* Identité */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <input type="checkbox" id="anon" checked={anon} onChange={e => setAnon(e.target.checked)} className="w-4 h-4 accent-orange-500" />
                  <label htmlFor="anon" className="text-sm text-gray-600">Don anonyme</label>
                </div>
                {!anon && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom (optionnel)" className="input-field" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (reçu fiscal)" className="input-field" />
                  </div>
                )}
                {anon && <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email pour le reçu fiscal (optionnel)" className="input-field" />}
              </div>
              {/* Moyen de paiement */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Moyen de paiement</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'card', label: 'Carte bancaire' },
                    { value: 'paypal', label: 'PayPal' },
                    { value: 'transfer', label: 'Virement bancaire' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setPaymentMethod(opt.value)}
                      className={`py-2.5 px-3 rounded-xl border-2 font-medium text-sm transition-all text-center ${paymentMethod === opt.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Un message pour le club ? (optionnel)" rows={3} className="input-field resize-none" />

              <button type="submit" disabled={!eff || eff < 1}
                className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {`Donner ${eff ? eff+' €' : ''} →`}
              </button>
              <p className="text-xs text-gray-400 text-center">Paiement sécurisé par HelloAsso. 100% reversé au projet.</p>
            </form>
          </div>
        </div>
      </section>

      {/* DÉFISCALISATION */}
      <section className="py-16 bg-[#1e3a5f] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Défiscalisez votre don</h2>
              <p className="text-gray-300 mb-6">Association d'intérêt général — vos dons ouvrent droit à des avantages fiscaux importants.</p>
              <div className="space-y-4">
                {[['Particuliers','66% du don déductible de l\'impôt sur le revenu'],['Entreprises (mécénat)','60% du don déductible de l\'IS (art. 238 bis CGI)']].map(([t,d]) => (
                  <div key={t} className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                    <div><div className="font-semibold">{t}</div><div className="text-gray-300 text-sm">{d}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-2xl p-8">
                <div className="text-gray-300 mb-2 text-sm uppercase tracking-wide">Reçu fiscal automatique</div>
                <div className="text-gray-300 text-sm">Un reçu vous est envoyé par email après chaque don pour votre déclaration d'impôts.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1e3a5f] mb-6">Notre démarche pédagogique</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Fondé en 1882 par Jigoro Kano, le judo repose sur deux principes : l'utilisation optimale de l'énergie et la prospérité mutuelle.
                Notre dojo accueille plus de 80 pratiquants de tous âges dans une ambiance familiale, exigeante et bienveillante.
              </p>
              <blockquote className="border-l-4 border-orange-500 pl-6 italic text-gray-600 mb-6">
                "Le judo m'a appris que la chute n'est pas une fin — c'est un début. Aujourd'hui, je veux que notre club soit ce tatami pour chaque enfant, chaque femme, chaque personne qui en a besoin."
                <footer className="mt-2 text-sm font-semibold not-italic text-[#1e3a5f]">— La présidente du JCP</footer>
              </blockquote>
              <Link href="/inscription" className="btn-navy">Rejoindre le club →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['Respect','De l\'autre, de soi, des règles'],['Persévérance','Tomber, se relever, recommencer'],['Discipline','La rigueur du dojo dans la vie'],['Entraide','On grandit avec l\'autre']].map(([t,d]) => (
                <div key={t} className="card p-5 text-center">
                  <div className="font-bold text-[#1e3a5f] mb-1">{t}</div>
                  <div className="text-gray-500 text-sm">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">Restez informé de nos actions</h2>
          <p className="text-orange-100 mb-8">Résultats des collectes, actualités du club, événements à venir...</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={async e => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            await fetch('/api/newsletter/subscribe', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: fd.get('email') }) })
            ;(e.target as HTMLFormElement).reset()
          }}>
            <input name="email" type="email" required placeholder="votre@email.fr" className="flex-1 px-5 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white text-base" />
            <button type="submit" className="btn-navy py-3 px-6 whitespace-nowrap">S'inscrire</button>
          </form>
        </div>
      </section>
    </>
  )
}
