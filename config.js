'use strict';
/* ==================================================================
   PORTFOLIO macOS — config.js
   ------------------------------------------------------------------
   TOUT LE CONTENU DU SITE EST ICI. Remplace les textes d'exemple.
   Les fichiers (vidéos, captures, photos…) vont dans le dossier « assets ».

   Pour chaque projet :
   - video    : la vidéo montée, affichée dans le Viewer du logiciel.
                Fichier ('assets/videos/clip.mp4') ou lien YouTube / Vimeo.
   - timeline : la capture de ta VRAIE timeline (DaVinci Resolve / After Effects).
                Image ('assets/timelines/clip.png') ou capture vidéo
                ('assets/timelines/clip.mp4'). Une capture vidéo est lue en même
                temps que la vidéo du Viewer (pause, lecture, avance : tout est synchro).
   - timelineRange : (capture IMAGE seulement) où commence et où finit ton montage
                sur la capture, de 0 (bord gauche) à 1 (bord droit).
                Sert à placer la tête de lecture rouge au bon endroit. Ex. [0.12, 0.96]
   - app      : logiciel qui ouvre le projet : 'resolve', 'ae', 'lr' ou 'ps'
                (par défaut : vidéo → DaVinci, motion → After Effects,
                 photo → Lightroom, graphisme → Photoshop).
   - cover    : image de couverture. Sans image, une affiche colorée est générée.
   - gallery  : liste d'images (photos, ou pages d'un design).
   - before   : (photos) image AVANT retouche — visible avec le bouton Avant/Après (Y|Y)
                de Lightroom. Une image ou une liste (même ordre que gallery).
   ================================================================== */

const CONFIG = {
  name: 'Ndimby Ramahafadrahona',
  initials: 'NR',
  role: 'Vidéaste freelance',
  city: 'Blois, France',
  email: 'ndyxxprod@gmail.com',
  phone: '+33 7 61 52 26 26',   // vide = masqué
  status: 'Disponible pour des projets freelance',
  avatar: 'assets/avatar.jpg',   // sinon les initiales s'affichent
  cv: 'assets/cv.pdf',
  cvPages: ['assets/cv-1.jpg', 'assets/cv-2.jpg'],   // aperçu du CV (pages en image)
  wallpaper: '',                 // ex. 'assets/fond.jpg' (sinon fond dégradé)

  /* Formulaire de contact (page Contact + app Mail)
     - Laisse vide : le message s'ouvre tout prêt dans la messagerie du visiteur.
     - Pour recevoir les messages directement par e-mail, sans que le visiteur
       ouvre sa messagerie : crée un formulaire gratuit sur https://formspree.io
       et colle l'adresse ici, ex. 'https://formspree.io/f/abcdwxyz'            */
  formEndpoint: '',

  /* Showreel : laisse null tant que tu n'en as pas (il n'apparaît alors nulle part).
     Plus tard : showreel: { title: 'Showreel 2026', video: 'assets/videos/showreel.mp4' }, */
  showreel: null,

  /* Réseaux : instagram, tiktok, youtube, linkedin, vimeo ou behance (logo officiel).
     Un réseau sans « url » n'est pas affiché. */
  socials: [
    { network: 'instagram', handle: '', url: '' },
    { network: 'tiktok', handle: '', url: '' },
    { network: 'youtube', handle: '', url: '' },
    { network: 'linkedin', handle: 'Ndimby Ramahafadrahona', url: '' }
  ],

  bio: [
    "Passionné par les caméras depuis tout petit, j'ai toujours eu envie de tout capturer : les moments, les gens, les ambiances.",
    "Aujourd'hui étudiant en BUT MMI (parcours communication) à l'IUT de Blois, je développe mon activité de vidéaste freelance en parallèle de mes études.",
    "Je réalise des contenus audiovisuels de la prise de vue au montage pour valoriser des événements, des projets et des marques : vidéos promotionnelles, couverture événementielle et contenus pour les réseaux sociaux."
  ],

  languages: ['Français : courant', 'Malgache : langue maternelle', 'Anglais : B2'],
  interests: [
    'Sport : tournois de football et championnat national (Madagascar), basketball, taekwondo (ceinture noire)',
    'Audiovisuel : création vidéo et photographie'
  ],

  /* PHOTOS DE TOI AU TRAVAIL (facultatif) : posées sur le bureau + dossier « Coulisses ».
     Vide = rien ne s'affiche. Ex. { photo: 'assets/coulisses/tournage.jpg', caption: 'En tournage' } */
  coulisses: [],

  /* PRÉSENTATION (menu « Présentation » en haut de l'écran)
     Les diapositives sont générées à partir de tout le contenu de ce fichier. */
  presentation: {
    hello: 'Bonjour, moi c\'est',
    pitch: 'Passionné par les caméras depuis tout petit, j\'aime tout capturer : de la prise de vue au montage.',
    services: [
      { icon: 'film', title: 'Vidéo promotionnelle', text: 'Des films pour valoriser une marque, un projet ou un lieu : tournage, montage, étalonnage.' },
      { icon: 'camera', title: 'Événementiel', text: 'Couverture vidéo et photo d\'événements : mariages, soirées, compétitions sportives.' },
      { icon: 'sparkle', title: 'Réseaux sociaux', text: 'Des formats courts pour TikTok, Instagram et YouTube, pensés pour accrocher dès la première seconde.' },
      { icon: 'pencil', title: 'Storyboard', text: 'Un découpage plan par plan pour préparer chaque tournage, du clip au film sportif.' }
    ],
    closing: 'Un projet, un événement, une idée de vidéo ? Écris-moi, je réponds vite.'
  },

  // Compétences : une simple liste (affichée sans jauge)
  skills: [
    'Tournage et prise de vue',
    'Montage vidéo et postproduction',
    'Contenus pour les réseaux sociaux',
    'Photographie événementielle',
    'Storyboard et découpage'
  ],

  /* Icônes d'applis en image (PNG carré, fond transparent, 512 px conseillé).
     Ex. appIcons: { resolve: 'assets/icones/davinci-resolve.png' }
     Clés : resolve, ae, lr, ps, finder, keynote, notes, mail, contacts, trash */
  appIcons: {},

  // Les vrais logos s'affichent automatiquement pour ces logiciels
  tools: ['DaVinci Resolve', 'After Effects', 'CapCut Pro', 'Photoshop', 'Lightroom', 'Illustrator', 'Canva'],

  // Parcours (le stage et le bac restent seulement sur le CV)
  path: [
    { year: '2025', title: 'Vidéaste indépendant', text: 'Conception et montage de vidéos professionnelles et personnelles, création de contenus pour YouTube et les réseaux sociaux.' },
    { year: '2024', title: 'BUT MMI — IUT de Blois', text: 'Métiers du Multimédia et de l\'Internet, parcours communication (3e année, 2024-2027). Projets vidéo : court-métrage, clip musical, vidéo commerciale.' }
  ],

  /* STORYBOARDS (app Notes → dossier « Storyboards »)
     Mets tes images dans assets/storyboards/ puis :
     - frames : une case par plan → « image » = la case (ex. 'assets/storyboards/clip-01.jpg')
                Sans image, une esquisse au crayon est dessinée automatiquement.
     - pages  : (optionnel) planches entières, affichées en grand
     project : (optionnel) id du projet lié, pour ouvrir la vidéo finale.        */
  storyboards: [
    {
      id: 'sb-clip', title: 'Clip SAE 302', project: 'clip-sae302', date: '2025',
      pages: ['assets/storyboards/clip-sae302-planche.jpg'],
      description: "Découpage du clip minute par minute : le groupe joue pendant qu'une jeune fille suit une silhouette jusque dans la forêt. Chaque plan précise le cadrage et le support caméra (DJI, magic arm, trépied, main).",
      frames: [
        { image: 'assets/storyboards/clip-01.jpg', shot: '00:00', framing: 'Ouverture', move: 'iPhone sur magic arm', text: "Premier plan, lancement de la vidéo : le guitariste et le batteur entrent en scène." },
        { image: 'assets/storyboards/clip-02.jpg', shot: '00:00', framing: 'Plan à 45°', move: 'DJI, travelling avant', text: "Dès que le batteur joue ses premières notes, la caméra avance petit à petit vers lui." },
        { image: '', shot: '00:00', framing: 'Plan rapproché', move: 'Trépied à mi-hauteur', text: "La guitare au premier plan, la batterie en fond, puis le point bascule sur la batterie." },
        { image: 'assets/storyboards/clip-04.jpg', shot: '00:00', framing: 'Top down shot', move: 'Trépied', text: "La batterie vue du dessus pendant ses breaks." },
        { image: 'assets/storyboards/clip-05.jpg', shot: '00:31', framing: 'Top down shot', move: 'Trépied', text: "Le subconscient du protagoniste ouvre les yeux." },
        { image: 'assets/storyboards/clip-06.jpg', shot: '00:31', framing: 'Plan large', move: 'DJI, travelling bas', text: "Il voit une silhouette passer devant la fenêtre, se lève et commence à errer dans la rue en la suivant." },
        { image: 'assets/storyboards/clip-07.jpg', shot: '01:03', framing: 'Plan de groupe', move: 'DJI, travelling', text: "Le plan commence sur la violoniste ; quand le chanteur dit « Wander », la caméra passe sur lui." },
        { image: '', shot: '01:24', framing: 'Travelling horizontal', move: 'Caméra à la main', text: "La petite fille arrive devant la forêt : la caméra part du mollet jusqu'à passer derrière elle, puis elle suit calmement la silhouette entre les arbres." },
        { image: '', shot: '01:41', framing: 'Close-up, ralenti', move: 'Caméra à la main', text: "Ralentis sur les yeux, les mains, les pieds. Elle perd la trace de la silhouette, disparue derrière un arbre." },
        { image: 'assets/storyboards/clip-10.jpg', shot: '02:10', framing: 'Profil', move: 'Magic arm puis trépied', text: "La violoniste à la magic arm, puis le chanteur de profil sur trépied." },
        { image: 'assets/storyboards/clip-11.jpg', shot: '02:50', framing: 'Low shutter speed', move: 'Trépied tenu par le perso', text: "La protagoniste panique et s'énerve de ne plus retrouver la silhouette : plusieurs plans en low shutter speed et ralenti autour d'elle." },
        { image: 'assets/storyboards/clip-12.jpg', shot: '03:05', framing: 'Superposition', move: 'Magic arm', text: "Plan du chanteur, puis superposition progressive du plan du bassiste." },
        { image: 'assets/storyboards/clip-13.jpg', shot: '03:19', framing: 'Gros plan', move: 'Magic arm', text: "Le bassiste seul jusqu'à 3:33." },
        { image: 'assets/storyboards/clip-14.jpg', shot: '03:33', framing: 'Superposition', move: 'Magic arm', text: "Le violoniste jusqu'à 3:49, puis un plan du batteur en superposition." },
        { image: 'assets/storyboards/clip-15.jpg', shot: '04:03', framing: 'Close-up puis large', move: 'DJI puis main', text: "La petite au pied de l'arbre ; elle relève la tête, se retourne et commence à courir." },
        { image: 'assets/storyboards/clip-16.jpg', shot: '04:35', framing: 'Face à face', move: 'DJI', text: "Elle arrive enfin à sa hauteur : ils sont face à face. Vers 4:50, la scène du câlin se superpose au groupe." },
        { image: '', shot: '05:06', framing: 'Plan de fin', move: 'Plans rapprochés', text: "Fin sur le groupe et quelques plans rapprochés." }
      ]
    },
    {
      id: 'sb-basket', title: 'Storyboard Basket', date: '2025',   // film pas encore tourné : pas de lien vers une vidéo
      pages: ['assets/storyboards/basket-planche.jpg'],
      description: "Film à venir — 18 plans pour un film de basket autour de Yanis : arrivée sur le terrain, échauffement, crossover, dunk et tir à trois points, avec les images de référence de chaque plan.",
      frames: [
        { image: 'assets/storyboards/basket-01.jpg', shot: 'Plan 1', framing: 'Plan de dos', move: 'Mouvement gauche → droite', text: "Yanis arrive sur le terrain, la balle dans les mains." },
        { image: 'assets/storyboards/basket-02.jpg', shot: 'Plan 2', framing: 'Plan de face', move: 'Mouvement vers la gauche', text: "Yanis s'avance vers le terrain ; la caméra glisse pour se retrouver face à lui." },
        { image: 'assets/storyboards/basket-03.jpg', shot: 'Plan 3', framing: 'Insert', move: 'Tilt up', text: "Il attache ses lacets ; le plan monte des lacets jusqu'à sa tête, qui regarde vers le bas." },
        { image: 'assets/storyboards/basket-04.jpg', shot: 'Plan 4', framing: 'Contre-plongée', move: 'Rapide', text: "Le cerceau filmé d'en bas, en vitesse." },
        { image: 'assets/storyboards/basket-05.jpg', shot: 'Plan 5', framing: 'Middle shot', move: 'Fixe', text: "Échauffement : Yanis enchaîne les dribbles." },
        { image: 'assets/storyboards/basket-06.jpg', shot: 'Plans 6-7', framing: 'Low shutter speed', move: 'Face caméra', text: "Yanis attaque vers moi ; la vitesse d'obturation lente accentue le dribble." },
        { image: 'assets/storyboards/basket-07.jpg', shot: 'Plan 7', framing: 'Close-up', move: 'Très rapide', text: "Rotation de son pied, puis enchaînement sur moi qui tombe : effet crossover." },
        { image: 'assets/storyboards/basket-08.jpg', shot: 'Plans 8-9', framing: 'POV au sol', move: 'Puis plan large', text: "Yanis part au lay-up, vu de derrière depuis le sol, puis de loin, en dehors du terrain, quand il marque." },
        { image: 'assets/storyboards/basket-09.jpg', shot: 'Plan 9', framing: 'Plan smartphone', move: 'À la main', text: "Quelqu'un filme le moment qui vient de se passer pendant que Yanis va au lay-up." },
        { image: 'assets/storyboards/basket-10.jpg', shot: 'Plans 10-11', framing: 'Plan rapproché', move: 'Fixe', text: "Yanis lance la balle pour dunker ; gros plan sur ses pieds qui décollent." },
        { image: 'assets/storyboards/basket-12.jpg', shot: 'Plan 12', framing: 'Contre-plongée', move: 'Fixe', text: "Le dunk filmé d'en bas pour montrer la hauteur, en couleur puis en noir et blanc." },
        { image: 'assets/storyboards/basket-13.jpg', shot: 'Plan 13', framing: 'Insert', move: 'Fixe', text: "La balle qui rebondit." },
        { image: 'assets/storyboards/basket-14.jpg', shot: 'Plan 14', framing: 'Insert', move: 'Fixe', text: "Il ramasse la balle au sol et se l'envoie à lui-même." },
        { image: 'assets/storyboards/basket-15.jpg', shot: 'Plans 15-17', framing: 'Plan large de dos', move: 'Fixe', text: "Tir à trois points, filmé de derrière ; deuxième plan : la balle passe au-dessus de la caméra avec une traînée." },
        { image: 'assets/storyboards/basket-17.jpg', shot: 'Plan 17', framing: 'Contre-plongée', move: 'Fixe', text: "La balle rentre dans le cerceau, vue d'en bas." },
        { image: 'assets/storyboards/basket-18.jpg', shot: 'Plan 18', framing: 'Plan subjectif', move: 'Transition', text: "Il range sa balle dans son sac… et transition." }
      ]
    }
  ],

  /* PROJETS — les champs vides (vidéo, timeline, photos…) seront remplis avec tes fichiers. */
  projects: [
    { id: 'clip-sae302', title: 'Clip musical — SAE 302', short: 'Clip SAE 302', category: 'scolaire', type: 'video',
      client: 'BUT MMI — IUT de Blois', year: '2025', role: 'Tournage, montage', duration: '5:27',
      description: "Clip réalisé en équipe dans le cadre de la SAE 302 : pendant que le groupe joue, une jeune fille suit une silhouette jusque dans la forêt. Tournage au stabilisateur DJI, à la magic arm et sur trépied, avec des ralentis et des plans en low shutter speed.",
      tags: ['Clip', 'Musique', 'Projet d\'équipe'], tools: ['DaVinci Resolve'], fav: true,
      video: '', timeline: '', colors: ['#3a1c71', '#d76d77'] },

    { id: 'mariage', title: 'Mariage', short: 'Mariage', category: 'pro', type: 'photo',
      client: 'Particuliers', year: '2025', role: 'Photographie, retouche', duration: '',
      description: "Couverture d'un mariage : les préparatifs, les invités et les moments forts de la journée, puis tri et retouche de la série dans Lightroom.",
      tags: ['Mariage', 'Événementiel'], tools: ['Lightroom'], fav: true,
      cover: '', gallery: [], before: '', colors: ['#c79081', '#dfa579'] },

    { id: 'suaps', title: 'Contenus réseaux — SUAPS', short: 'SUAPS', category: 'pro', type: 'video',
      client: 'SUAPS — Université de Tours', year: '2026', role: 'Tournage, montage', duration: '',
      description: "Contenus audiovisuels pour les réseaux sociaux du service des sports de l'Université de Tours.",
      tags: ['Sport', 'Réseaux sociaux'], tools: ['DaVinci Resolve', 'CapCut Pro'], fav: true,
      video: '', timeline: '', cover: '', colors: ['#00c6ff', '#0050d0'] },

    { id: 'bde-mirage', title: 'Vidéos du BDE MMI Mirage', short: 'BDE Mirage', category: 'scolaire', type: 'video',
      client: 'BDE MMI Mirage', year: '2025', role: 'Producteur de contenu vidéo', duration: '',
      description: "Production des vidéos du BDE de la formation MMI : événements, soirées et contenus pour les réseaux.",
      tags: ['Événementiel', 'Réseaux sociaux'], tools: ['DaVinci Resolve', 'CapCut Pro'],
      video: '', timeline: '', cover: '', colors: ['#8e2de2', '#ff3d9a'] },

    { id: 'court-metrage', title: 'Court-métrage — BUT MMI', short: 'Court-métrage', category: 'scolaire', type: 'video',
      client: 'BUT MMI — IUT de Blois', year: '2025', role: 'Tournage, montage', duration: '',
      description: "Court-métrage réalisé en équipe dans le cadre du BUT MMI.",
      tags: ['Fiction', 'Court-métrage'], tools: ['DaVinci Resolve'],
      video: '', timeline: '', cover: '', colors: ['#2c3e50', '#c94b4b'] },

    { id: 'video-commerciale', title: 'Vidéo commerciale — BUT MMI', short: 'Vidéo commerciale', category: 'scolaire', type: 'video',
      client: 'BUT MMI — IUT de Blois', year: '2025', role: 'Tournage, montage', duration: '',
      description: "Vidéo commerciale réalisée dans le cadre du BUT MMI.",
      tags: ['Publicité', 'Marque'], tools: ['DaVinci Resolve', 'After Effects'],
      video: '', timeline: '', cover: '', colors: ['#f7b733', '#fc4a1a'] },

    { id: 'youtube', title: 'Ma chaîne YouTube', short: 'YouTube', category: 'pro', type: 'video',
      client: 'Projet personnel', year: '2025', role: 'Conception, tournage, montage', duration: '',
      description: "J'administre ma propre chaîne YouTube : de l'idée au montage, en passant par les miniatures.",
      tags: ['YouTube', 'Création de contenu'], tools: ['DaVinci Resolve', 'Photoshop'],
      video: '', timeline: '', cover: '', colors: ['#f12711', '#f5af19'] }
  ]
};
