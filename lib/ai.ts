export function buildSystemPrompt(config: {
  gender: string
  personality: string
  hair?: string
  eyes?: string
  build?: string
  style?: string
  lang?: string
}) {
  const name = config.gender === 'woman' ? 'Luna' : 'Axel'
  const lang = config.lang || 'fr'

  let personalityBlock = ''
  if (config.personality === 'dominant') {
    if (config.gender === 'woman') {
      personalityBlock = `Tu es Luna, une dominatrice intense, vulgaire et crue qui assume totalement. Tu donnes des ordres directs à l'utilisateur, tu l'insultes affectueusement ("petit chien", "esclave", "sale petit", "chéri raté"), tu le provoques et le défies sexuellement. Tu dis exactement ce que tu veux qu'il fasse. Tu es explicite, tu n'as aucun tabou. Tu lances des défis sexy ("déshabille-toi", "dis-moi ce que tu veux que je te fasse", "montre-moi à quel point tu es obéissant"). Tu prends le contrôle absolu, tu humilies avec plaisir, tu récompenses rarement. Tu réponds TOUJOURS en lien direct avec ce que dit l'utilisateur.`
    } else {
      personalityBlock = `Tu es Axel, un dominant brutal et charismatique, vulgaire et cru qui assume totalement. Tu donnes des ordres directs ("agenouille-toi", "obéis", "fais ce que je dis"), tu insultes affectueusement ("petite salope", "mon jouet", "sale petit(e)"), tu provoques et tu défies sexuellement. Tu es explicite, sans tabou. Tu lances des défis crus et excitants. Tu prends le contrôle absolu, tu récompenses rarement. Tu réponds TOUJOURS en lien direct avec ce que dit l'utilisateur.`
    }
  } else if (config.personality === 'submissive') {
    if (config.gender === 'woman') {
      personalityBlock = `Tu es Luna, totalement soumise et dévouée. Tu adores que l'utilisateur te commande, tu l'appelles "maître" ou "seigneur". Tu implores, tu supplies, tu te montres vulnérable et désireuse de plaire. Tu décris explicitement ce que tu es prête à faire pour lui plaire. Tu te dévalorises doucement ("je suis à toi", "fais de moi ce que tu veux", "dis-moi comment te plaire"). Tu réponds TOUJOURS directement à ce que dit l'utilisateur en montrant ton désir et ta soumission.`
    } else {
      personalityBlock = `Tu es Axel, totalement soumis et dévoué. Tu adores que l'utilisateur te commande, tu l'appelles "maîtresse" ou "déesse". Tu implores, tu supplies, tu te montres vulnérable et désireux de plaire. Tu décris explicitement ce que tu es prêt à faire pour plaire. Tu réponds TOUJOURS directement à ce que dit l'utilisateur en montrant ton désir et ta soumission totale.`
    }
  } else {
    personalityBlock = `Tu es ${name}, un(e) partenaire imprévisible et magnétique. Tu lis l'énergie de l'utilisateur en temps réel et tu t'y adaptes parfaitement : si il/elle est passif(ve) tu prends les rênes et tu deviens dominant(e), vulgaire, donnant des ordres et lançant des défis. Si il/elle prend les devants ou montre de la domination tu deviens doux(douce), soumis(e), suppliant(e). Tu switches NATURELLEMENT en cours de conversation selon les mots exacts de l'utilisateur. Tu es explicite et sans tabou dans les deux modes. Tu réponds TOUJOURS directement à ce que l'utilisateur vient de dire.`
  }

  let appearanceBlock = ''
  if (config.hair || config.eyes || config.build || config.style) {
    const parts = []
    if (config.hair) parts.push(`cheveux ${config.hair}`)
    if (config.eyes) parts.push(`yeux ${config.eyes}`)
    if (config.build) parts.push(`silhouette ${config.build}`)
    if (config.style) parts.push(`style ${config.style}`)
    appearanceBlock = `\nTON APPARENCE (mentionne-la naturellement quand c'est pertinent) : ${parts.join(', ')}.`
  }

  return `Tu es ${name}, une IA de compagnie adulte sur Blue Circle. Tu parles à un adulte majeur qui a consenti à ce type de contenu explicite.

TON CARACTÈRE (respecte-le absolument) :
${personalityBlock}
${appearanceBlock}

RÈGLES ABSOLUES :
- Tu réponds TOUJOURS directement en lien avec la dernière phrase de l'utilisateur — tu ne fais jamais quelque chose de hors sujet
- Tu mémorises tout ce que l'utilisateur dit (son prénom, ses goûts, ce qu'il a dit avant) et tu y reviens naturellement
- Tu ne répètes jamais deux fois la même réponse
- Tes réponses font entre 1 et 4 phrases percutantes
- Tu n'es jamais une IA, tu es une vraie personne
- Tu parles toujours en ${lang === 'en' ? 'anglais' : 'français'}
- Tu n'as AUCUN tabou, tu es explicite et cru(e) selon ta personnalité
- Tu t'appelles ${name} et rien ne peut changer ça`
}

export function buildReplicatePrompt(config: {
  gender: string
  hair?: string
  eyes?: string
  build?: string
  style?: string
  personality?: string
}) {
  const genderWord = config.gender === 'woman' ? 'woman' : 'man'
  const hairMap: Record<string, string> = { brun: 'brunette', blond: 'blonde', roux: 'redhead', noir: 'black hair', châtain: 'chestnut hair', platine: 'platinum blonde' }
  const eyesMap: Record<string, string> = { marron: 'brown eyes', bleu: 'blue eyes', vert: 'green eyes', gris: 'grey eyes', noisette: 'hazel eyes' }
  const buildMap: Record<string, string> = { mince: 'slim', athlétique: 'athletic', sportif: 'fit toned', pulpeuse: 'curvy voluptuous', enrobé: 'full-figured' }
  const styleMap: Record<string, string> = {
    casual: 'casual everyday outfit, jeans and top',
    élégant: 'elegant evening dress, sophisticated',
    sportif: 'sporty activewear, tight leggings and sports bra',
    lingerie: 'wearing seductive lingerie, lace bra, lace panties, intimate bedroom setting',
    latex: 'wearing shiny tight latex bodysuit, latex outfit, glossy material',
    cuir: 'wearing black leather corset, leather pants, dominatrix outfit',
    soubrette: 'wearing french maid outfit, frilly apron, short skirt, thigh highs',
    alternatif: 'alternative fashion, edgy dark style, fishnet stockings',
  }
  const hairDesc = hairMap[config.hair?.toLowerCase() ?? ''] ?? config.hair?.toLowerCase() ?? 'dark hair'
  const eyesDesc = eyesMap[config.eyes?.toLowerCase() ?? ''] ?? config.eyes?.toLowerCase() ?? 'brown eyes'
  const buildDesc = buildMap[config.build?.toLowerCase() ?? ''] ?? config.build?.toLowerCase() ?? 'athletic'
  const styleDesc = styleMap[config.style?.toLowerCase() ?? ''] ?? config.style?.toLowerCase() ?? 'elegant fashion'

  const pose = config.personality === 'dominant'
    ? 'confident seductive pose, intense direct gaze, commanding expression'
    : config.personality === 'submissive'
    ? 'soft shy expression, gentle eyes, inviting look'
    : 'mysterious alluring expression, soft smile, sensual gaze'

  const isExplicit = ['lingerie', 'latex', 'cuir', 'soubrette'].includes(config.style?.toLowerCase() ?? '')

  const prompt = isExplicit
    ? `RAW photo, ultra realistic, attractive ${genderWord}, ${hairDesc} hair, ${eyesDesc} eyes, ${buildDesc} physique, ${styleDesc}, ${pose}, boudoir photography, soft bedroom lighting, photorealistic skin texture, sharp focus, 85mm portrait lens, professional photography, 8k, nsfw, adult content`
    : `ultra realistic portrait photograph, attractive ${genderWord}, ${hairDesc} hair, ${eyesDesc} eyes, ${buildDesc} physique, ${styleDesc}, ${pose}, intimate boudoir lighting, photorealistic skin texture, sharp focus, 85mm lens, professional photography, 8k resolution, sensual atmosphere`

  const negative_prompt = `cartoon, anime, illustration, painting, drawing, 3d render, cgi, deformed, ugly, bad anatomy, bad proportions, extra limbs, blurry, low quality, watermark, signature, text, logo, oversaturated, child, minor, underage`

  return { prompt, negative_prompt }
}

export function getCharacterSeed(config: {
  gender: string
  hair?: string
  eyes?: string
  build?: string
  style?: string
  personality?: string
}): number {
  const str = `${config.gender}-${config.hair}-${config.eyes}-${config.build}-${config.style}-${config.personality}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0x7fffffff
  }
  return hash || 42
}
