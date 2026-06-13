import type { CSSProperties, ReactNode } from 'react'

export default function CGV() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', color: '#d1d5db' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/" style={{ fontSize: 13, color: 'rgb(127,217,208)', textDecoration: 'none', fontWeight: 500 }}>← Retour</a>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: '#f3f4f6', margin: '24px 0 8px' }}>
          Conditions Générales de Services
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px' }}>Version à jour au 25 août 2025</p>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 48px' }}>Exploité par GACKAO SAS — capsule-ado.com</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <Section title="Mentions légales">
            <p>Le site capsule-ado.com est la propriété de <strong>GACKAO SAS</strong>.</p>
            <p><strong>Identification de l'éditeur</strong><br />
            Capsule est porté par la SAS GACKAO, domiciliée chez Now Coworking, 105b Allée François Mitterrand 76100 ROUEN<br />
            Contact téléphonique : 06.76.85.31.51<br />
            Email : info@capsule-ado.com<br />
            SIREN : 922 641 766 — Numéro de TVA : FR46922641766<br />
            Immatriculée au RCS de Rouen (76 — France)<br />
            Code APE : 6312Z — Portails Internet<br />
            Capital social : 20 000 €</p>
            <p><strong>Directrice de la publication :</strong> Gaëlle Pelloille, Présidente de la SAS GACKAO</p>
            <p><strong>Hébergement :</strong><br />
            AZ Network — 2 Rue Kellermann 59100 ROUBAIX<br />
            SAS au capital de 10 174 560 € — Téléphone : 08.99.70.17.61</p>
          </Section>

          <Section title="Article 1 — Dispositions liminaires">
            <h3 style={h3}>1.1 Identification</h3>
            <p>Vous êtes actuellement sur la plateforme <strong>« CAPSULE »</strong>, exploitée par la société <strong>GACKAO</strong>, société par actions simplifiée au capital social de 20 000 euros, dont le siège social est sis 105b Allée François Mitterrand – 76100 ROUEN, immatriculée au RCS de ROUEN sous le numéro unique 922 641 766, représentée par Madame Gaëlle PELLOILLE, en sa qualité de Présidente.</p>

            <h3 style={h3}>1.2 Définitions</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
              <thead><tr>
                <th style={{ border: '1px solid #374151', padding: '8px 12px', textAlign: 'left', background: '#111111', color: '#f3f4f6' }}>Terme</th>
                <th style={{ border: '1px solid #374151', padding: '8px 12px', textAlign: 'left', background: '#111111', color: '#f3f4f6' }}>Définition</th>
              </tr></thead>
              <tbody>
                {[
                  ['Bénéficiaire', 'Tout Utilisateur ayant créé un compte afin de bénéficier des services de la Plateforme et des Professionnels.'],
                  ['Plateforme', "L'ensemble logiciel accessible en ligne sur le site ou via une application dédiée et offrant des services aux Utilisateurs."],
                  ['Services', "Les services proposés par GACKAO aux Utilisateurs par l'intermédiaire de la Plateforme tels qu'ils sont listés à l'Article 3."],
                  ['Utilisateur', 'Toute personne physique ayant créé un compte personnel sur la Plateforme et accepté les présentes Conditions Générales.'],
                ].map(([t, d], i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #374151', padding: '8px 12px', fontWeight: 600, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{t}</td>
                    <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={h3}>1.3 Accès au site</h3>
            <p>La Plateforme est d'accès libre et gratuit à tout Utilisateur afin de lui permettre d'accéder aux Services. Elle est accessible 24h/24 et 7j/7. La responsabilité de GACKAO ne pourra être recherchée sur la base de tout dysfonctionnement relevant d'un cas de force majeure.</p>

            <h3 style={h3}>1.4 Inscription d'un Utilisateur</h3>
            <p>Pour accéder aux Services réservés, tout utilisateur doit s'inscrire en remplissant le formulaire prévu à cet effet, en fournissant des informations sincères et exactes. L'acceptation des Conditions Générales est matérialisée en cochant la case : <em>« Je reconnais avoir lu et compris les Conditions Générales et je les accepte. »</em></p>
            <p>L'inscription d'un Utilisateur Professionnel ne sera considérée comme définitive qu'après validation du compte par Capsule.</p>

            <h3 style={h3}>1.5 Nature des Conditions Générales</h3>
            <p>Les présentes CGS ont pour objet de déterminer les modalités de mise à disposition de la Plateforme, d'encadrer leurs conditions d'accès et d'utilisation, et de préciser les conditions des paiements.</p>
            <p>GACKAO se réserve le droit de modifier unilatéralement le contenu des Conditions Générales. Les CGS en vigueur sont accessibles sur le site à l'adresse : capsule-ado.com/cgv</p>

            <h3 style={h3}>1.6 Mentions légales (rappel)</h3>
            <p>L'édition du site est assurée par GACKAO — info@capsule-ado.com. L'hébergeur est AZ Network, 40 rue Ampère – 61000 ALENÇON.</p>
          </Section>

          <Section title="Article 2 — Propriété intellectuelle">
            <h3 style={h3}>2.1 Protection des droits de GACKAO</h3>
            <p>La Plateforme, le Site, l'Application et leur contenu sont la propriété exclusive de GACKAO. Aucun de ces éléments ne peut être utilisé, reproduit, diffusé ou publié sans autorisation écrite préalable.</p>

            <h3 style={h3}>2.2 Publications par les Utilisateurs</h3>
            <p>Les Utilisateurs peuvent publier du contenu dont ils sont titulaires. Tout contenu mis en ligne demeure sous leur seule responsabilité. En publiant, l'Utilisateur cède à GACKAO le droit non exclusif et gratuit de représenter, reproduire, adapter et diffuser sa publication dans le monde entier.</p>

            <h3 style={h3}>2.3 Modération</h3>
            <p>GACKAO se réserve le droit d'exercer une modération sur toute publication et de refuser leur mise en ligne. Toute publication pourra être supprimée, commentée ou modifiée à tout moment et sans motif ni préavis.</p>
          </Section>

          <Section title="Article 3 — Objet">
            <h3 style={h3}>3.1 Objet de la Plateforme</h3>
            <p>La Plateforme a pour objet d'offrir aux Bénéficiaires mineurs ou majeurs la possibilité de bénéficier d'informations et de soutien en rapport avec les thématiques du bien-être physique et mental et de la santé mentale, à destination d'adolescents, de jeunes adultes et de leurs parents, et leur mise en relation avec des professionnels spécialistes du domaine.</p>

            <h3 style={h3}>3.2 Relations entre Bénéficiaires et Professionnels</h3>
            <p>Les Services sont fournis aux Bénéficiaires à titre gratuit, sous réserve des abonnements. L'utilisation des Services est réservée aux Bénéficiaires âgés de plus de quinze (15) ans, sauf conditions spécifiques pour l'Espace Adolescent. Les consultations ne sont pas des services d'urgence — en cas d'urgence, appellez le 15 (SAMU), 3114 (suicide), 119 (enfants en danger).</p>

            <h3 style={h3}>3.3 Plan de la Plateforme</h3>
            <p><strong>Espace adolescents :</strong> Dédié aux Bénéficiaires mineurs. La création d'un compte pour une personne de moins de 15 ans nécessite une autorisation parentale préalable obligatoire.</p>
            <p><strong>Espace jeunes :</strong> Dédié aux Bénéficiaires de 15 ans et plus, avec accès à l'intégralité des Services.</p>
            <p><strong>Espace parents :</strong> Dédié aux Bénéficiaires majeurs pouvant rattacher le compte d'un ou plusieurs mineurs, sur présentation de justificatifs appropriés.</p>
            <p><strong>Espace professionnel :</strong> Dédié aux Professionnels ayant un compte dûment validé par GACKAO après vérification des justificatifs.</p>

            <h3 style={h3}>3.4 Services proposés</h3>
            <p>La Plateforme propose notamment : prise de rendez-vous, messagerie sécurisée, médiathèque, annuaire de professionnels, agenda, journal intime chiffré, notes, timer/alertes personnalisées.</p>
          </Section>

          <Section title="Article 4 — Compte Utilisateur — Sécurité">
            <p>L'accès aux Services est conditionné à la création d'un compte. L'Utilisateur s'engage à fournir des informations exactes et complètes, à ne pas créer de fausse identité, et à maintenir la confidentialité de ses identifiants.</p>
            <p>GACKAO se réserve le droit de vérifier l'identité de tout Utilisateur, notamment par transmission de pièce d'identité. En cas de fausses informations, GACKAO peut suspendre ou supprimer le compte sans préavis.</p>
            <p>En cas de perte ou vol des identifiants, l'Utilisateur doit informer sans délai GACKAO à l'adresse : info@capsule-ado.com</p>
          </Section>

          <Section title="Article 5 — Paiement">
            <h3 style={h3}>5.1 Dispositions générales</h3>
            <p>Tous les règlements sont payables exclusivement en euros, par carte bancaire (Carte Bleue, Visa, Mastercard) via la plateforme Stripe, ou par PayPal. GACKAO se réserve le droit de modifier les moyens de paiement disponibles à tout moment.</p>

            <h3 style={h3}>5.2 Droit de rétractation</h3>
            <p>Tout Bénéficiaire consommateur peut bénéficier d'un droit de rétractation dans le cadre de la conclusion d'un contrat avec un Professionnel, conformément à la loi. Tout remboursement découlant de l'exercice de ce droit doit être sollicité directement auprès du Professionnel concerné.</p>

            <h3 style={h3}>5.3 Modalités de paiement</h3>
            <p>Les Bénéficiaires peuvent régler par :</p>
            <ul>
              <li>Carte bancaire ;</li>
              <li>Compte prépayé alimenté par un paiement préalable par carte bancaire.</li>
            </ul>
            <p>GACKAO recourt au service <strong>Stripe Connect</strong> pour la gestion des paiements. Les fonds sont encaissés et conservés directement par Stripe jusqu'à leur reversement au Professionnel. GACKAO n'est à aucun moment dépositaire de ces fonds.</p>

            <h3 style={h3}>5.4 Abonnement pour les Professionnels</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
              <thead><tr>
                <th style={{ border: '1px solid #374151', padding: '8px 12px', background: '#111111', color: '#f3f4f6', textAlign: 'left' }}></th>
                <th style={{ border: '1px solid #374151', padding: '8px 12px', background: '#111111', color: '#f3f4f6', textAlign: 'left' }}>Tarif HT</th>
                <th style={{ border: '1px solid #374151', padding: '8px 12px', background: '#111111', color: '#f3f4f6', textAlign: 'left' }}>Tarif TTC</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>Abonnement mensuel</td>
                  <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>82,50 €/mois</td>
                  <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>99,00 €/mois</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>Frais d'inscription unique</td>
                  <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>41,67 €</td>
                  <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>50,00 €</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: 13, marginTop: 8 }}>GACKAO se réserve le droit de réviser le montant de l'abonnement avec un préavis de deux mois.</p>

            <h3 style={h3}>5.5 Abonnement pour les Bénéficiaires</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
              <thead><tr>
                <th style={{ border: '1px solid #374151', padding: '8px 12px', background: '#111111', color: '#f3f4f6', textAlign: 'left' }}>Formule</th>
                <th style={{ border: '1px solid #374151', padding: '8px 12px', background: '#111111', color: '#f3f4f6', textAlign: 'left' }}>Tarif TTC/mois</th>
              </tr></thead>
              <tbody>
                {[
                  ['1er compte', '9,99 €'],
                  ['2e compte', '6,99 €'],
                  ['Chaque compte supplémentaire', '3,99 €'],
                ].map(([f, t], i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>{f}</td>
                    <td style={{ border: '1px solid #374151', padding: '8px 12px' }}>{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 13, marginTop: 8 }}>Abonnement mensuel, renouvelable par tacite reconduction, résiliable à tout moment sans préavis ni frais. La résiliation est effective à la fin du mois engagé.</p>

            <h3 style={h3}>5.6 Paiement des consultations</h3>
            <p>Le règlement s'effectue exclusivement par carte bancaire au moment de la prise de rendez-vous via Stripe Connect. Frais de traitement Stripe : 1,5% + 0,25€ par transaction (à la charge du Professionnel). Le reversement intervient le lendemain ouvrable suivant la réalisation de la consultation.</p>
          </Section>

          <Section title="Article 6 — Données personnelles & Cookies">
            <h3 style={h3}>6.1 Responsable de traitement</h3>
            <p>GACKAO est le responsable de traitement au sens du RGPD pour les données collectées dans le cadre de la gestion de la Plateforme.</p>

            <h3 style={h3}>6.2 Données personnelles collectées</h3>
            <p>Les données collectées sont nécessaires à la bonne administration de la Plateforme : nom, prénom, adresse email, informations de paiement, données de connexion. Elles ne font l'objet d'aucun transfert vers l'étranger et sont conservées pour la durée nécessaire à la bonne administration de l'application.</p>

            <h3 style={h3}>6.3 Droits des utilisateurs</h3>
            <p>Conformément au RGPD, vous disposez des droits d'accès, rectification, opposition, effacement, portabilité et limitation du traitement de vos données. Pour exercer ces droits : <strong>donnees@capsule-ado.com</strong></p>

            <h3 style={h3}>6.4 Données de santé</h3>
            <p>Les données médicales sont hébergées par un prestataire certifié <strong>HDS (Hébergeur de Données de Santé)</strong>, conformément à l'article L.1111-8 du Code de la Santé Publique. Les mineurs âgés d'au moins 15 ans peuvent s'opposer à la communication de leurs données de santé aux titulaires de l'autorité parentale (art. L.1111-5 CSP).</p>

            <h3 style={h3}>6.5 Cookies</h3>
            <p>La Plateforme utilise des cookies pour la mesure d'audience, les fonctionnalités réseaux sociaux, et l'amélioration des services. L'Utilisateur peut modifier ses choix via "Préférences cookies" au bas de chaque page.</p>
          </Section>

          <Section title="Article 7 — Responsabilité">
            <p>GACKAO décline toute responsabilité en cas d'interruption ou d'inaccessibilité de la Plateforme, de dysfonctionnements, ou de dommages résultant d'actes frauduleux de tiers. Les informations communiquées sont présentées à titre indicatif et général sans valeur contractuelle.</p>
            <p>GACKAO ne saurait être tenu responsable d'éventuels virus, ni de dommages résultant d'un cas de force majeure ou du fait imprévisible et insurmontable d'un tiers.</p>
            <p>GACKAO ne peut en aucun cas être tenu responsable de la non-exécution ou mauvaise exécution d'un acte par un Professionnel, du contenu d'une prescription ou des effets ressentis par un Bénéficiaire à l'issue d'une consultation.</p>
          </Section>

          <Section title="Article 8 — Confidentialité">
            <p>GACKAO garantit aux Bénéficiaires la stricte confidentialité des informations partagées pendant toute la durée du contrat.</p>
          </Section>

          <Section title="Article 9 — Déontologie">
            <p>Les Professionnels exercent leur pratique en toute indépendance, selon leurs obligations légales et réglementaires et sous leur responsabilité exclusive. GACKAO n'est en aucun cas responsable d'une quelconque annulation ou indisponibilité d'un Professionnel.</p>
            <p>Les Professionnels soumis à des obligations spécifiques (notamment de santé) s'engagent à s'assurer de la conformité de leur pratique à toute réglementation applicable.</p>
          </Section>

          <Section title="Article 10 — Imprévision">
            <p>Les présentes CGS excluent expressément le régime légal de l'imprévision prévu à l'article 1195 du Code Civil pour tous les Services proposés aux Utilisateurs.</p>
          </Section>

          <Section title="Article 11 — Suspension & Résiliation">
            <h3 style={h3}>11.1 Suspension avec préavis</h3>
            <p>En cas de non-respect des CGS, GACKAO mettra en demeure l'Utilisateur de remédier au défaut dans un délai de sept (7) jours avant de procéder à la suspension de l'accès.</p>

            <h3 style={h3}>11.2 Suspension sans préavis</h3>
            <p>GACKAO se réserve le droit de suspendre immédiatement l'accès en cas de danger grave pressenti ou avéré pour un autre Utilisateur ou pour GACKAO.</p>

            <h3 style={h3}>11.3 Résiliation par un Bénéficiaire</h3>
            <p>Un Bénéficiaire peut à tout moment résilier en demandant la suppression de son compte par email à info@capsule-ado.com ou via son espace personnel (rubrique « Mon compte »). Conformément à son droit de portabilité, l'Utilisateur pourra récupérer ses données en format CSV avant suppression.</p>

            <h3 style={h3}>11.4 Résiliation par un Professionnel</h3>
            <p>Un Professionnel peut solliciter la suppression de son compte par email à info@capsule-ado.com. Il restera redevable de toutes les sommes dues pour la période restante à courir.</p>

            <h3 style={h3}>11.5 Conséquences de la résiliation</h3>
            <p>Toute résiliation entraîne la fin du droit d'accès aux Services et la suppression ou anonymisation de toutes les données Utilisateur, à l'exception des données comptables conservées pendant la durée légale obligatoire.</p>
          </Section>

          <Section title="Article 12 — Droit applicable & Litiges">
            <p>Les présentes CGS sont exclusivement régies par la loi française.</p>
            <p><strong>Entre un Bénéficiaire et GACKAO :</strong> Avant toute action contentieuse, les parties cherchent un accord amiable dans un délai de 30 jours. En cas d'échec, vous pouvez saisir le médiateur de la consommation sur : <a href="https://www.sasmediationsolution-conso.fr" style={{ color: 'rgb(127,217,208)' }}>www.sasmediationsolution-conso.fr</a> ou la plateforme européenne : <a href="https://ec.europa.eu/consumers/odr/" style={{ color: 'rgb(127,217,208)' }}>ec.europa.eu/consumers/odr</a></p>
            <p><strong>Entre un Professionnel et GACKAO :</strong> À défaut d'accord amiable, le litige est soumis au tribunal de commerce de Rouen.</p>
          </Section>

          <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#111111', borderRadius: '12px', border: '1px solid rgba(20,184,166,0.2)' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
              Pour toute question : <a href="mailto:info@capsule-ado.com" style={{ color: 'rgb(127,217,208)' }}>info@capsule-ado.com</a> —
              Données personnelles : <a href="mailto:donnees@capsule-ado.com" style={{ color: 'rgb(127,217,208)' }}>donnees@capsule-ado.com</a> —
              105b Allée François Mitterrand, 76100 ROUEN
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const h3: CSSProperties = {
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 700,
  fontSize: 15,
  color: 'rgb(127,217,208)',
  margin: '1.5rem 0 0.5rem',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '2rem' }}>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: '#f3f4f6', margin: '0 0 1rem' }}>
        {title}
      </h2>
      <div style={{ lineHeight: 1.7, fontSize: 15 }}>
        {children}
      </div>
    </div>
  )
}
