'use strict';
/* ==================================================================
   PORTFOLIO NDIMBY — contenu.js
   ------------------------------------------------------------------
   TOUT LE CONTENU DU SITE EST ICI : c'est le seul fichier à modifier.
   Les fichiers (vidéos, couvertures, photos…) vont dans « assets ».

   Pour chaque projet :
   - video : la vidéo montée. Fichier ('assets/videos/clip.mp4')
             ou lien YouTube / Vimeo. Vide = « Vidéo bientôt en ligne ».
   - preview : (facultatif) petit extrait MP4 muet de 3-5 s, joué au survol
             de la ligne du projet. Ex. 'assets/videos/clip-apercu.mp4'
   - cover : image de couverture ('assets/projets/clip.jpg').
             Sans image, une affiche est générée avec les deux « colors ».
   ================================================================== */

const SITE = {
  firstName: 'Ndimby',
  lastName: 'Ramahafadrahona',
  role: 'Vidéaste freelance',
  city: 'Blois & Nantes',
  email: 'ndyxxprod@gmail.com',
  phone: '+33 7 61 52 26 26',          // vide = masqué
  status: 'Disponible pour des projets freelance',
  avatar: 'assets/avatar.jpg',
  cv: 'assets/cv.pdf?v=202611041451',

  /* AMBIANCE DE COULEURS — chaque ambiance change TOUT le site
     palette : celle affichée par défaut (lagon, golden, neon ou teal).
     showPalettePicker : true = petit sélecteur « Ambiance » pour les visiteurs.
     bg / bg2 : fonds sombres   fg : texte sur fond sombre
     paper : fond clair   ink : texte sur fond clair
     c1 / c2 / c3 : couleurs vives (boutons, survols, dégradés)                  */
  palette: 'lagon',
  showPalettePicker: true,
  palettes: {
    lagon:  { name: 'Lagon',         bg: '#04122a', bg2: '#08234a', fg: '#e6f6ff', paper: '#cfe8ff', ink: '#06183a', c1: '#00d4b4', c2: '#2f6bff', c3: '#8ff7da' },
    golden: { name: 'Golden hour',   bg: '#1c0d07', bg2: '#31160a', fg: '#fff0dc', paper: '#ffd9a0', ink: '#2b1206', c1: '#ff5a1f', c2: '#ff1f6d', c3: '#ffb627' },
    neon:   { name: 'Néon',          bg: '#0a0518', bg2: '#190a38', fg: '#f4eaff', paper: '#d9c2ff', ink: '#1b0b3d', c1: '#a24bff', c2: '#ff2bd6', c3: '#2ee6ff' },
    teal:   { name: 'Teal & Orange', bg: '#061c22', bg2: '#0c3039', fg: '#fdeedd', paper: '#f6d3ac', ink: '#14282d', c1: '#ff7a1a', c2: '#00a3a3', c3: '#ffd6a5' }
  },

  /* Showreel : laisse null tant que tu n'en as pas.
     Plus tard : showreel: { video: 'assets/videos/showreel.mp4' }
     → la vidéo tourne en fond de l'accueil et un bouton « Voir le showreel » apparaît.
     (Un lien YouTube / Vimeo marche aussi pour le bouton, pas pour le fond.) */
  showreel: null,

  /* Formulaire de contact
     - Vide : le message s'ouvre tout prêt dans la messagerie du visiteur.
     - Pour recevoir les messages directement : crée un formulaire gratuit sur
       https://formspree.io et colle l'adresse ici, ex. 'https://formspree.io/f/abcdwxyz' */
  formEndpoint: '',

  /* Réseaux : un réseau sans « url » n'est pas affiché. */
  socials: [
    { network: 'Instagram', url: 'https://www.instagram.com/ndyxx.prod/' },
    { network: 'TikTok', url: '' },
    { network: 'YouTube', url: 'https://www.youtube.com/@ndyxx_mp4' },
    { network: 'LinkedIn', url: 'https://www.linkedin.com/in/ndimby-ramahafadrahona-b9420635a/' }
  ],

  /* ACCUEIL */
  heroLines: ['Ndyxx', 'Prod'],
  /* Photos autour du titre : une par projet, cliquables (bulle « Voir »).
     slot : f1 à f6 (leur place)   p : le projet ouvert   img : la photo (sinon la couverture du projet) */
  heroPhotos: [
    { slot: 'f1', p: 'mariage', img: 'assets/mini/mariage-11.jpg' },
    { slot: 'f2', p: 'mariage', img: 'assets/mini/tolotra-04.jpg' },
    { slot: 'f3', p: 'clip-sae302', img: 'assets/mini/clip-cover.jpg' },
    { slot: 'f4', p: 'ufab' },
    { slot: 'f5', p: 'intercampus', img: 'assets/mini/intercampus-portrait.jpg' },
    { slot: 'f6', p: 'harmonya' }
  ],

  /* Phrase géante : les mots en couleur sont cliquables et montrent un projet au survol.
     w = le mot, p = l'identifiant du projet montré. */
  statement: [
    'Je filme des ', { w: 'clips', p: 'clip-sae302' }, ', des ', { w: 'soirées', p: 'intercampus' },
    ' et du ', { w: 'sport', p: 'ufab' }, '. Je peux aussi ', { w: 'photographier', p: 'mariage' }, '.'
  ],

  /* Ils m'ont fait confiance : p = projet montré au survol, img = photo (facultatif) */
  clients: [
    { name: 'UFAB 49', kind: 'Club de basket pro', p: 'ufab' },
    { name: 'The Banshee', kind: 'Groupe de musique', p: 'clip-sae302' },
    { name: 'Fédération des étudiants de Blois', kind: 'Association', p: 'intercampus' },
    { name: 'Haja & Nancy', kind: 'Mariage · 2026', p: 'mariage', img: 'assets/mini/mariage-02.jpg' },
    { name: 'Tolotra & Diana', kind: 'Mariage · 2026', p: 'mariage', img: 'assets/mini/tolotra-04.jpg' }
  ],

  // Grande phrase sous l'accueil (les mots s'allument au scroll)
  manifesto: "Passionné par les caméras depuis tout petit, j'ai toujours eu envie de tout capturer : les moments, les gens, les ambiances.",

  // Bandeau qui défile
  marquee: ['Vidéo promotionnelle', 'Événementiel', 'Réseaux sociaux', 'Clip musical', 'Photographie'],

  bio: [
    "Aujourd'hui étudiant en BUT MMI (parcours communication) à l'IUT de Blois, je développe mon activité de vidéaste freelance en parallèle de mes études.",
    "Je réalise des contenus audiovisuels de la prise de vue au montage pour valoriser des événements, des projets et des marques : vidéos promotionnelles, couverture événementielle et contenus pour les réseaux sociaux."
  ],

  // Chiffres de la section « À propos »
  stats: [
    { value: 'Blois', label: 'Loir-et-Cher' },
    { value: 'Nantes', label: 'Loire-Atlantique' }
  ],

  services: [
    { icon: 'film', title: 'Vidéo promotionnelle', text: 'Des films pour valoriser une marque, un projet ou un lieu : tournage, montage, étalonnage.' },
    { icon: 'camera', title: 'Événementiel', text: "Couverture vidéo et photo d'événements : mariages, soirées, compétitions sportives." },
    { icon: 'sparkle', title: 'Réseaux sociaux', text: 'Des formats courts pour TikTok, Instagram et YouTube, pensés pour accrocher dès la première seconde.' }
  ],

  skills: [
    'Tournage et prise de vue',
    'Montage vidéo et postproduction',
    'Contenus pour les réseaux sociaux',
    'Photographie événementielle'
  ],

  tools: ['DaVinci Resolve', 'After Effects', 'CapCut Pro', 'Photoshop', 'Lightroom', 'Illustrator', 'Canva'],



  path: [
    { year: '2025', title: 'Vidéaste indépendant', text: 'Conception et montage de vidéos professionnelles et personnelles, création de contenus pour YouTube et les réseaux sociaux.' },
    { year: '2024', title: 'BUT MMI — IUT de Blois', text: "Métiers du Multimédia et de l'Internet, parcours communication (3e année, 2024-2027). Projets vidéo : court-métrage, clip musical, vidéo commerciale." }
  ],

  /* PROJETS — category : 'pro' ou 'scolaire' */
  projects: [
    /* videos : plusieurs vidéos dans la même fiche (la première sert de couverture) */
    { id: 'ufab', title: 'UFAB 49 — Angers Basket', short: 'UFAB 49', category: 'pro', type: 'Vidéo',
      client: 'UFAB 49 — Union Féminine Angers Basket', year: '2025-26', role: 'Tout, du tournage au rendu final', duration: '',
      description: "Deux vidéos pour l'UFAB 49, le club professionnel de basket féminin d'Angers : le teaser du prochain match, puis l'introduction du documentaire sur la victoire des U18 en Coupe de France.",
      kind: 'Vidéos pour un club pro',
      tags: ['Sport', 'Basket', 'Club pro'], tools: ['DaVinci Resolve'],
      video: 'https://youtu.be/HxsINV4s5Nc',
      videos: [
        { title: 'Promotion du prochain match', url: 'https://youtu.be/HxsINV4s5Nc' },
        { title: 'Introduction du documentaire — les U18 en Coupe de France', url: 'https://youtu.be/vF1PbpQz9M0' }
      ],
      preview: '', cover: '', colors: ['#ff7a1a', '#7a1f00'] },

    { id: 'clip-sae302', title: 'Clip musical', short: 'Clip musical', category: 'scolaire', type: 'Vidéo',
      client: 'The Banshee — projet BUT MMI, IUT de Blois', year: '2025', role: 'Réalisateur, chef de production, cadreur', duration: '5:27',
      description: "Un clip pour le groupe The Banshee, réalisé dans le cadre d'un projet de l'IUT, mais pour un vrai client. J'étais réalisateur et chef de production : j'ai tout tourné moi-même, puis supervisé le montage, la direction artistique et l'étalonnage.",
      kind: 'The Banshee',
      tags: ['Clip', 'Musique', 'Client réel'], tools: [],
      video: 'https://youtu.be/x39LFhQWqGU',   // le clip (lien YouTube / Vimeo, ou 'assets/videos/clip.mp4')
      preview: '', cover: 'assets/projets/clip/clip-cover.jpg', thumb: 'assets/mini/clip-cover.jpg', colors: ['#3a1c71', '#d76d77'] },


    { id: 'mariage', title: 'Mariages', short: 'Mariages', category: 'pro', type: 'Photo',
      client: 'Haja & Nancy · Tolotra & Diana', year: '2026', role: 'Photographie, retouche', duration: '',
      description: "Deux mariages photographiés en 2026, ceux de Haja & Nancy et de Tolotra & Diana : les préparatifs, la cérémonie, les portraits et la réception.",
      kind: 'Reportage photo',
      tags: ['Mariage', 'Événementiel'], tools: ['Lightroom'],
      video: '', preview: '',
      thumb: 'assets/mini/mariage-02.jpg',
      cover: 'assets/projets/mariage/mariage-02.jpg',   // photo de la carte
      /* galleries : une série par mariage (la galerie à plat est calculée toute seule) */
      galleries: [
        { title: 'Haja & Nancy', photos: [
          'assets/projets/mariage/mariage-01.jpg',
          'assets/projets/mariage/mariage-11.jpg',
          'assets/projets/mariage/mariage-04.jpg',
          'assets/projets/mariage/mariage-06.jpg',
          'assets/projets/mariage/mariage-02.jpg',
          'assets/projets/mariage/mariage-13.jpg',
          'assets/projets/mariage/mariage-07.jpg',
          'assets/projets/mariage/mariage-09.jpg',
          'assets/projets/mariage/mariage-03.jpg',
          'assets/projets/mariage/mariage-12.jpg',
          'assets/projets/mariage/mariage-05.jpg',
          'assets/projets/mariage/mariage-08.jpg',
          'assets/projets/mariage/mariage-10.jpg'
        ] },
        { title: 'Tolotra & Diana', photos: [
          'assets/projets/mariage2/tolotra-diana-01.jpg',
          'assets/projets/mariage2/tolotra-diana-02.jpg',
          'assets/projets/mariage2/tolotra-diana-03.jpg',
          'assets/projets/mariage2/tolotra-diana-04.jpg',
          'assets/projets/mariage2/tolotra-diana-05.jpg',
          'assets/projets/mariage2/tolotra-diana-06.jpg',
          'assets/projets/mariage2/tolotra-diana-07.jpg',
          'assets/projets/mariage2/tolotra-diana-08.jpg',
          'assets/projets/mariage2/tolotra-diana-09.jpg',
          'assets/projets/mariage2/tolotra-diana-10.jpg'
        ] }
      ],
      colors: ['#c79081', '#dfa579'] },
    { id: 'intercampus', title: 'Aftermovie Intercampus', short: 'Intercampus', category: 'pro', type: 'Vidéo',
      client: 'Fédération des étudiants de Blois', year: '2025-26', role: 'Tournage, montage', duration: '',
      description: "L'aftermovie de la soirée Intercampus : capturer l'ambiance et la fête, puis les raconter dans une vidéo rythmée.",
      kind: 'Soirée étudiante',
      tags: ['Aftermovie', 'Événementiel', 'Soirée'], tools: ['DaVinci Resolve'],
      video: 'https://youtu.be/vIWecsF3SrU', preview: '', cover: 'assets/projets/intercampus/cover-portrait.jpg', thumb: 'assets/mini/intercampus-portrait.jpg',   // image verticale (remplit toute la carte)
      colors: ['#7b2ff7', '#f107a3'] },



    { id: 'harmonya', title: 'Publicité Harmonya', short: 'Harmonya', category: 'scolaire', type: 'Vidéo',
      client: 'BUT MMI — IUT de Blois (1re année)', year: '2025', role: 'Tournage, montage', duration: '',
      description: "Un projet de première année du BUT MMI : inventer un monde virtuel, Harmonya, et le promouvoir dans une vidéo publicitaire.",
      kind: 'Film publicitaire',
      tags: ['Publicité', 'Monde virtuel'], tools: ['DaVinci Resolve'],
      video: 'https://youtu.be/qoHD0Qa0w3o', preview: '', cover: '', colors: ['#2c3e50', '#c94b4b'] },
    { id: 'autisme', title: "Comprendre l'autisme", short: "Comprendre l'autisme", category: 'scolaire', type: 'Vidéo',
      client: 'BUT MMI — IUT de Blois (2e année)', year: '2025-26', role: "Toute la vidéo, de l'écriture au montage", duration: '',
      description: "Une vidéo pour expliquer l'autisme au grand public, simplement et sans jargon. Réalisée de A à Z, de l'écriture au montage, en deuxième année de BUT MMI.",
      kind: 'Film de sensibilisation',
      tags: ['Sensibilisation', 'Pédagogie'], tools: ['DaVinci Resolve'],
      video: 'https://youtu.be/DSiDXvcQu5U', preview: '', cover: '', colors: ['#1e3c72', '#2a9d8f'] },


    { id: 'youtube', title: 'Ma chaîne YouTube', short: 'YouTube', category: 'pro', type: 'Vidéo',
      client: 'Projet personnel — @ndyxx_mp4', year: '2025', role: 'Conception, tournage, montage', duration: '',
      description: "Ma chaîne YouTube : mes créations personnelles, que je conçois, tourne et monte moi-même, jusqu'aux miniatures.",
      kind: '@ndyxx_mp4',
      tags: ['YouTube', 'Création de contenu'], tools: ['DaVinci Resolve', 'Photoshop'],
      link: { label: 'Voir la chaîne YouTube', url: 'https://www.youtube.com/@ndyxx_mp4' },
      video: '', preview: '', cover: '', colors: ['#f12711', '#f5af19'] }
  ],

};
