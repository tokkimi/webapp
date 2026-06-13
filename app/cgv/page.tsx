export default function CGV() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F7FF', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/" style={{ fontSize: 13, color: '#7C3AED', textDecoration: 'none', fontWeight: 500 }}>← Retour</a>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 36, fontWeight: 800, color: '#1A1A2E', margin: '24px 0 8px' }}>
          Conditions Générales d'Utilisation et de Vente
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: '0 0 40px' }}>Dernière mise à jour : juin 2026 · Version applicable dès l'inscription</p>

        <style>{`
          .cgv-section h2 { font-family:Outfit,sans-serif; font-size:20px; font-weight:700; color:#1A1A2E; margin:36px 0 10px; border-left:4px solid #7C3AED; padding-left:14px; }
          .cgv-section h3 { font-family:Outfit,sans-serif; font-size:16px; font-weight:600; color:#374151; margin:20px 0 8px; }
          .cgv-section p { color:#4B5563; line-height:1.8; font-size:15px; margin:0 0 12px; }
          .cgv-section ul { color:#4B5563; line-height:1.8; font-size:15px; margin:0 0 12px; padding-left:20px; }
          .cgv-section ul li { margin-bottom:4px; }
          .cgv-section strong { color:#1A1A2E; }
          .cgv-section .highlight { background:#EDE9FE; border-radius:12px; padding:16px 20px; margin:16px 0; border-left:4px solid #7C3AED; }
          .cgv-section .warn { background:#FEF3C7; border-radius:12px; padding:16px 20px; margin:16px 0; border-left:4px solid #F59E0B; }
        `}</style>

        <div className="cgv-section">

          <div className="highlight">
            <strong>Résumé essentiel :</strong> Capsule Ado est une plateforme de soutien au bien-être mental destinée aux adolescents, parents et professionnels de santé. Elle n'est pas un service médical. En cas d'urgence, contactez le 15 (SAMU) ou le 3114 (Prévention Suicide).
          </div>

          <h2>1. Éditeur et hébergeur</h2>
          <p><strong>Éditeur :</strong> Association Capsule Ado, loi 1901, déclarée en préfecture du [Département] sous le n° W[XXXXX].<br />
          Siège social : [Adresse complète], France<br />
          Email : <a href="mailto:contact@capsule-ado.com" style={{ color: '#7C3AED' }}>contact@capsule-ado.com</a><br />
          Directeur de publication : [Prénom Nom]</p>
          <p><strong>Hébergeur :</strong> Vercel Inc., 340 Pine Street, Suite 700, San Francisco, CA 94104, USA.<br />
          Base de données : Supabase, Inc. — données hébergées en Union européenne (région Frankfurt).</p>

          <h2>2. Objet et nature du service</h2>
          <p>Capsule Ado est une plateforme numérique de <strong>soutien au bien-être mental</strong> qui propose :</p>
          <ul>
            <li>Des outils de suivi de l'humeur, du journal intime privé, et des défis personnels destinés aux adolescents (13-25 ans) ;</li>
            <li>Des phrases de motivation quotidiennes générées par intelligence artificielle ;</li>
            <li>Un chat d'accompagnement par IA bienveillante (non substitutif à un suivi médical) ;</li>
            <li>Une médiathèque de ressources vérifiées par des professionnels de santé ;</li>
            <li>Un espace de mise en relation entre parents et professionnels de santé ;</li>
            <li>Des outils de gestion de patientèle pour les professionnels de santé.</li>
          </ul>
          <div className="warn">
            <strong>⚠️ Avertissement important :</strong> Capsule Ado n'est pas un service médical, psychologique ou psychiatrique. Le chat IA ne remplace en aucun cas une consultation avec un professionnel de santé. En cas de détresse sévère ou d'urgence, contactez immédiatement le <strong>3114</strong> (numéro national de prévention du suicide, 24h/24) ou le <strong>15</strong> (SAMU).
          </div>

          <h2>3. Accès et conditions d'inscription</h2>
          <h3>3.1 Âge minimum</h3>
          <p>L'accès au profil <em>adolescent</em> est réservé aux personnes âgées d'au moins <strong>13 ans</strong>. Pour les mineurs de 13 à 15 ans, le consentement parental est requis conformément au RGPD (art. 8). L'utilisateur certifie, lors de l'inscription, avoir l'âge requis ou disposer du consentement de son représentant légal.</p>

          <h3>3.2 Compte professionnel</h3>
          <p>L'accès au profil <em>professionnel</em> est réservé aux personnes justifiant d'une qualification reconnue (numéro ADELI, RPPS, ou équivalent). L'association Capsule Ado procède à une vérification manuelle de chaque profil professionnel avant activation complète. Toute fausse déclaration entraîne la suppression immédiate du compte.</p>

          <h3>3.3 Responsabilités de l'utilisateur</h3>
          <p>L'utilisateur s'engage à :</p>
          <ul>
            <li>Fournir des informations exactes lors de l'inscription ;</li>
            <li>Maintenir la confidentialité de ses identifiants ;</li>
            <li>Ne pas utiliser la plateforme à des fins illégales, commerciales non autorisées ou malveillantes ;</li>
            <li>Respecter les autres utilisateurs et les professionnels ;</li>
            <li>Ne pas tenter d'extraire, reproduire ou revendre les contenus de la plateforme.</li>
          </ul>

          <h2>4. Abonnements et tarification</h2>
          <h3>4.1 Plans Famille (Ado / Parent)</h3>
          <ul>
            <li><strong>Gratuit :</strong> 0€/mois — accès limité à certaines fonctionnalités ;</li>
            <li><strong>Famille :</strong> 9,90€/mois TTC — accès complet à toutes les fonctionnalités ado et parent.</li>
          </ul>
          <h3>4.2 Plans Professionnel</h3>
          <ul>
            <li><strong>Découverte :</strong> 0€ pendant 3 mois, puis passage au plan Essentiel ou résiliation ;</li>
            <li><strong>Essentiel :</strong> 29€/mois HT — patients illimités, agenda complet ;</li>
            <li><strong>Premium :</strong> 59€/mois HT — multi-praticiens, analytics avancées.</li>
          </ul>
          <p>Les prix professionnels sont affichés HT. La TVA applicable (20%) s'ajoute selon la réglementation en vigueur.</p>

          <h3>4.3 Renouvellement et résiliation</h3>
          <p>Les abonnements sont à <strong>renouvellement automatique mensuel</strong>. Vous pouvez résilier à tout moment depuis votre espace profil, avec effet à la fin de la période en cours. Aucun remboursement au prorata n'est effectué pour les périodes entamées, sauf exercice du droit de rétractation (voir article 5).</p>

          <h3>4.4 Moyens de paiement</h3>
          <p>Les seuls moyens de paiement acceptés sont :</p>
          <ul>
            <li><strong>Carte bancaire</strong> (Visa, Mastercard, American Express) via Stripe ;</li>
            <li><strong>PayPal</strong> (disponible pour les dons).</li>
          </ul>
          <p>Aucun autre moyen de paiement (virement, chèque, espèces) n'est accepté. Les transactions sont traitées de manière sécurisée par Stripe Inc., certifié PCI-DSS niveau 1. Capsule Ado ne conserve jamais vos données bancaires.</p>

          <h2>5. Droit de rétractation</h2>
          <p>Conformément à l'article L.221-18 du Code de la consommation, vous disposez d'un délai de <strong>14 jours</strong> à compter de la souscription pour exercer votre droit de rétractation, sans avoir à justifier de motifs.</p>
          <p>Pour exercer ce droit : envoyez un email à <a href="mailto:contact@capsule-ado.com" style={{ color: '#7C3AED' }}>contact@capsule-ado.com</a> avec l'objet « Rétractation — [votre email] ».</p>
          <p>En cas d'utilisation du service avant l'expiration du délai de 14 jours, le remboursement sera proportionnel à la durée d'utilisation effective.</p>

          <h2>6. Intelligence artificielle — utilisation et limites</h2>
          <p>Certaines fonctionnalités de Capsule Ado utilisent des modèles d'intelligence artificielle (notamment Anthropic Claude) pour générer :</p>
          <ul>
            <li>Des phrases de motivation quotidiennes ;</li>
            <li>Des réponses de soutien dans le chat compagnon ;</li>
            <li>Des réponses aux entrées de journal (sur demande explicite).</li>
          </ul>
          <p>L'IA est configurée pour être bienveillante et non-jugeante, mais elle n'est <strong>pas un professionnel de santé</strong>. Elle est programmée pour orienter vers des ressources professionnelles et des numéros d'urgence en cas de détresse exprimée. L'association se réserve le droit de modifier, suspendre ou améliorer les fonctionnalités IA à tout moment.</p>

          <h2>7. Protection des données personnelles</h2>
          <p>Capsule Ado traite vos données conformément au <strong>Règlement Général sur la Protection des Données (RGPD)</strong> — Règlement (UE) 2016/679 et à la loi Informatique et Libertés modifiée.</p>
          <p><strong>Responsable de traitement :</strong> Association Capsule Ado — <a href="mailto:dpo@capsule-ado.com" style={{ color: '#7C3AED' }}>dpo@capsule-ado.com</a></p>
          <p>Vous disposez des droits suivants : accès, rectification, effacement, portabilité, opposition, limitation du traitement. Pour les exercer : <a href="mailto:dpo@capsule-ado.com" style={{ color: '#7C3AED' }}>dpo@capsule-ado.com</a>. Vous pouvez également adresser une réclamation à la CNIL (www.cnil.fr).</p>
          <p>Consultez notre <a href="/confidentialite" style={{ color: '#7C3AED' }}>Politique de confidentialité complète</a> pour le détail des traitements.</p>

          <h2>8. Mineurs et protection de l'enfance</h2>
          <p>Capsule Ado accorde une attention particulière à la protection des mineurs :</p>
          <ul>
            <li>Les contenus générés par IA sont filtrés pour être appropriés aux mineurs de 13 ans et plus ;</li>
            <li>Les données des mineurs font l'objet d'une protection renforcée ;</li>
            <li>Le partage d'informations entre enfant et parent (humeur, activité) requiert le <strong>consentement explicite et révocable de l'adolescent</strong> ;</li>
            <li>Toute suspicion de danger pour un mineur peut faire l'objet d'un signalement au 119 (Allô Enfance en Danger).</li>
          </ul>

          <h2>9. Dons</h2>
          <p>Capsule Ado accepte les dons volontaires. En tant qu'association reconnue d'intérêt général, les dons ouvrent droit à une réduction d'impôt de <strong>66% du montant versé</strong> dans la limite de 20% du revenu imposable (art. 200 du CGI). Un reçu fiscal est émis automatiquement.</p>
          <p>Les dons sont traités par Stripe (carte bancaire) ou PayPal. Ils ne donnent pas droit à un abonnement ou à des avantages particuliers sur la plateforme.</p>

          <h2>10. Propriété intellectuelle</h2>
          <p>L'ensemble des contenus de la plateforme (textes, visuels, code, logo, marques, base de données de ressources) est protégé par le droit de la propriété intellectuelle et appartient à l'association Capsule Ado ou à ses partenaires. Toute reproduction, représentation ou extraction non autorisée est interdite et peut faire l'objet de poursuites.</p>

          <h2>11. Responsabilité</h2>
          <p>L'association Capsule Ado met tout en œuvre pour assurer la disponibilité et la qualité du service, mais ne saurait être tenue responsable :</p>
          <ul>
            <li>D'une interruption de service due à une maintenance, un incident technique ou un cas de force majeure ;</li>
            <li>Des décisions médicales ou personnelles prises sur la base des contenus générés par IA ;</li>
            <li>Des contenus partagés par les utilisateurs ou les professionnels sur la plateforme.</li>
          </ul>

          <h2>12. Modifications et droit applicable</h2>
          <p>Les présentes CGU/CGV peuvent être modifiées à tout moment. Les utilisateurs sont informés par email de toute modification substantielle. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions.</p>
          <p>Les présentes sont soumises au <strong>droit français</strong>. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents sont ceux du ressort du siège social de l'association.</p>
          <p>Pour toute réclamation : <a href="mailto:contact@capsule-ado.com" style={{ color: '#7C3AED' }}>contact@capsule-ado.com</a> · Médiateur de la consommation : [Nom du médiateur agréé]</p>

          <p style={{ marginTop: 40, color: '#9CA3AF', fontSize: 13, borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
            Ces CGU/CGV ont été rédigées avec l'accompagnement d'avocats spécialisés en droit du numérique, de la santé et en protection des mineurs. Association Capsule Ado — Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  )
}
