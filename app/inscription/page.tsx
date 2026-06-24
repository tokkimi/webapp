'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type CourseType = 'essai' | 'payant' | 'gratuit' | 'tsa'

interface CourseOption {
  label: string
  type: CourseType
  price: number
}

const COURSES: CourseOption[] = [
  { label: "Cours d'essai — Groupe 1 Baby Judo (3–5 ans) — Gratuit", type: 'essai', price: 0 },
  { label: "Cours d'essai — Groupe 2 Enfants (6–10 ans) — Gratuit", type: 'essai', price: 0 },
  { label: "Cours d'essai — Groupe 3 Ados/Adultes (10 ans et +) — Gratuit", type: 'essai', price: 0 },
  { label: 'Baby Judo — Lundi 16h–17h & Mercredi 15h–16h (3–5 ans) — 200€/an', type: 'payant', price: 200 },
  { label: 'Enfants — Lundi 17h–18h, Mercredi 16h–17h & Vendredi 17h–18h30 (6–10 ans) — 210€/an', type: 'payant', price: 210 },
  { label: 'Ados/Adultes — Lundi 18h–19h, Mercredi 17h–18h30 & Vendredi 17h–18h30 (10 ans+) — 220€/an', type: 'payant', price: 220 },
  { label: 'Cours Spécial TSA — Tarif adapté (nous contacter)', type: 'tsa', price: 0 },
  { label: 'Autodéfense Femmes — Gratuit', type: 'gratuit', price: 0 },
]

function InscriptionForm() {
  const params = useSearchParams()
  const prefill = params.get('cours') || ''

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', birthDate: '',
    address: '', course: prefill, emergencyContact: '', emergencyPhone: '',
    medicalNotes: '', acceptCgu: false,
    payment_installments: 1,
    payment_method: 'transfer' as 'card' | 'transfer' | 'cash',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function set(k: string, v: string | boolean | number) { setForm(f => ({ ...f, [k]: v })) }

  const selectedCourse = COURSES.find(c => c.label === form.course) || null
  const courseType: CourseType = selectedCourse?.type || 'payant'
  const price = selectedCourse?.price || 0
  const isPaid = courseType === 'payant'
  const installmentAmount = isPaid && form.payment_installments > 0
    ? Math.ceil(price / form.payment_installments)
    : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.acceptCgu) return
    setStatus('loading')
    try {
      const payload = {
        ...form,
        course_type: courseType,
        price: price * 100, // centimes
        payment_installments: isPaid ? form.payment_installments : 1,
        payment_method: isPaid ? form.payment_method : null,
      }
      const res = await fetch('/api/courses/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  if (status === 'success') return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h2 className="text-3xl font-black text-[#1e3a5f] mb-4">Inscription reçue !</h2>
      <p className="text-gray-600 mb-8">
        Merci {form.firstName} ! Votre demande d'inscription a bien été envoyée.
        Notre équipe vous contactera dans les 48h à l'adresse <strong>{form.email}</strong>.
      </p>
      <a href="/" className="btn-primary">Retour à l'accueil</a>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* Identité */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
          Informations personnelles
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label><input required value={form.firstName} onChange={e => set('firstName', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label><input required value={form.lastName} onChange={e => set('lastName', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label><input required type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label><input value={form.address} onChange={e => set('address', e.target.value)} className="input-field" /></div>
        </div>
      </div>

      {/* Cours */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
          Choix du cours
        </h3>
        <select required value={form.course} onChange={e => set('course', e.target.value)} className="input-field">
          <option value="">-- Sélectionnez un cours --</option>
          {COURSES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
        </select>

        {/* Info cours essai/gratuit */}
        {form.course && !isPaid && courseType !== 'tsa' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            {courseType === 'essai'
              ? '6 cours d\'essai offerts, sans engagement. À l\'issue des 6 séances, vous pourrez vous inscrire officiellement.'
              : 'Ce cours est entièrement gratuit. Aucun paiement requis.'}
          </div>
        )}
        {form.course && courseType === 'tsa' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            Le tarif pour le cours TSA est adapté à chaque situation. Notre équipe vous contactera pour en discuter.
          </div>
        )}

        {/* Section paiement pour cours payants */}
        {form.course && isPaid && (
          <div className="mt-6 space-y-5 border-t pt-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Montant annuel</span>
              <span className="text-2xl font-black text-[#1e3a5f]">{price} €</span>
            </div>

            {/* Modalité de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalité de paiement</label>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4].map(n => (
                  <label key={n} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border-2 transition-colors ${form.payment_installments === n ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="installments"
                      value={n}
                      checked={form.payment_installments === n}
                      onChange={() => set('payment_installments', n)}
                      className="sr-only"
                    />
                    {n}x
                    {form.payment_installments === n && (
                      <span className="text-xs font-normal ml-1">= {Math.ceil(price / n)} € / échéance</span>
                    )}
                  </label>
                ))}
              </div>
              {form.payment_installments > 1 && (
                <p className="text-sm text-gray-500 mt-2">
                  {price} € en {form.payment_installments} fois = <strong>{installmentAmount} € par échéance</strong>
                </p>
              )}
            </div>

            {/* Moyen de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moyen de paiement</label>
              <div className="space-y-2">
                {[
                  { value: 'transfer', label: 'Virement bancaire' },
                  { value: 'cash', label: 'Espèces / Chèque au club' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 transition-colors ${form.payment_method === opt.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.value}
                      checked={form.payment_method === opt.value}
                      onChange={() => set('payment_method', opt.value)}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact urgence */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
          Contact en cas d'urgence
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label><input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="tel" value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} className="input-field" /></div>
        </div>
      </div>

      {/* Infos médicales */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
          Informations médicales (optionnel)
        </h3>
        <textarea value={form.medicalNotes} onChange={e => set('medicalNotes', e.target.value)}
          placeholder="Allergies, contre-indications, besoins particuliers..."
          rows={3} className="input-field resize-none" />
        <p className="text-xs text-gray-400 mt-2">Ces informations sont strictement confidentielles et réservées à l'encadrement.</p>
      </div>

      {/* CGU */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <input type="checkbox" id="cgu" required checked={form.acceptCgu} onChange={e => set('acceptCgu', e.target.checked)} className="w-4 h-4 accent-orange-500 mt-0.5" />
        <label htmlFor="cgu" className="text-sm text-gray-600">
          J'accepte les <a href="/cgv" className="text-orange-500 hover:underline">conditions générales de vente</a> et la <a href="/confidentialite" className="text-orange-500 hover:underline">politique de confidentialité</a> du Judo Club Panonnais. *
        </label>
      </div>

      <button type="submit" disabled={status === 'loading'}
        className="btn-primary w-full py-4 text-base disabled:opacity-50">
        {status === 'loading' ? 'Envoi en cours...' : "Envoyer ma demande d'inscription"}
      </button>
      {status === 'error' && <p className="text-red-500 text-sm text-center">Une erreur est survenue. Réessayez ou contactez-nous.</p>}
    </form>
  )
}

function HelloAssoWidget() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Inscrivez-vous et réglez directement en ligne via HelloAsso :</p>
      <iframe
        id="haWidgetAdhesion"
        allowTransparency={true}
        scrolling="auto"
        src="https://www.helloasso.com/associations/judo-club-panonnais/adhesions/adhesion-2026-2027-sport/widget"
        style={{ width: '100%', height: '750px', border: 'none' }}
        onLoad={() => {
          window.addEventListener('message', function(e) {
            const dataHeight = (e.data as { height?: number }).height
            const el = document.getElementById('haWidgetAdhesion')
            if (dataHeight && el && dataHeight > parseFloat(el.style.height || '0')) {
              el.style.height = dataHeight + 'px'
            }
          })
        }}
      />
    </div>
  )
}

function InscriptionTabs() {
  const [tab, setTab] = useState<'helloasso' | 'form'>('helloasso')
  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('helloasso')}
          className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${tab === 'helloasso' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
          Payer en ligne (HelloAsso)
        </button>
        <button onClick={() => setTab('form')}
          className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${tab === 'form' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
          Régler sur place (virement / espèces)
        </button>
      </div>
      {tab === 'helloasso' ? <HelloAssoWidget /> : (
        <Suspense fallback={<div>Chargement...</div>}>
          <InscriptionForm />
        </Suspense>
      )}
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Inscription aux cours</h1>
          <p className="text-gray-300">Rejoignez le Judo Club Panonnais. Payez en ligne via HelloAsso ou déposez votre dossier au club.</p>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Chargement...</div>}>
              <InscriptionTabs />
            </Suspense>
          </div>
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Nous trouver</h3>
              <p className="text-gray-600 text-sm">
                <strong>Dojo Lucie Ignace</strong><br />
                1 Route Nationale 2, 97412 Bras-Panon<br />
                (en face de la piscine)<br /><br />
                <strong>Dojo Champ de Foire</strong><br />
                Champ de Foire, 97412 Bras-Panon<br />
                (face à la médiathèque)
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Contact</h3>
              <p className="text-gray-600 text-sm"><a href="mailto:contact@judoclubpanonnais.fr" className="text-orange-500 hover:underline">contact@judoclubpanonnais.fr</a></p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Tarifs</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Baby Judo (3–5 ans) : 200 € / an</li>
                <li>• Enfants (6–10 ans) : 210 € / an</li>
                <li>• Ados/Adultes (10 ans+) : 220 € / an</li>
                <li>• Cours TSA : Tarif adapté</li>
                <li>• Autodéfense Femmes : Gratuit</li>
                <li>• Cours d'essai : Gratuit</li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">Licences FFJDA incluses. Tarifs solidaires sur demande.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
