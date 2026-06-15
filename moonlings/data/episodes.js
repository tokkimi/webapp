var moonlingsEpisodes = [
  {
    id: 1,
    season: 1,
    episodeNumber: 1,
    title: "La Rencontre au Lac Étoilé",
    summary: "Mochi se promène seul au bord du Lac Étoilé quand il aperçoit une petite lumière qui danse sur l'eau. C'est Piri, un nouveau Moonling qui vient d'arriver dans la région ! Ensemble, ils découvrent que partager un moment simple peut donner naissance à une belle amitié.",
    moral: "Une amitié peut naître d'une simple rencontre quand on ouvre son cœur.",
    characters: ["Mochi", "Piri"],
    scenes: [
      {
        id: "scene_1",
        location: "Lac Étoilé",
        characters: ["Mochi"],
        action: "Mochi arrive seul au bord du lac et regarde le reflet des étoiles dans l'eau.",
        dialogue: [
          { character: "Mochi", text: "Comme c'est beau ce soir ! Les étoiles dansent sur l'eau." },
          { character: "Mochi", text: "Mais je suis tout seul... Ce serait bien d'avoir un ami pour partager ça." },
          { character: "Mochi", text: "Peut-être qu'une étoile filante exaucera mon vœu ?" },
          { character: "Mochi", text: "Allez, je vais m'asseoir ici et profiter du calme du lac." }
        ]
      },
      {
        id: "scene_2",
        location: "Lac Étoilé",
        characters: ["Mochi", "Piri"],
        action: "Une petite lumière approche de l'autre rive et Piri apparaît timidement.",
        dialogue: [
          { character: "Piri", text: "Oh ! Il y a quelqu'un ici ? Je ne voulais pas vous déranger..." },
          { character: "Mochi", text: "Mais non, tu ne me déranges pas du tout ! Je m'appelle Mochi. Et toi ?" },
          { character: "Piri", text: "Je m'appelle Piri. Je suis nouveau dans ce coin du ciel." },
          { character: "Mochi", text: "Bienvenue au Lac Étoilé, Piri ! C'est l'endroit le plus magique que je connaisse." }
        ]
      },
      {
        id: "scene_3",
        location: "Lac Étoilé",
        characters: ["Mochi", "Piri"],
        action: "Mochi et Piri s'assoient ensemble et observent les reflets dans le lac.",
        dialogue: [
          { character: "Piri", text: "Wahou... Les étoiles brillent tellement fort dans l'eau !" },
          { character: "Mochi", text: "Oui ! Mon endroit préféré, c'est quand la lune se reflète juste là, au milieu." },
          { character: "Piri", text: "Tu viens souvent ici tout seul ?" },
          { character: "Mochi", text: "Avant, oui. Mais maintenant j'espère y venir avec toi !" },
          { character: "Piri", text: "J'aimerais beaucoup ça, Mochi." }
        ]
      },
      {
        id: "scene_4",
        location: "Lac Étoilé",
        characters: ["Mochi", "Piri"],
        action: "Les deux amis font des ricochets avec des petits cailloux lumineux sur le lac.",
        dialogue: [
          { character: "Mochi", text: "Tu veux essayer de faire des ricochets ? Regarde !" },
          { character: "Piri", text: "Oh, je n'ai jamais fait ça ! Comment tu fais ?" },
          { character: "Mochi", text: "Tu tiens le caillou bien plat, comme ça, et tu le lances doucement." },
          { character: "Piri", text: "Un... deux... trois sauts ! J'ai réussi !" },
          { character: "Mochi", text: "Bravo Piri ! Tu es un champion des ricochets !" }
        ]
      },
      {
        id: "scene_5",
        location: "Lac Étoilé",
        characters: ["Mochi", "Piri"],
        action: "Le soir tombe et les deux nouveaux amis se promettent de se retrouver le lendemain.",
        dialogue: [
          { character: "Piri", text: "Il commence à se faire tard... Je dois rentrer." },
          { character: "Mochi", text: "Moi aussi. Mais on peut se retrouver ici demain ?" },
          { character: "Piri", text: "Avec plaisir ! Je suis tellement content de t'avoir rencontré, Mochi." },
          { character: "Mochi", text: "Moi aussi, Piri ! Je crois qu'on va être de grands amis." },
          { character: "Piri", text: "Bonne nuit, Mochi ! À demain !" },
          { character: "Mochi", text: "Bonne nuit, Piri ! Dors bien sous les étoiles !" }
        ]
      }
    ]
  },
  {
    id: 2,
    season: 1,
    episodeNumber: 2,
    title: "Le Secret de la Forêt des Lucioles",
    summary: "Piri confie à Mochi un grand secret : il a peur du noir quand il est seul dans la forêt. Mochi l'accompagne dans la Forêt des Lucioles pour l'aider à surmonter sa peur. Ils découvrent ensemble que la confiance entre amis rend tout plus facile.",
    moral: "Quand on fait confiance à un ami, les peurs deviennent beaucoup plus petites.",
    characters: ["Mochi", "Piri"],
    scenes: [
      {
        id: "scene_1",
        location: "Maison de Mochi",
        characters: ["Mochi", "Piri"],
        action: "Piri rend visite à Mochi et lui avoue qu'il a un secret à lui confier.",
        dialogue: [
          { character: "Piri", text: "Mochi, est-ce que je peux te dire quelque chose d'important ?" },
          { character: "Mochi", text: "Bien sûr, Piri ! Tu peux tout me dire, je suis ton ami." },
          { character: "Piri", text: "Eh bien... j'ai un peu peur du noir. Surtout dans la forêt." },
          { character: "Mochi", text: "Je suis content que tu me l'aies dit. C'est courageux de partager ses peurs." }
        ]
      },
      {
        id: "scene_2",
        location: "Forêt des Lucioles",
        characters: ["Mochi", "Piri"],
        action: "Mochi emmène Piri à l'entrée de la Forêt des Lucioles au crépuscule.",
        dialogue: [
          { character: "Mochi", text: "Je connais l'endroit parfait pour t'aider. Viens avec moi !" },
          { character: "Piri", text: "La forêt... elle est grande. Est-ce qu'on va vraiment y entrer ?" },
          { character: "Mochi", text: "Oui, mais je serai là avec toi. On entre ensemble, d'accord ?" },
          { character: "Piri", text: "D'accord... Je te fais confiance, Mochi." }
        ]
      },
      {
        id: "scene_3",
        location: "Forêt des Lucioles",
        characters: ["Mochi", "Piri"],
        action: "Des lucioles commencent à s'allumer une à une autour d'eux dans la forêt.",
        dialogue: [
          { character: "Piri", text: "Oh ! Qu'est-ce que c'est que ces petites lumières ?" },
          { character: "Mochi", text: "Ce sont les lucioles ! Elles vivent ici et elles illuminent toute la forêt." },
          { character: "Piri", text: "Elles sont magnifiques ! On dirait des étoiles qui dansent parmi les arbres." },
          { character: "Mochi", text: "Exactement ! Et tu vois, la forêt n'est plus si sombre maintenant ?" },
          { character: "Piri", text: "C'est vrai... J'ai beaucoup moins peur !" }
        ]
      },
      {
        id: "scene_4",
        location: "Forêt des Lucioles",
        characters: ["Mochi", "Piri"],
        action: "Une luciole vient se poser sur le bout du nez de Piri et il rit de joie.",
        dialogue: [
          { character: "Piri", text: "Hihihi ! Elle chatouille ! La petite luciole est sur mon nez !" },
          { character: "Mochi", text: "Elle t'aime bien, je crois ! Elle te fait un bisou lumineux." },
          { character: "Piri", text: "Bonjour, petite luciole ! Merci de nous éclairer !" },
          { character: "Mochi", text: "Tu vois Piri, la forêt est pleine de jolies surprises quand on la découvre avec un ami." }
        ]
      },
      {
        id: "scene_5",
        location: "Forêt des Lucioles",
        characters: ["Mochi", "Piri"],
        action: "Les deux amis ressortent de la forêt, Piri rayonnant de fierté.",
        dialogue: [
          { character: "Piri", text: "Mochi, je suis tellement content d'être venu ! Ma peur a presque disparu." },
          { character: "Mochi", text: "Tu as été très courageux, Piri. Je suis fier de toi !" },
          { character: "Piri", text: "C'est grâce à toi que j'ai osé. Merci de m'avoir fait confiance." },
          { character: "Mochi", text: "Et toi, tu m'as fait confiance. C'est ça, l'amitié !" },
          { character: "Piri", text: "La prochaine fois, je pourrai peut-être y aller seul ?" },
          { character: "Mochi", text: "Peut-être ! Mais si tu veux, je serai toujours là pour t'accompagner." }
        ]
      }
    ]
  },
  {
    id: 3,
    season: 1,
    episodeNumber: 3,
    title: "La Machine à Étoiles de Gizo",
    summary: "Gizo, l'inventeur passionné, a fabriqué une machine qui peut capturer des étoiles filantes et les transformer en lumières colorées. Mais la machine fait des bulles au lieu d'étoiles et Gizo ne sait plus quoi faire. En acceptant que son invention soit différente de ce qu'il avait imaginé, Gizo réalise que la créativité mène souvent à de belles surprises.",
    moral: "Être créatif, c'est aussi accepter que les belles surprises viennent quand on les attend le moins.",
    characters: ["Gizo"],
    scenes: [
      {
        id: "scene_1",
        location: "Atelier de Gizo",
        characters: ["Gizo"],
        action: "Gizo travaille dans son atelier encombré de pièces et d'engrenages brillants.",
        dialogue: [
          { character: "Gizo", text: "Voilà ! La machine à étoiles est presque terminée ! Plus qu'un dernier boulon." },
          { character: "Gizo", text: "Cette machine va capturer les étoiles filantes et les transformer en jolies lumières !" },
          { character: "Gizo", text: "Tout le village pourra en profiter. Quelle belle idée j'ai eue !" },
          { character: "Gizo", text: "Allez, un petit tour de clé... et c'est parti !" }
        ]
      },
      {
        id: "scene_2",
        location: "Atelier de Gizo",
        characters: ["Gizo"],
        action: "Gizo appuie sur le bouton de la machine mais elle fait des bulles au lieu de lumières.",
        dialogue: [
          { character: "Gizo", text: "Hmm... ce n'est pas tout à fait ce que j'avais prévu." },
          { character: "Gizo", text: "Des bulles ? Ma machine fait des bulles ? Mais pourquoi ?" },
          { character: "Gizo", text: "Laisse-moi regarder les plans encore une fois... ah zut, j'ai mis le mauvais tuyau !" },
          { character: "Gizo", text: "Je dois trouver comment réparer ça." }
        ]
      },
      {
        id: "scene_3",
        location: "Atelier de Gizo",
        characters: ["Gizo"],
        action: "Gizo essaie plusieurs modifications mais la machine continue de faire des bulles lumineuses et colorées.",
        dialogue: [
          { character: "Gizo", text: "Essai numéro un... toujours des bulles. Essai numéro deux... encore des bulles !" },
          { character: "Gizo", text: "Mais attends... ces bulles sont vraiment jolies. Elles brillent de toutes les couleurs !" },
          { character: "Gizo", text: "Rouge, bleu, vert, violet... on dirait des étoiles en robe de fête !" },
          { character: "Gizo", text: "Peut-être que ma machine n'est pas ratée... elle est juste différente !" }
        ]
      },
      {
        id: "scene_4",
        location: "Village des Moonlings",
        characters: ["Gizo"],
        action: "Gizo sort sa machine dans le village et les bulles colorées enchantent tout le monde.",
        dialogue: [
          { character: "Gizo", text: "Voilà ! Je vous présente... la machine à bulles étoilées !" },
          { character: "Gizo", text: "Regardez comme elles brillent dans la nuit ! Chaque bulle a sa propre couleur." },
          { character: "Gizo", text: "Ce n'est pas ce que j'avais imaginé au départ, mais c'est encore mieux !" },
          { character: "Gizo", text: "Voilà ce que la créativité peut faire : des surprises magnifiques !" }
        ]
      },
      {
        id: "scene_5",
        location: "Colline des Étoiles",
        characters: ["Gizo"],
        action: "Gizo regarde ses bulles monter vers le ciel et se mélanger aux vraies étoiles.",
        dialogue: [
          { character: "Gizo", text: "Regardez ! Mes bulles montent jusqu'aux étoiles !" },
          { character: "Gizo", text: "On ne sait plus lesquelles sont de vraies étoiles et lesquelles sont mes bulles." },
          { character: "Gizo", text: "C'est la plus belle chose que j'ai jamais inventée." },
          { character: "Gizo", text: "La prochaine fois, j'inventerai une machine encore plus étonnante !" },
          { character: "Gizo", text: "Mais pour l'instant, je vais juste profiter de ce moment magique." }
        ]
      }
    ]
  },
  {
    id: 4,
    season: 1,
    episodeNumber: 4,
    title: "La Course des Comètes",
    summary: "Zumu veut participer à la grande Course des Comètes mais il n'est pas le plus rapide du village. Il s'entraîne chaque jour avec beaucoup de détermination, même quand c'est difficile. Le jour de la course, Zumu découvre que la persévérance vaut bien plus que la vitesse.",
    moral: "Quand on n'abandonne jamais, on arrive toujours à atteindre son but.",
    characters: ["Zumu"],
    scenes: [
      {
        id: "scene_1",
        location: "Village des Moonlings",
        characters: ["Zumu"],
        action: "Zumu lit l'affiche annonçant la grande Course des Comètes et veut s'inscrire.",
        dialogue: [
          { character: "Zumu", text: "La Course des Comètes ! Oh, j'ai toujours rêvé d'y participer !" },
          { character: "Zumu", text: "Mais je ne suis pas le plus rapide du village... est-ce que je dois quand même essayer ?" },
          { character: "Zumu", text: "Oui ! Je vais m'inscrire ! Et je vais m'entraîner très, très dur !" },
          { character: "Zumu", text: "Allez Zumu, tu peux le faire !" }
        ]
      },
      {
        id: "scene_2",
        location: "Colline des Étoiles",
        characters: ["Zumu"],
        action: "Zumu s'entraîne à courir sur la colline, encore et encore malgré la fatigue.",
        dialogue: [
          { character: "Zumu", text: "Un... deux... trois... houp ! Je monte la colline encore une fois !" },
          { character: "Zumu", text: "Ouf, je suis essoufflé. Mais je ne m'arrête pas !" },
          { character: "Zumu", text: "Les jambes me font mal... mais je continue. Encore une fois !" },
          { character: "Zumu", text: "Chaque jour, je suis un peu plus rapide. Je le sens !" }
        ]
      },
      {
        id: "scene_3",
        location: "Rivière Argentée",
        characters: ["Zumu"],
        action: "Zumu pratique ses virages en courant le long de la rivière argentée.",
        dialogue: [
          { character: "Zumu", text: "Les virages, c'est la partie la plus difficile pour moi." },
          { character: "Zumu", text: "Je dois tourner sans perdre de vitesse. Comme ça... non, pas tout à fait." },
          { character: "Zumu", text: "Encore une fois... mieux ! Je me penche un peu sur le côté." },
          { character: "Zumu", text: "Voilà ! C'est ça ! Je progresse, je le sais !" }
        ]
      },
      {
        id: "scene_4",
        location: "Village des Moonlings",
        characters: ["Zumu"],
        action: "Le jour de la course, Zumu prend sa place sur la ligne de départ parmi les autres coureurs.",
        dialogue: [
          { character: "Zumu", text: "Je suis prêt. J'ai travaillé dur et je suis fier de moi." },
          { character: "Zumu", text: "Même si je ne gagne pas, je serai allé au bout de la course." },
          { character: "Zumu", text: "Allez, concentration ! Respire bien... prêt au départ !" },
          { character: "Zumu", text: "Je cours pour moi, je cours parce que j'aime ça !" }
        ]
      },
      {
        id: "scene_5",
        location: "Colline des Étoiles",
        characters: ["Zumu"],
        action: "Zumu termine la course, pas en premier mais avec le sourire et plein de fierté.",
        dialogue: [
          { character: "Zumu", text: "J'ai... j'ai terminé ! J'ai terminé la Course des Comètes !" },
          { character: "Zumu", text: "Je ne suis pas arrivé le premier, mais j'ai couru jusqu'au bout !" },
          { character: "Zumu", text: "Il y a quelques semaines, je ne pouvais même pas monter la colline sans m'arrêter." },
          { character: "Zumu", text: "Aujourd'hui, j'ai fait toute la course. C'est ma plus grande victoire !" },
          { character: "Zumu", text: "La prochaine Course des Comètes, je serai encore là. Et je serai encore meilleur !" }
        ]
      }
    ]
  },
  {
    id: 5,
    season: 1,
    episodeNumber: 5,
    title: "Le Nuage Arc-en-Ciel de Pofu",
    summary: "Pofu vit sur son nuage et remarque que le ciel est devenu tout gris depuis plusieurs jours. Il décide de peindre son nuage de toutes les couleurs de l'arc-en-ciel pour redonner de la joie à tous les Moonlings. Son geste plein d'espoir transforme tout le village.",
    moral: "Un peu d'espoir et de couleurs peut illuminer les jours les plus gris.",
    characters: ["Pofu"],
    scenes: [
      {
        id: "scene_1",
        location: "Nuage de Pofu",
        characters: ["Pofu"],
        action: "Pofu regarde le ciel gris depuis son nuage et se sent un peu triste.",
        dialogue: [
          { character: "Pofu", text: "Oh là là... Le ciel est gris depuis trop longtemps. Tout le monde a l'air triste en bas." },
          { character: "Pofu", text: "Les Moonlings ne jouent plus, ils regardent le sol." },
          { character: "Pofu", text: "Il faut que je fasse quelque chose pour les aider !" },
          { character: "Pofu", text: "Mais quoi ? Qu'est-ce que moi, Pofu, je peux faire ?" }
        ]
      },
      {
        id: "scene_2",
        location: "Nuage de Pofu",
        characters: ["Pofu"],
        action: "Pofu décide de peindre son nuage avec toutes ses peintures colorées.",
        dialogue: [
          { character: "Pofu", text: "J'ai une idée ! Mon nuage... je vais le peindre en arc-en-ciel !" },
          { character: "Pofu", text: "Du rouge d'abord, comme les baies de la forêt... voilà !" },
          { character: "Pofu", text: "Puis de l'orange, comme le coucher du soleil... magnifique !" },
          { character: "Pofu", text: "Du jaune, du vert, du bleu, du violet... mon nuage devient une fête des couleurs !" }
        ]
      },
      {
        id: "scene_3",
        location: "Nuage de Pofu",
        characters: ["Pofu"],
        action: "Pofu fait voguer son nuage arc-en-ciel au-dessus du village.",
        dialogue: [
          { character: "Pofu", text: "C'est l'heure ! Je vais montrer mon nuage à tout le village !" },
          { character: "Pofu", text: "Doucement... je vole au-dessus des maisons... comme ça !" },
          { character: "Pofu", text: "Oh, j'entends des cris en bas ! Les Moonlings lèvent la tête !" },
          { character: "Pofu", text: "Regardez ! Un arc-en-ciel dans le ciel, juste pour vous !" }
        ]
      },
      {
        id: "scene_4",
        location: "Village des Moonlings",
        characters: ["Pofu"],
        action: "Les Moonlings du village regardent le nuage avec émerveillement et commencent à sourire.",
        dialogue: [
          { character: "Pofu", text: "Vous voyez ? Le ciel peut être beau même quand il est nuageux !" },
          { character: "Pofu", text: "Il suffit d'un peu d'espoir et de couleurs !" },
          { character: "Pofu", text: "J'entends les enfants rire ! Ça, c'est le plus beau son du monde." },
          { character: "Pofu", text: "Mon nuage leur a redonné le sourire. Je suis tellement heureux !" }
        ]
      },
      {
        id: "scene_5",
        location: "Colline des Étoiles",
        characters: ["Pofu"],
        action: "Le soir, Pofu gare son nuage sur la colline et regarde le village illuminé.",
        dialogue: [
          { character: "Pofu", text: "Ce soir, le village brille à nouveau. Les lumières dansent dans les fenêtres." },
          { character: "Pofu", text: "Un petit geste peut changer une grande journée. Je l'ai appris aujourd'hui." },
          { character: "Pofu", text: "Demain, si le ciel est encore gris, je sortirai encore mon nuage arc-en-ciel." },
          { character: "Pofu", text: "Parce que l'espoir, ça se partage ! Bonne nuit, tout le monde !" },
          { character: "Pofu", text: "Et merci de m'avoir laissé vous offrir un peu de couleurs." }
        ]
      }
    ]
  },
  {
    id: 6,
    season: 1,
    episodeNumber: 6,
    title: "Ensemble Sous les Étoiles",
    summary: "Un grand vent a tout renversé dans le Village des Moonlings et chacun doit aider à tout remettre en ordre. Mochi, Piri, Pofu, Zumu et Gizo travaillent chacun de leur côté mais rien n'avance. Quand ils décident d'unir leurs forces, tout devient possible !",
    moral: "Ce qu'on ne peut pas faire seul, on le réussit toujours mieux ensemble.",
    characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
    scenes: [
      {
        id: "scene_1",
        location: "Village des Moonlings",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Après la tempête, tous les amis constatent les dégâts dans le village.",
        dialogue: [
          { character: "Mochi", text: "Oh non ! Le vent a tout renversé ! Les bancs, les fleurs, les lampions..." },
          { character: "Zumu", text: "Il y a du travail partout. Par où commencer ?" },
          { character: "Gizo", text: "Je vais réparer les lampions de mon côté." },
          { character: "Piri", text: "Et moi je replante les fleurs." },
          { character: "Pofu", text: "Je ramasse les feuilles éparpillées de mon nuage." }
        ]
      },
      {
        id: "scene_2",
        location: "Village des Moonlings",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Chacun travaille seul et rien n'avance vraiment vite.",
        dialogue: [
          { character: "Gizo", text: "Ce lampion est trop lourd pour moi tout seul... je n'y arrive pas." },
          { character: "Zumu", text: "Ces bancs sont trop lourds aussi. J'essaie mais ils ne bougent pas !" },
          { character: "Piri", text: "Je plante des fleurs mais le sol est très dur. Mes bras sont fatigués." },
          { character: "Mochi", text: "Hmmm... Ça n'avance pas très vite si on travaille chacun de notre côté." }
        ]
      },
      {
        id: "scene_3",
        location: "Village des Moonlings",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Mochi propose de tout faire ensemble et les amis acceptent avec enthousiasme.",
        dialogue: [
          { character: "Mochi", text: "Et si on travaillait tous ensemble, les uns après les autres ?" },
          { character: "Piri", text: "C'est une bonne idée ! On commence par quoi ?" },
          { character: "Mochi", text: "Les lampions d'abord ! On est cinq, ce sera facile à cinq !" },
          { character: "Gizo", text: "À cinq, je suis sûr qu'on peut soulever n'importe quoi !" },
          { character: "Zumu", text: "Et on sera plus rapides ! Allez, on se met ensemble !" }
        ]
      },
      {
        id: "scene_4",
        location: "Village des Moonlings",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Ensemble, ils remettent les lampions, les bancs et les décorations en place très vite.",
        dialogue: [
          { character: "Zumu", text: "Un, deux, trois... on pousse ! Voilà, le banc est en place !" },
          { character: "Pofu", text: "À mon tour de vous aider du haut de mon nuage ! Je vois bien de là-haut !" },
          { character: "Piri", text: "Pofu, les fleurs sont à gauche de la fontaine, tu les vois ?" },
          { character: "Pofu", text: "Oui ! À gauche, un peu encore... parfait !" },
          { character: "Gizo", text: "Les lampions sont réparés ! Et maintenant, ils brillent encore plus fort !" }
        ]
      },
      {
        id: "scene_5",
        location: "Village des Moonlings",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Le village est restauré et tous les amis admirent leur travail commun.",
        dialogue: [
          { character: "Mochi", text: "Regardez ! Le village est encore plus beau qu'avant la tempête !" },
          { character: "Piri", text: "On a tout fait ensemble en si peu de temps !" },
          { character: "Zumu", text: "Seul, j'aurais mis des jours. À cinq, il nous a fallu une heure !" },
          { character: "Gizo", text: "C'est ça la magie de l'entraide. Cinq fois plus efficace !" },
          { character: "Pofu", text: "Et cinq fois plus de joie aussi ! Je suis tellement heureux avec vous !" },
          { character: "Mochi", text: "Ensemble, on peut tout faire. C'est notre plus grand secret !" }
        ]
      }
    ]
  },
  {
    id: 7,
    season: 1,
    episodeNumber: 7,
    title: "Le Voyage dans la Nuit Profonde",
    summary: "Mochi doit traverser seul la partie la plus sombre du ciel pour aller chercher un médicament pour son ami malade. Il a très peur mais il se souvient de tout ce qu'il a appris et avance pas à pas. Ce voyage lui apprend que le courage n'est pas l'absence de peur, mais continuer malgré elle.",
    moral: "Le courage, ce n'est pas ne pas avoir peur, c'est avancer même quand on a peur.",
    characters: ["Mochi"],
    scenes: [
      {
        id: "scene_1",
        location: "Maison de Mochi",
        characters: ["Mochi"],
        action: "Mochi apprend qu'un ami a besoin d'une plante qui ne pousse que de l'autre côté de la Nuit Profonde.",
        dialogue: [
          { character: "Mochi", text: "Mon ami est malade et il a besoin de la fleur de lune. Mais elle pousse si loin..." },
          { character: "Mochi", text: "Pour l'atteindre, je dois traverser la Nuit Profonde tout seul." },
          { character: "Mochi", text: "J'ai très peur de la Nuit Profonde. Elle est si sombre, si silencieuse..." },
          { character: "Mochi", text: "Mais mon ami a besoin de moi. Je dois y aller. Je dois être courageux." }
        ]
      },
      {
        id: "scene_2",
        location: "Forêt des Lucioles",
        characters: ["Mochi"],
        action: "Mochi entre dans la forêt et prend une luciole pour s'éclairer en chemin.",
        dialogue: [
          { character: "Mochi", text: "Je commence par la forêt. Au moins ici, je connais le chemin." },
          { character: "Mochi", text: "Petite luciole, veux-tu m'accompagner un bout du chemin ?" },
          { character: "Mochi", text: "Merci ! Ta lumière m'aide déjà à me sentir moins seul." },
          { character: "Mochi", text: "Allez, courage Mochi. Un pas à la fois." }
        ]
      },
      {
        id: "scene_3",
        location: "Rivière Argentée",
        characters: ["Mochi"],
        action: "Mochi traverse la rivière en s'aidant des pierres lumineuses qui affleurent.",
        dialogue: [
          { character: "Mochi", text: "La rivière... je dois la traverser. Les pierres brillent un peu, je vais les utiliser." },
          { character: "Mochi", text: "Première pierre... deuxième... doucement... ne pas glisser..." },
          { character: "Mochi", text: "Ouf ! Je suis de l'autre côté ! Je l'ai fait !" },
          { character: "Mochi", text: "Chaque obstacle passé me donne un peu plus de courage pour le suivant." }
        ]
      },
      {
        id: "scene_4",
        location: "Colline des Étoiles",
        characters: ["Mochi"],
        action: "Au sommet de la colline, Mochi voit enfin la fleur de lune qui brille doucement.",
        dialogue: [
          { character: "Mochi", text: "Je la vois ! La fleur de lune ! Elle brille là-bas comme une petite étoile !" },
          { character: "Mochi", text: "Je l'ai trouvée ! Et j'ai traversé la Nuit Profonde tout seul !" },
          { character: "Mochi", text: "J'avais peur, mais je n'ai pas arrêté. J'ai continué, pas à pas." },
          { character: "Mochi", text: "Je cueille délicatement la fleur... voilà. Maintenant, retour à la maison !" }
        ]
      },
      {
        id: "scene_5",
        location: "Maison de Mochi",
        characters: ["Mochi"],
        action: "Mochi rentre avec la fleur de lune et réalise ce qu'il a accompli.",
        dialogue: [
          { character: "Mochi", text: "Je suis rentré ! Et j'ai la fleur de lune pour guérir mon ami !" },
          { character: "Mochi", text: "J'avais si peur en partant. Et pourtant, j'ai réussi." },
          { character: "Mochi", text: "Le courage, c'est continuer même quand les jambes tremblent." },
          { character: "Mochi", text: "Je suis fier de moi. Et demain, je serai encore un peu plus courageux !" },
          { character: "Mochi", text: "Guéris vite, mon ami. Je suis allé te chercher quelque chose de très précieux !" }
        ]
      }
    ]
  },
  {
    id: 8,
    season: 1,
    episodeNumber: 8,
    title: "L'Invention du Vent Rapide",
    summary: "Gizo a inventé une machine qui fait du vent pour aider Zumu à courir encore plus vite. Mais la machine est trop puissante et le vent emporte tout dans le village ! Ensemble, Gizo et Zumu apprennent à coopérer pour trouver la bonne solution.",
    moral: "Travailler ensemble et s'écouter permet de trouver les meilleures solutions.",
    characters: ["Gizo", "Zumu"],
    scenes: [
      {
        id: "scene_1",
        location: "Atelier de Gizo",
        characters: ["Gizo", "Zumu"],
        action: "Gizo présente à Zumu sa nouvelle invention : une machine à vent.",
        dialogue: [
          { character: "Gizo", text: "Zumu ! J'ai inventé quelque chose juste pour toi !" },
          { character: "Zumu", text: "Pour moi ? Qu'est-ce que c'est ?" },
          { character: "Gizo", text: "Une machine à vent ! Elle va te pousser dans le dos et tu courras encore plus vite !" },
          { character: "Zumu", text: "C'est génial, Gizo ! Tu penses vraiment à moi. Essayons-la !" }
        ]
      },
      {
        id: "scene_2",
        location: "Village des Moonlings",
        characters: ["Gizo", "Zumu"],
        action: "Gizo allume la machine mais le vent est beaucoup trop fort et emporte des objets.",
        dialogue: [
          { character: "Gizo", text: "Voilà ! Niveau un... ça pousse bien !" },
          { character: "Zumu", text: "Oh là là ! C'est très fort ! Je fonce !" },
          { character: "Gizo", text: "Euh... je crois que c'est un peu trop fort. Les lampions s'envolent !" },
          { character: "Zumu", text: "GIZO ! Les chapeaux des Moonlings aussi s'envolent ! Éteins la machine !" }
        ]
      },
      {
        id: "scene_3",
        location: "Atelier de Gizo",
        characters: ["Gizo", "Zumu"],
        action: "Ils rentrent à l'atelier pour réfléchir à comment améliorer la machine ensemble.",
        dialogue: [
          { character: "Gizo", text: "Désolé Zumu... je n'avais pas prévu que le vent serait si fort." },
          { character: "Zumu", text: "Ce n'est pas grave ! On va juste adapter la machine. Qu'est-ce qu'on peut changer ?" },
          { character: "Gizo", text: "Si on mettait un bouton pour régler la force du vent ? Du tout doux au très fort ?" },
          { character: "Zumu", text: "Excellente idée ! Et on pourrait aussi diriger le vent rien que vers moi !" },
          { character: "Gizo", text: "Oui ! Tu es très fort en idées, toi aussi !" }
        ]
      },
      {
        id: "scene_4",
        location: "Atelier de Gizo",
        characters: ["Gizo", "Zumu"],
        action: "Ensemble, ils modifient la machine avec les idées de chacun.",
        dialogue: [
          { character: "Zumu", text: "Je tiens les pièces pendant que tu vises. Comme ça ?" },
          { character: "Gizo", text: "Parfait ! Ne bouge pas... encore un peu... voilà !" },
          { character: "Zumu", text: "Et maintenant le bouton de direction ?" },
          { character: "Gizo", text: "J'y suis ! Tourne la molette à droite... et ça pointe vers toi !" },
          { character: "Zumu", text: "Super travail d'équipe, Gizo ! On est une bonne équipe, nous deux !" }
        ]
      },
      {
        id: "scene_5",
        location: "Colline des Étoiles",
        characters: ["Gizo", "Zumu"],
        action: "Ils testent la machine améliorée et elle fonctionne parfaitement.",
        dialogue: [
          { character: "Gizo", text: "Niveau doux d'abord... ça va ?" },
          { character: "Zumu", text: "Oui ! C'est agréable, comme une brise. Je cours sans problème !" },
          { character: "Gizo", text: "Niveau moyen maintenant !" },
          { character: "Zumu", text: "Wahou ! Je vole presque ! C'est parfait !" },
          { character: "Gizo", text: "Et les lampions ne bougent pas. On a réussi !" },
          { character: "Zumu", text: "Merci Gizo ! Ensemble, on a trouvé la meilleure solution !" }
        ]
      }
    ]
  },
  {
    id: 9,
    season: 1,
    episodeNumber: 9,
    title: "Piri et la Grande Lumière",
    summary: "Piri découvre qu'il a un talent spécial : il peut créer une grande lumière avec son cœur. Mais il a peur que sa lumière soit trop forte et dérange les autres. En apprenant à faire confiance à lui-même, Piri réalise que son talent est un don précieux pour tout le village.",
    moral: "Faire confiance en soi, c'est oser partager ses talents avec le monde.",
    characters: ["Piri"],
    scenes: [
      {
        id: "scene_1",
        location: "Lac Étoilé",
        characters: ["Piri"],
        action: "Piri découvre par accident qu'il peut créer une grande lumière quand il est heureux.",
        dialogue: [
          { character: "Piri", text: "Comme je suis content aujourd'hui ! Le lac est beau, le ciel est doux..." },
          { character: "Piri", text: "Oh ! Qu'est-ce qui se passe ? Je brille ! Je brille très fort !" },
          { character: "Piri", text: "C'est... c'est ma lumière intérieure ! Elle ressort quand je suis heureux !" },
          { character: "Piri", text: "Mais elle est si grande... est-ce qu'elle va déranger quelqu'un ?" }
        ]
      },
      {
        id: "scene_2",
        location: "Maison de Mochi",
        characters: ["Piri"],
        action: "Piri va voir Mochi et lui parle de sa lumière avec inquiétude.",
        dialogue: [
          { character: "Piri", text: "Mochi, j'ai découvert quelque chose d'étrange. J'ai peur que ça soit trop." },
          { character: "Piri", text: "Quand je suis très heureux, je brille très fort. Est-ce que ça te dérangerait ?" },
          { character: "Piri", text: "Je ne voudrais pas aveugler les autres ou les déranger avec ma lumière." },
          { character: "Piri", text: "Peut-être que je devrais la cacher ?" }
        ]
      },
      {
        id: "scene_3",
        location: "Forêt des Lucioles",
        characters: ["Piri"],
        action: "Piri essaie de cacher sa lumière mais plus il la cache, plus il se sent triste.",
        dialogue: [
          { character: "Piri", text: "Je vais essayer de ne pas briller. Comme ça, personne n'est dérangé." },
          { character: "Piri", text: "Mais... mais ça me rend triste. Je me sens tout petit quand je cache ma lumière." },
          { character: "Piri", text: "Et quand je suis triste, la lumière diminue toute seule. Ce n'est pas la solution." },
          { character: "Piri", text: "Peut-être que ma lumière ne dérange pas vraiment. Peut-être qu'elle aide ?" }
        ]
      },
      {
        id: "scene_4",
        location: "Village des Moonlings",
        characters: ["Piri"],
        action: "Piri laisse sa lumière briller dans le village un soir où les lampions sont éteints.",
        dialogue: [
          { character: "Piri", text: "Ce soir, les lampions sont éteints et le village est sombre. Je peux aider !" },
          { character: "Piri", text: "Je laisse ma lumière sortir... doucement... voilà !" },
          { character: "Piri", text: "Les Moonlings sourient ! Ma lumière les aide à voir, elle ne les dérange pas !" },
          { character: "Piri", text: "Mon talent est utile ! Je n'ai pas à en avoir honte." }
        ]
      },
      {
        id: "scene_5",
        location: "Colline des Étoiles",
        characters: ["Piri"],
        action: "Piri brille de toute sa lumière sur la colline et se sent enfin lui-même.",
        dialogue: [
          { character: "Piri", text: "Je m'appelle Piri et je brille. Et c'est une belle chose !" },
          { character: "Piri", text: "Ma lumière vient de mon cœur. Plus je suis heureux, plus elle est grande." },
          { character: "Piri", text: "Je n'ai plus peur de mon talent. Je lui fais confiance." },
          { character: "Piri", text: "Et si ma lumière peut aider les autres, alors c'est le plus beau des cadeaux !" },
          { character: "Piri", text: "Je brille pour moi et je brille pour vous. Bonne nuit, étoiles !" }
        ]
      }
    ]
  },
  {
    id: 10,
    season: 1,
    episodeNumber: 10,
    title: "La Fête des Étoiles Filantes",
    summary: "C'est la grande Fête des Étoiles Filantes et Mochi, Piri, Pofu, Zumu et Gizo organisent chacun une surprise pour leurs amis. Chaque surprise est différente et unique, et c'est justement ce mélange qui rend la fête inoubliable. Cette nuit-là, ils apprennent la joie de donner et de partager.",
    moral: "Le bonheur est encore plus grand quand on le partage avec ceux qu'on aime.",
    characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
    scenes: [
      {
        id: "scene_1",
        location: "Village des Moonlings",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Les amis se retrouvent pour préparer la Fête des Étoiles Filantes ensemble.",
        dialogue: [
          { character: "Mochi", text: "Ce soir, c'est la Fête des Étoiles Filantes ! J'ai préparé une surprise pour chacun de vous." },
          { character: "Piri", text: "Moi aussi ! J'ai une surprise ! Est-ce que vous avez tous préparé quelque chose ?" },
          { character: "Zumu", text: "Oui ! J'ai travaillé dessus toute la semaine !" },
          { character: "Gizo", text: "Et moi j'ai une invention spéciale pour cette nuit !" },
          { character: "Pofu", text: "Et mon nuage est tout décoré pour la fête !" }
        ]
      },
      {
        id: "scene_2",
        location: "Colline des Étoiles",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Ils s'installent sur la colline et les premières étoiles filantes apparaissent.",
        dialogue: [
          { character: "Mochi", text: "Regardez ! La première étoile filante !" },
          { character: "Piri", text: "Elle est tellement belle ! Comme une traînée d'argent dans le ciel !" },
          { character: "Pofu", text: "Du haut de mon nuage, elles semblent si proches ! J'en ai presque touché une !" },
          { character: "Zumu", text: "Faites un vœu ! Vite, avant qu'elle disparaisse !" },
          { character: "Gizo", text: "Mon vœu, c'est que cette nuit dure toujours !" }
        ]
      },
      {
        id: "scene_3",
        location: "Colline des Étoiles",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Chacun offre sa surprise à tour de rôle.",
        dialogue: [
          { character: "Mochi", text: "Ma surprise : j'ai fait une chanson pour chacun de vous. Pour Piri d'abord !" },
          { character: "Piri", text: "Mochi ! C'est la plus belle chose qu'on m'ait jamais offerte !" },
          { character: "Zumu", text: "Moi, j'ai couru jusqu'au sommet de chaque colline pour cueillir une fleur rare pour chacun !" },
          { character: "Gizo", text: "Et moi, j'ai fabriqué un petit bijou lumineux pour chacun. Il brille comme vos cœurs !" },
          { character: "Pofu", text: "Et moi, j'ai rempli mon nuage de douceurs que j'ai préparées pour vous !" }
        ]
      },
      {
        id: "scene_4",
        location: "Colline des Étoiles",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "Piri illumine la colline avec sa grande lumière pendant que les étoiles filantes défilent.",
        dialogue: [
          { character: "Piri", text: "Et ma surprise à moi : je vais illuminer toute la colline !" },
          { character: "Piri", text: "Je laisse ma lumière sortir de tout mon cœur..." },
          { character: "Mochi", text: "Oh, Piri ! C'est magnifique ! On voit les étoiles filantes encore mieux !" },
          { character: "Zumu", text: "Ta lumière et les étoiles filantes ensemble... c'est le plus beau spectacle de ma vie !" },
          { character: "Gizo", text: "Je vais noter ça dans mon carnet : la lumière de Piri est magique !" }
        ]
      },
      {
        id: "scene_5",
        location: "Colline des Étoiles",
        characters: ["Mochi", "Piri", "Pofu", "Zumu", "Gizo"],
        action: "La nuit se termine et les amis se serrent dans les bras en se promettant de toujours rester ensemble.",
        dialogue: [
          { character: "Mochi", text: "Cette nuit, vous m'avez tous rendu tellement heureux." },
          { character: "Piri", text: "Moi aussi ! Le bonheur est encore plus grand quand on est ensemble !" },
          { character: "Pofu", text: "Cette fête, je ne l'oublierai jamais. Jamais de ma vie." },
          { character: "Zumu", text: "Promettez-moi qu'on fera ça chaque année ?" },
          { character: "Gizo", text: "Je le promets ! Et l'année prochaine, j'inventerai quelque chose d'encore plus beau !" },
          { character: "Mochi", text: "Bonne nuit, mes amis. On se retrouve demain sous nos étoiles préférées !" }
        ]
      }
    ]
  },
