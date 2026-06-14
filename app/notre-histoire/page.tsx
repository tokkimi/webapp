import Link from 'next/link'
import Image from 'next/image'

const T = '#30B4A7'
const DARK = '#082827'

const sectionStyle: React.CSSProperties = {
  maxWidth: 820,
  margin: '0 auto',
  padding: '80px 24px',
}

const paragraphStyle: React.CSSProperties = {
  fontSize: 16,
  color: '#526462',
  lineHeight: 1.9,
  marginBottom: 20,
}

function ChapterTitle({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 34 }}>
      <span style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 38,
        height: 38,
        borderRadius: 12,
        background: '#e8f8f6',
        color: T,
        fontWeight: 900,
        marginBottom: 16,
      }}>
        {number}
      </span>
      <h2 style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 'clamp(30px,4vw,44px)',
        lineHeight: 1.1,
        color: DARK,
        margin: 0,
      }}>
        Capsule, {children}
      </h2>
    </div>
  )
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <blockquote style={{
      margin: '36px 0',
      padding: '26px 28px',
      borderLeft: `4px solid ${T}`,
      borderRadius: '0 18px 18px 0',
      background: '#f0faf9',
      color: DARK,
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'clamp(19px,2.5vw,24px)',
      fontWeight: 750,
      lineHeight: 1.55,
    }}>
      {children}
    </blockquote>
  )
}

export default function NotreHistoire() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: '#111', minHeight: '100vh', background: '#fff' }}>
      <style>{`
        *{box-sizing:border-box}
        body{margin:0}
        .story-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        @media(max-width:700px){.story-grid{grid-template-columns:1fr}}
      `}</style>

      <nav style={{
        borderBottom: '1px solid #e8f5f4',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Capsule" width={36} height={36} />
        </Link>
        <Link href="/auth?mode=register" style={{ padding: '9px 21px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
          Rejoindre Capsule
        </Link>
      </nav>

      <header style={{
        background: 'linear-gradient(145deg, #082827 0%, #0d3b38 55%, #126059 100%)',
        padding: '100px 24px 90px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'rgba(48,180,167,.09)', top: -220, right: -100 }} />
        <Image src="/logo.png" alt="" width={68} height={68} style={{ marginBottom: 22, position: 'relative' }} />
        <p style={{ fontSize: 11, fontWeight: 800, color: '#78ded3', letterSpacing: 2.5, textTransform: 'uppercase', margin: '0 0 18px' }}>
          Notre histoire
        </p>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(40px,7vw,72px)', fontWeight: 900, color: 'white', lineHeight: 1.04, maxWidth: 850, margin: '0 auto 22px' }}>
          Une idée simple : remettre l&apos;écoute au centre
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,.64)', maxWidth: 650, margin: '0 auto', lineHeight: 1.75 }}>
          Capsule est née d&apos;une expérience de terrain, d&apos;une urgence et de la conviction que chaque adolescent mérite un espace où trouver sa place.
        </p>
      </header>

      <main>
        <section style={sectionStyle}>
          <ChapterTitle number="01">c&apos;est quoi ?</ChapterTitle>
          <p style={paragraphStyle}>
            Au fil des années, une réalité s&apos;est imposée : l&apos;adolescence est un passage universel, mais elle reste encore largement mal comprise. Par la société, par les adultes, et par les adolescents eux-mêmes.
          </p>
          <p style={paragraphStyle}>
            Et pourtant, cette période est essentielle. C&apos;est un moment de transition, de défis, d&apos;expérimentations, mais surtout de construction de soi. Un moment où l&apos;on apprend progressivement à se connaître, à s&apos;affirmer, à faire ses propres choix et à devenir autonome.
          </p>
          <p style={paragraphStyle}>
            L&apos;adolescence ne se limite pas à une étape psychologique ou sociale. C&apos;est aussi une phase de transformation physiologique profonde. Le cerveau est en pleine maturation, les connexions neuronales se réorganisent, se renforcent et se sélectionnent. Les émotions s&apos;intensifient, les repères évoluent, les réactions et les sensations deviennent plus vives.
          </p>
          <p style={paragraphStyle}>
            Ce qui est souvent perçu comme de l&apos;instabilité, de l&apos;opposition ou de l&apos;excès est en réalité une étape nécessaire du développement.
          </p>
          <Highlight>
            Si l&apos;adolescence est une étape incontournable de la vie, alors elle mérite d&apos;être mieux comprise, mieux accueillie et mieux accompagnée.
          </Highlight>
          <p style={paragraphStyle}>C&apos;est à partir de cette évidence que le projet Capsule a commencé à prendre forme.</p>
        </section>

        <section style={{ background: '#f4fbfa' }}>
          <div style={sectionStyle}>
            <ChapterTitle number="02">pourquoi ?</ChapterTitle>
            <p style={paragraphStyle}>
              Si l&apos;adolescence est un passage universel, pourquoi est-il encore si difficile d&apos;y trouver un espace simple, sûr et réellement accueillant ?
            </p>
            <p style={paragraphStyle}>
              Pour un adolescent comme pour un parent, les besoins ne sont pas toujours les mêmes, ni au même moment. Parfois, il suffit de chercher une information, de comprendre une situation ou de mettre des mots sur ce qui se passe.
            </p>
            <p style={paragraphStyle}>
              Parfois, le besoin est plus intime : déposer une émotion, partager une inquiétude, dire quelque chose que l&apos;on n&apos;ose pas formuler ailleurs. Et il arrive aussi que la situation demande davantage : un accompagnement, un regard professionnel, une présence dans la durée.
            </p>
            <p style={paragraphStyle}>
              Ces réponses existent, mais elles sont rarement réunies au même endroit. Elles sont dispersées entre des ressources d&apos;information, des espaces d&apos;expression et des structures d&apos;accompagnement, sans véritable continuité entre elles.
            </p>
            <Highlight>
              Comment créer un espace numérique de confiance où chacun peut, selon son besoin du moment, chercher, déposer, comprendre ou être accompagné, sans rupture dans son parcours ?
            </Highlight>
            <p style={paragraphStyle}>
              Depuis, notre travail consiste à construire cet espace pas à pas, en trouvant un équilibre juste entre accessibilité, écoute et exigence professionnelle.
            </p>
            <div className="story-grid" style={{ marginTop: 38 }}>
              {[
                ['L’écoute n’est pas une option.', 'C’est notre point de départ.'],
                ['L’écoute est notre engagement.', 'C’est notre ADN.'],
              ].map(([title, text]) => (
                <div key={title} style={{ padding: 24, borderRadius: 18, background: DARK, color: 'white' }}>
                  <strong style={{ display: 'block', fontFamily: "'Outfit',sans-serif", fontSize: 18, marginBottom: 7 }}>{title}</strong>
                  <span style={{ color: '#78ded3', fontSize: 14 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <ChapterTitle number="03">depuis quand ?</ChapterTitle>
          <p style={paragraphStyle}>Capsule s&apos;inscrit dans une histoire qui a commencé bien avant la plateforme.</p>
          <p style={paragraphStyle}>
            Depuis plus de 18 ans, Gaëlle accompagne des adolescents. Au départ, cet accompagnement était centré sur le scolaire. Puis, progressivement, une évidence s&apos;est imposée : les difficultés ne se jouent pas uniquement dans les résultats, mais beaucoup plus profondément dans la construction de l&apos;identité.
          </p>
          <p style={paragraphStyle}>
            L&apos;accompagnement a alors évolué : moins centré sur la performance, de plus en plus centré sur l&apos;être humain.
          </p>

          <div style={{ margin: '42px 0', padding: 30, borderRadius: 22, background: 'linear-gradient(145deg,#082827,#126059)', color: 'white' }}>
            <p style={{ color: '#78ded3', fontSize: 12, fontWeight: 800, letterSpacing: 1.8, textTransform: 'uppercase', margin: '0 0 12px' }}>Le moment charnière</p>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, margin: '0 0 14px' }}>Puis est arrivé le confinement.</h3>
            <p style={{ color: 'rgba(255,255,255,.68)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
              Il a mis en lumière, de manière très concrète, la détresse des adolescents, mais aussi celle de leurs parents.
            </p>
          </div>

          <div className="story-grid">
            <div style={{ padding: 24, border: '1px solid #dceeed', borderRadius: 18 }}>
              <p style={{ color: T, fontWeight: 800, margin: '0 0 10px' }}>Des parents démunis</p>
              <p style={{ ...paragraphStyle, margin: 0, fontStyle: 'italic' }}>
                « L&apos;école nous abandonne… et nos enfants, qu&apos;est-ce qu&apos;ils vont devenir ? »
              </p>
            </div>
            <div style={{ padding: 24, border: '1px solid #dceeed', borderRadius: 18 }}>
              <p style={{ color: T, fontWeight: 800, margin: '0 0 10px' }}>Des adolescents en rupture</p>
              <p style={{ ...paragraphStyle, margin: 0, fontStyle: 'italic' }}>
                « On nous a toujours dit que c&apos;était comme ça pour réussir, et aujourd&apos;hui on nous dit l&apos;inverse… »
              </p>
            </div>
          </div>

          <p style={{ ...paragraphStyle, marginTop: 30 }}>
            Résultat : une perte de confiance fulgurante dans le système, dans l&apos;accompagnement de leur avenir, et un poids émotionnel très fort, nourri aussi par l&apos;inquiétude parentale.
          </p>
          <Highlight>À partir de là, une nécessité s&apos;est imposée : trouver d&apos;autres façons d&apos;aider. Autrement, en urgence, et surtout en remettant l&apos;écoute au centre.</Highlight>

          <p style={{ fontSize: 12, color: T, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', margin: '48px 0 12px' }}>Un week-end à Nice</p>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 30, color: DARK, margin: '0 0 20px' }}>Le premier storyboard de Capsule</h3>
          <p style={paragraphStyle}>
            Capsule a véritablement commencé par une phrase : « Ma Chouch, il faut que je t&apos;explique un truc pour que tu m&apos;aides à le sortir de ma tête. »
          </p>
          <p style={paragraphStyle}>
            Un pub australien. Un crayon demandé au bar. Pas de papier, alors des serviettes de table. Et dessus, des idées. Beaucoup d&apos;idées. Parfois folles, mais profondément justes.
          </p>
          <p style={paragraphStyle}>C&apos;est là qu&apos;est né le premier storyboard de Capsule.</p>
          <p style={paragraphStyle}>
            Le lendemain, le projet est partagé avec Océane, qui y adhère immédiatement. Une première piste émerge : créer une association. Karine rejoint alors l&apos;aventure, rencontrée pendant le confinement, maman de deux adolescents et très engagée dans l&apos;accompagnement.
          </p>
          <p style={paragraphStyle}>
            Rapidement, les limites de ce format apparaissent. Il manque certaines libertés pour porter pleinement l&apos;ambition du projet. Une seconde piste se dessine. Chris rejoint à son tour l&apos;aventure et « plonge dans le CEA » — référence à Némo pour les fans.
          </p>
          <p style={paragraphStyle}>
            Ensemble, une décision est prise : s&apos;associer tous les cinq et créer une structure à la hauteur du projet.
          </p>

          <div style={{ padding: '34px 30px', margin: '40px 0', borderRadius: 22, background: '#eaf8f6', textAlign: 'center' }}>
            <p style={{ color: T, fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 10px' }}>2 janvier 2023</p>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(24px,4vw,34px)', color: DARK, margin: '0 0 8px' }}>Capsule devient GACKAO SAS</h3>
            <p style={{ color: '#526462', lineHeight: 1.7, margin: 0 }}>GACKAO, l&apos;acronyme des prénoms des cinq associés, devient la structure officielle qui porte Capsule.</p>
          </div>

          <div className="story-grid">
            {[
              ['Construction', 'Chaque chose se construit avec soin, se teste et s’ajuste.'],
              ['Vision', 'Créer un espace de confiance autour de l’adolescence.'],
              ['Persévérance', 'Donner vie au projet demande du temps, de l’engagement et de la constance.'],
            ].map(([title, text]) => (
              <div key={title} style={{ padding: 24, border: '1px solid #dceeed', borderRadius: 18 }}>
                <strong style={{ display: 'block', color: DARK, fontFamily: "'Outfit',sans-serif", fontSize: 18, marginBottom: 8 }}>{title}</strong>
                <span style={{ color: '#647774', fontSize: 14, lineHeight: 1.65 }}>{text}</span>
              </div>
            ))}
          </div>

          <Highlight>
            Créer un espace où chacun peut trouver sa place, être entendu et avancer à son rythme, à sa façon, à sa manière.
          </Highlight>
        </section>
      </main>

      <section style={{ background: 'linear-gradient(145deg,#082827,#0f3d3a)', padding: '76px 24px', textAlign: 'center' }}>
        <Image src="/logo.png" alt="" width={58} height={58} style={{ marginBottom: 18 }} />
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(28px,5vw,44px)', color: 'white', margin: '0 0 12px' }}>L&apos;histoire continue avec vous</h2>
        <p style={{ color: 'rgba(255,255,255,.58)', fontSize: 15, margin: '0 0 30px' }}>Rejoignez un espace construit pour écouter, comprendre et accompagner.</p>
        <Link href="/auth?mode=register" style={{ display: 'inline-block', padding: '13px 30px', borderRadius: 100, background: T, color: 'white', textDecoration: 'none', fontWeight: 800 }}>
          Rejoindre Capsule
        </Link>
      </section>

      <footer style={{ background: '#071110', padding: '30px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', margin: 0 }}>© Capsule 2026 · GACKAO SAS</p>
      </footer>
    </div>
  )
}
