'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type CourseType = 'essai' | 'payant' | 'gratuit' | 'tsa'

const COURSES: { label: string; type: CourseType; price: number }[] = [
  { label: "Cours d'essai — Groupe 1 Baby Judo (3–5 ans) — Gratuit", type: 'essai', price: 0 },
  { label: "Cours d'essai — Groupe 2 Enfants (6–10 ans) — Gratuit", type: 'essai', price: 0 },
  { label: "Cours d'essai — Groupe 3 Ados/Adultes (10 ans et +) — Gratuit", type: 'essai', price: 0 },
  { label: 'Baby Judo — Lundi 16h–17h & Mercredi 15h–16h (3–5 ans) — 200€/an', type: 'payant', price: 200 },
  { label: 'Enfants — Lundi 17h–18h, Mercredi 16h–17h & Vendredi 17h–18h30 (6–10 ans) — 210€/an', type: 'payant', price: 210 },
  { label: 'Ados/Adultes — Lundi 18h–19h, Mercredi 17h–18h30 & Vendredi 17h–18h30 (10 ans+) — 220€/an', type: 'payant', price: 220 },
  { label: 'Cours Spécial TSA — Tarif adapté (nous contacter)', type: 'tsa', price: 0 },
  { label: 'Autodéfense Femmes — Gratuit', type: 'gratuit', price: 0 },
]

const HA_ADHESION_URL = 'https://www.helloasso.com/associations/judo-club-panonnais/adhesions/adhesion-2026-2027-sport'

function InscriptionForm() {
  const params = useSearchParams()
  const prefill = params.get('cours') || ''

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', birthDate: '',
    course: prefill, emergencyContact: '', emergencyPhone: '',
    medicalNotes: '', acceptCgu: false,
    payment_method: 'card' as 'card' | 'transfer',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success-card' | 'success-transfer' | 'error'>('idle')

  function set(k: string, v: string | boolean) { setForm(f => ({ ...f, [k]: v })) }

  const selectedCourse = COURSES.find(c => c.label === form.course) || null
  const courseType: CourseType = selectedCourse?.type || 'payant'
  const price = selectedCourse?.price || 0
  const isPaid = courseType === 'payant'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.acceptCgu) return
    setStatus('loading')
    try {
      const res = await fetch('/api/courses/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          course_type: courseType,
          price: price * 100,
          payment_installments: 1,
          payment_method: isPaid ? form.payment_method : null,
        }),
      })
      if (!res.ok) { setStatus('error'); return }
      if (isPaid && form.payment_method === 'card') {
        setStatus('success-card')
        window.open(HA_ADHESION_URL, '_blank')
      } else if (isPaid && form.payment_method === 'transfer') {
        setStatus('success-transfer')
      } else {
        setStatus('success-card')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success-card') return (
    <div className="card p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-[#1e3a5f] mb-2">Inscription enregistrée !</h3>
      <p className="text-gray-600 text-sm">Merci {form.firstName} ! Vous avez été redirigé vers HelloAsso pour finaliser le paiement par carte.</p>
      <button onClick={() => window.open(HA_ADHESION_URL, '_blank')} className="mt-4 btn-primary text-sm py-2 px-5">
        Accéder au paiement HelloAsso →
      </button>
    </div>
  )

  if (status === 'success-transfer') return (
    <div className="card p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-black text-[#1e3a5f] mb-2">Demande enregistrée !</h3>
      <p className="text-gray-600 text-sm max-w-sm mx-auto">
        Merci {form.firstName} ! Vous recevrez la facture avec nos coordonnées bancaires à l'adresse <strong>{form.email}</strong> sous 48h.
      </p>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* 1. Informations personnelles */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
          Informations personnelles
        </h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input required value={form.firstName} onChange={e => set('firstName', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input required value={form.lastName} onChange={e => set('lastName', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
            <input required type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* 2. Choix du cours */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
          Choix du cours
        </h3>
        <select required value={form.course} onChange={e => set('course', e.target.value)} className="input-field">
          <option value="">-- Sélectionnez un cours --</option>
          {COURSES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
        </select>

        {form.course && !isPaid && courseType !== 'tsa' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
            {courseType === 'essai'
              ? "6 cours d'essai offerts, sans engagement. À l'issue des 6 séances, vous pourrez vous inscrire officiellement."
              : 'Ce cours est entièrement gratuit. Aucun paiement requis.'}
          </div>
        )}
        {form.course && courseType === 'tsa' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            Le tarif pour le cours TSA est adapté à chaque situation. Notre équipe vous contactera pour en discuter.
          </div>
        )}

        {form.course && isPaid && (
          <div className="mt-5 border-t pt-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">Montant annuel</span>
              <span className="text-2xl font-black text-[#1e3a5f]">{price} €</span>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Mode de règlement</label>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 transition-colors ${form.payment_method === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment_method" value="card" checked={form.payment_method === 'card'} onChange={() => set('payment_method', 'card')} className="accent-orange-500" />
                <div>
                  <span className="text-sm font-medium text-gray-800">Carte bancaire</span>
                  <span className="block text-xs text-gray-500">Paiement sécurisé via HelloAsso</span>
                </div>
              </label>
              <label className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 transition-colors ${form.payment_method === 'transfer' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="payment_method" value="transfer" checked={form.payment_method === 'transfer'} onChange={() => set('payment_method', 'transfer')} className="accent-orange-500" />
                <div>
                  <span className="text-sm font-medium text-gray-800">Virement bancaire</span>
                  <span className="block text-xs text-gray-500">Vous recevrez la facture et les coordonnées par email sous 48h</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 3. Contact urgence */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
          Contact en cas d'urgence
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
            <input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="tel" value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* 4. Infos médicales */}
      <div className="card p-6">
        <h3 className="font-bold text-[#1e3a5f] text-lg mb-5 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
          Informations médicales (optionnel)
        </h3>
        <textarea value={form.medicalNotes} onChange={e => set('medicalNotes', e.target.value)}
          placeholder="Allergies, contre-indications, besoins particuliers..."
          rows={3} className="input-field resize-none" />
        <p className="text-xs text-gray-400 mt-2">Ces informations sont strictement confidentielles et réservées à l'encadrement.</p>
      </div>

      {/* Droit à l'image */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
        <p className="font-semibold mb-1">Droit à l'image</p>
        <p>En vous inscrivant, vous autorisez le Judo Club Panonnais à utiliser votre image à des fins de communication non commerciale (site internet, réseaux sociaux, presse locale), <strong>pour une période de 5 ans</strong>. Vous pouvez retirer cette autorisation à tout moment par écrit.</p>
      </div>

      {/* CGU */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <input type="checkbox" id="cgu" required checked={form.acceptCgu} onChange={e => set('acceptCgu', e.target.checked)} className="w-4 h-4 accent-orange-500 mt-0.5" />
        <label htmlFor="cgu" className="text-sm text-gray-600">
          J'accepte les <a href="/cgv" className="text-orange-500 hover:underline">conditions générales de vente</a> et la <a href="/confidentialite" className="text-orange-500 hover:underline">politique de confidentialité</a> du Judo Club Panonnais. *
        </label>
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-4 text-base disabled:opacity-50">
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer mes informations complémentaires'}
      </button>
      {status === 'error' && <p className="text-red-500 text-sm text-center">Une erreur est survenue. Réessayez ou contactez-nous.</p>}
    </form>
  )
}

export default function InscriptionPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Inscription aux cours</h1>
          <p className="text-gray-300">Rejoignez le Judo Club Panonnais. Remplissez le formulaire ci-dessous pour vous inscrire.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {/* Docs FFJDA */}
            <div className="card p-5">
              <h3 className="font-bold text-[#1e3a5f] text-sm mb-3">Documents médicaux obligatoires — Décret n° 2021-564 du 7 mai 2021</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/docs/questionnaire-sante-ffjda.pdf" download className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1e3a5f] text-[#1e3a5f] rounded-xl text-sm font-semibold hover:bg-[#1e3a5f] hover:text-white transition-colors">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Questionnaire de santé FFJDA
                </a>
                <a href="/docs/attestation-medicale-ffjda.pdf" download className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1e3a5f] text-[#1e3a5f] rounded-xl text-sm font-semibold hover:bg-[#1e3a5f] hover:text-white transition-colors">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Attestation médicale FFJDA
                </a>
              </div>
            </div>

            {/* Formulaire */}
            <Suspense fallback={null}>
              <InscriptionForm />
            </Suspense>
          </div>

          {/* Sidebar */}
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
              <p className="text-gray-600 text-sm">
                <a href="mailto:contact@judoclubpanonnais.fr" className="text-orange-500 hover:underline">contact@judoclubpanonnais.fr</a>
              </p>
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
