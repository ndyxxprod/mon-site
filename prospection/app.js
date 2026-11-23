/* CRM de prospection — NDYXX PROD
   Tout est enregistré dans le navigateur (localStorage). Aucun envoi automatique. */
(function () {
'use strict';

/* ---------- utilitaires ---------- */
const KEY = 'ndy-prospection-v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a, b) => Math.round((parseD(a) - parseD(b)) / 864e5);
const fmt = (s, short) => s ? parseD(s).toLocaleDateString('fr-FR', short ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
const fmtShort = s => s ? parseD(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
const uniq = a => [...new Set(a.filter(Boolean))].sort((x, y) => x.localeCompare(y, 'fr'));
const pct = (a, b) => b ? Math.round(a / b * 100) + ' %' : '—';
const plural = (n, a, b) => n + ' ' + (n > 1 ? b : a);

/* ---------- référentiels ---------- */
const CHANNELS = [
  { k: 'email', n: 'E-mail', c: '#4f6df5', g: '<path d="M4 6.5h16v11H4z"/><path d="m4.5 7.5 7.5 5.8 7.5-5.8"/>' },
  { k: 'instagram', n: 'Instagram DM', c: 'linear-gradient(135deg,#f9a03f,#e1306c 55%,#7b3fe4)', g: '<rect x="5" y="5" width="14" height="14" rx="4.2"/><circle cx="12" cy="12" r="3.2"/><circle cx="16.3" cy="7.7" r=".7" fill="#fff" stroke="none"/>' },
  { k: 'linkedin', n: 'LinkedIn', c: '#0a66c2', g: '<path d="M7.5 10.5V17M7.5 7.3v.1M11.5 17v-6.5M11.5 13.2c0-1.9 1.1-2.9 2.6-2.9 1.6 0 2.4 1.1 2.4 2.9V17"/>' },
  { k: 'phone', n: 'Téléphone', c: '#16a34a', g: '<path d="M6.8 4.5h2.6l1.4 3.6-1.9 1.3a9.5 9.5 0 0 0 5.2 5.2l1.3-1.9 3.6 1.4v2.6a2 2 0 0 1-2.2 2A13.5 13.5 0 0 1 4.8 6.7a2 2 0 0 1 2-2.2z"/>' },
  { k: 'whatsapp', n: 'WhatsApp', c: '#25a244', g: '<path d="M5 19l1.1-3.5A7.4 7.4 0 1 1 9 17.9z"/><path d="M9.6 9.3c.2 2 1.9 3.8 4.1 4.5l1.2-1.2-1.7-.9-.9.7c-.8-.4-1.4-1-1.8-1.8l.7-.9-.9-1.7z"/>' },
  { k: 'messenger', n: 'Facebook Messenger', c: '#0084ff', g: '<path d="M12 4.5a7.5 7.5 0 0 0-7.5 7.6c0 2.3 1 4.1 2.6 5.3V20l2.4-1.3c.8.2 1.6.4 2.5.4a7.5 7.5 0 0 0 0-14.6z"/><path d="m8.3 13.4 2.8-2.9 1.9 1.9 2.7-2.4"/>' },
  { k: 'person', n: 'Contact en personne', c: '#f59e0b', g: '<circle cx="12" cy="8.5" r="3.2"/><path d="M5.8 19c.6-3.3 3-4.9 6.2-4.9s5.6 1.6 6.2 4.9"/>' },
  { k: 'other', n: 'Autre', c: '#6b7280', g: '<circle cx="6.5" cy="12" r="1.2" fill="#fff"/><circle cx="12" cy="12" r="1.2" fill="#fff"/><circle cx="17.5" cy="12" r="1.2" fill="#fff"/>' }
];
const CH = Object.fromEntries(CHANNELS.map(c => [c.k, c]));
const chIcon = (k, label, lg) => {
  const c = CH[k]; if (!c) return '<span class="muted">—</span>';
  return `<span class="ch${lg ? ' lg' : ''}" title="${esc(c.n)}"><i style="background:${c.c}"><svg viewBox="0 0 24 24" aria-hidden="true">${c.g}</svg></i>${label ? `<em>${esc(c.n)}</em>` : ''}</span>`;
};

const ATYPES = {
  first:    { n: 'Premier contact',       dir: 'out' },
  followup: { n: 'Relance',               dir: 'out' },
  message:  { n: 'Message envoyé',        dir: 'out' },
  quote:    { n: 'Devis envoyé',          dir: 'out' },
  reply:    { n: 'Réponse reçue',         dir: 'in' },
  meeting:  { n: 'Échange / rendez-vous', dir: 'x' },
  note:     { n: 'Note',                  dir: 'none' },
  status:   { n: 'Changement de statut',  dir: 'none' }
};
const RTYPES = [
  { k: 'interested', n: 'Intéressé', g: 'pos' },
  { k: 'info', n: 'Demande de renseignements', g: 'pos' },
  { k: 'pricing', n: 'Demande de tarifs', g: 'pos' },
  { k: 'quote', n: 'Demande de devis', g: 'pos' },
  { k: 'accept', n: 'Acceptation', g: 'pos' },
  { k: 'refuse', n: 'Refus', g: 'neg' },
  { k: 'noneed', n: 'Pas de besoin actuellement', g: 'neg' },
  { k: 'provider', n: 'Déjà un prestataire', g: 'neg' },
  { k: 'budget', n: 'Budget insuffisant', g: 'neg' },
  { k: 'later', n: 'Réponse à recontacter plus tard', g: 'neu' },
  { k: 'other', n: 'Autre', g: 'neu' }
];
const RT = Object.fromEntries(RTYPES.map(r => [r.k, r]));
/* À la réception d'une réponse : statut proposé, prochaine action proposée, délai (jours) */
const RULE = {
  interested: ['interested', 'Proposer un échange ou un appel', 2],
  info: ['discussion', 'Répondre à la demande de renseignements', 1],
  pricing: ['discussion', 'Envoyer un devis', 1],
  quote: ['quote_req', 'Envoyer le devis', 1],
  accept: ['accepted', 'Planifier le tournage', 2],
  refuse: ['refused', '', 0], noneed: ['refused', '', 0], provider: ['refused', '', 0], budget: ['refused', '', 0],
  later: ['later', 'Recontacter', 90],
  other: ['replied', '', 0]
};
const STAGES = { new: 'Nouveau', contacted: 'Contacté', replied: 'A répondu', interested: 'Intéressé', quote: 'Devis', accepted: 'Accepté', client: 'Client gagné', lost: 'Perdu / refus', paused: 'En pause' };
const DEFAULT_STATUSES = [
  ['todo', 'À contacter', '#94a3b8', 'new'], ['contacted', 'Contact effectué', '#38bdf8', 'contacted'],
  ['sent', 'Message envoyé', '#0ea5e9', 'contacted'], ['waiting', 'En attente de réponse', '#6366f1', 'contacted'],
  ['tofollow', 'Relance à effectuer', '#f97316', 'contacted'], ['followed', 'Relance envoyée', '#fb923c', 'contacted'],
  ['replied', 'Réponse reçue', '#a78bfa', 'replied'], ['discussion', 'Discussion en cours', '#8b5cf6', 'replied'],
  ['interested', 'Prospect intéressé', '#14b8a6', 'interested'], ['quote_req', 'Devis demandé', '#10b981', 'interested'],
  ['quote_sent', 'Devis envoyé', '#22c55e', 'quote'], ['negotiation', 'En négociation', '#eab308', 'quote'],
  ['accepted', 'Proposition acceptée', '#16a34a', 'accepted'], ['won', 'Client gagné', '#15803d', 'client'],
  ['refused', 'Refus reçu', '#ef4444', 'lost'], ['lost', 'Prospect perdu', '#b91c1c', 'lost'],
  ['later', 'À recontacter plus tard', '#64748b', 'paused']
].map(([k, n, c, s]) => ({ k, n, c, s }));

/* départements -> régions (code postal français) */
const REGIONS = { ARA: 'Auvergne-Rhône-Alpes', BFC: 'Bourgogne-Franche-Comté', BRE: 'Bretagne', CVL: 'Centre-Val de Loire', COR: 'Corse', GES: 'Grand Est', HDF: 'Hauts-de-France', IDF: 'Île-de-France', NOR: 'Normandie', NAQ: 'Nouvelle-Aquitaine', OCC: 'Occitanie', PDL: 'Pays de la Loire', PAC: "Provence-Alpes-Côte d'Azur" };
const DEPTS = {};
'01:Ain:ARA|02:Aisne:HDF|03:Allier:ARA|04:Alpes-de-Haute-Provence:PAC|05:Hautes-Alpes:PAC|06:Alpes-Maritimes:PAC|07:Ardèche:ARA|08:Ardennes:GES|09:Ariège:OCC|10:Aube:GES|11:Aude:OCC|12:Aveyron:OCC|13:Bouches-du-Rhône:PAC|14:Calvados:NOR|15:Cantal:ARA|16:Charente:NAQ|17:Charente-Maritime:NAQ|18:Cher:CVL|19:Corrèze:NAQ|21:Côte-d\'Or:BFC|22:Côtes-d\'Armor:BRE|23:Creuse:NAQ|24:Dordogne:NAQ|25:Doubs:BFC|26:Drôme:ARA|27:Eure:NOR|28:Eure-et-Loir:CVL|29:Finistère:BRE|2A:Corse-du-Sud:COR|2B:Haute-Corse:COR|30:Gard:OCC|31:Haute-Garonne:OCC|32:Gers:OCC|33:Gironde:NAQ|34:Hérault:OCC|35:Ille-et-Vilaine:BRE|36:Indre:CVL|37:Indre-et-Loire:CVL|38:Isère:ARA|39:Jura:BFC|40:Landes:NAQ|41:Loir-et-Cher:CVL|42:Loire:ARA|43:Haute-Loire:ARA|44:Loire-Atlantique:PDL|45:Loiret:CVL|46:Lot:OCC|47:Lot-et-Garonne:NAQ|48:Lozère:OCC|49:Maine-et-Loire:PDL|50:Manche:NOR|51:Marne:GES|52:Haute-Marne:GES|53:Mayenne:PDL|54:Meurthe-et-Moselle:GES|55:Meuse:GES|56:Morbihan:BRE|57:Moselle:GES|58:Nièvre:BFC|59:Nord:HDF|60:Oise:HDF|61:Orne:NOR|62:Pas-de-Calais:HDF|63:Puy-de-Dôme:ARA|64:Pyrénées-Atlantiques:NAQ|65:Hautes-Pyrénées:OCC|66:Pyrénées-Orientales:OCC|67:Bas-Rhin:GES|68:Haut-Rhin:GES|69:Rhône:ARA|70:Haute-Saône:BFC|71:Saône-et-Loire:BFC|72:Sarthe:PDL|73:Savoie:ARA|74:Haute-Savoie:ARA|75:Paris:IDF|76:Seine-Maritime:NOR|77:Seine-et-Marne:IDF|78:Yvelines:IDF|79:Deux-Sèvres:NAQ|80:Somme:HDF|81:Tarn:OCC|82:Tarn-et-Garonne:OCC|83:Var:PAC|84:Vaucluse:PAC|85:Vendée:PDL|86:Vienne:NAQ|87:Haute-Vienne:NAQ|88:Vosges:GES|89:Yonne:BFC|90:Territoire de Belfort:BFC|91:Essonne:IDF|92:Hauts-de-Seine:IDF|93:Seine-Saint-Denis:IDF|94:Val-de-Marne:IDF|95:Val-d\'Oise:IDF'
  .split('|').forEach(x => { const [c, n, r] = x.split(':'); DEPTS[c] = { n, r: REGIONS[r] }; });
function geoFromZip(zip) {
  const z = String(zip || '').replace(/\s/g, '');
  if (!/^\d{5}$/.test(z)) return null;
  let code = z.slice(0, 2);
  if (code === '20') code = +z < 20200 ? '2A' : '2B';
  const d = DEPTS[code];
  return d ? { dept: d.n, region: d.r } : null;
}

const SECTORS = ['Restauration', 'Sport / fitness', 'Immobilier', 'Commerce', 'Mode', 'Beauté / coiffure', 'Événementiel', 'Santé', 'Association', 'Artiste / musique', 'Hôtellerie / tourisme', 'Éducation', 'Autre'];
const SERVICES = ['Contenus réseaux sociaux', 'Clip', 'Publicité', 'Aftermovie', 'Vidéo de présentation', 'Couverture sportive', 'Mariage', 'Photo', 'Autre'];

/* ---------- données ---------- */
let db;
let memoryOnly = false;
function blankDb() { return { v: 1, statuses: DEFAULT_STATUSES.map(s => ({ ...s })), settings: { delay: 4, lastExport: '' }, prospects: [] }; }
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); if (d && Array.isArray(d.prospects)) { d.statuses = (d.statuses && d.statuses.length) ? d.statuses : DEFAULT_STATUSES.map(s => ({ ...s })); d.settings = Object.assign({ delay: 4, lastExport: '' }, d.settings); return d; } }
  } catch (e) { memoryOnly = true; }
  const d = blankDb(); d.prospects = demo(); return d;
}
/* ---------- sauvegarde en ligne (dépôt GitHub privé) ---------- */
const SYNC_KEY = 'ndy-prospection-sync';
const SYNC_FILE = 'prospection.json';
let sync = null;
try { sync = JSON.parse(localStorage.getItem(SYNC_KEY)) || null; } catch (e) { sync = null; }
if (sync && !sync.token) sync = null;
const saveSyncCfg = () => { try { if (sync) localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); else localStorage.removeItem(SYNC_KEY); } catch (e) { } };
let localVer = 0, applyingRemote = false, syncBusy = false, syncTimer = null, syncMsg = '';

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { memoryOnly = true; }
  if (applyingRemote) return;
  localVer++;
  if (sync) { sync.dirty = true; saveSyncCfg(); setSyncState('dirty'); scheduleSync(); }
}

function demo() {
  const t = today(); const d = n => addDays(t, n);
  let i = 0; const A = (date, type, o) => ({ id: uid(), ts: Date.now() + (i++), date, type, channel: '', message: '', rtype: '', rtext: '', status: '', next: '', nextDate: '', ...o });
  const P = o => ({ id: uid(), company: '', contact: '', email: '', phone: '', social: '', city: '', zip: '', dept: '', region: '', country: 'France', address: '', website: '', maps: '', sector: '', service: '', notes: 'Exemple de démonstration — tu peux le supprimer.', status: 'todo', nextAction: '', followUp: '', lostReason: '', createdAt: t, demo: true, actions: [], ...o });
  return [
    P({ company: 'Salon Léa Coiffure (démo)', contact: 'Léa', city: 'Blois', zip: '41000', dept: 'Loir-et-Cher', region: 'Centre-Val de Loire', sector: 'Beauté / coiffure', service: 'Contenus réseaux sociaux', status: 'discussion', nextAction: 'Envoyer un devis', followUp: t,
      actions: [
        A(d(-6), 'first', { channel: 'instagram', message: 'Proposition de création de contenus vidéo pour les réseaux sociaux.', status: 'sent', next: 'Relance prévue', nextDate: d(-2) }),
        A(d(-2), 'followup', { channel: 'instagram', message: 'Relance concernant la proposition initiale.', status: 'followed', next: 'Attendre la réponse', nextDate: d(3) }),
        A(t, 'reply', { channel: 'instagram', rtype: 'pricing', rtext: 'Bonjour, ça m\'intéresse ! Quels sont vos tarifs ?', status: 'discussion', next: 'Envoyer un devis', nextDate: t })
      ] }),
    P({ company: 'Crossfit Atlantique (démo)', contact: 'Marc', city: 'Nantes', zip: '44000', dept: 'Loire-Atlantique', region: 'Pays de la Loire', sector: 'Sport / fitness', service: 'Vidéo de présentation', status: 'followed', nextAction: 'Relance par téléphone', followUp: d(-1),
      actions: [
        A(d(-9), 'first', { channel: 'email', message: 'Présentation + proposition de vidéo de salle.', status: 'sent', next: 'Relance prévue', nextDate: d(-5) }),
        A(d(-5), 'followup', { channel: 'email', message: 'Relance par e-mail.', status: 'followed', next: 'Relance par téléphone', nextDate: d(-1) })
      ] }),
    P({ company: 'Agence Immo Loire (démo)', contact: '', city: 'Nantes', zip: '44000', dept: 'Loire-Atlantique', region: 'Pays de la Loire', sector: 'Immobilier', service: 'Vidéo de présentation', status: 'todo' }),
    P({ company: 'Restaurant Le Quai (démo)', contact: 'Sophie', city: 'Blois', zip: '41000', dept: 'Loir-et-Cher', region: 'Centre-Val de Loire', sector: 'Restauration', service: 'Contenus réseaux sociaux', status: 'refused',
      actions: [
        A(d(-14), 'first', { channel: 'whatsapp', message: 'Proposition de vidéos pour leurs réseaux.', status: 'sent', next: 'Relance prévue', nextDate: d(-10) }),
        A(d(-11), 'reply', { channel: 'whatsapp', rtype: 'budget', rtext: 'Merci mais on n\'a pas le budget pour le moment.', status: 'refused' })
      ] }),
    P({ company: 'Brasserie des Halles (démo)', contact: 'Karim', city: 'Blois', zip: '41000', dept: 'Loir-et-Cher', region: 'Centre-Val de Loire', sector: 'Restauration', service: 'Publicité', status: 'won',
      actions: [
        A(d(-32), 'first', { channel: 'person', message: 'Passage sur place, présentation du travail.', status: 'contacted', next: 'Envoyer un devis', nextDate: d(-30) }),
        A(d(-30), 'reply', { channel: 'person', rtype: 'quote', rtext: 'Envoyez-moi un devis, ça nous intéresse.', status: 'quote_req' }),
        A(d(-28), 'quote', { channel: 'email', message: 'Devis pour une vidéo promo.', status: 'quote_sent', next: 'Relancer pour le devis', nextDate: d(-24) }),
        A(d(-25), 'reply', { channel: 'email', rtype: 'accept', rtext: 'C\'est d\'accord, on fait ça !', status: 'accepted' }),
        A(d(-20), 'note', { message: 'Tournage réalisé, facture payée.', status: 'won' })
      ] }),
    P({ company: 'Studio Danse Nantes (démo)', contact: 'Inès', city: 'Nantes', zip: '44000', dept: 'Loire-Atlantique', region: 'Pays de la Loire', sector: 'Événementiel', service: 'Aftermovie', status: 'waiting', nextAction: 'Relance LinkedIn', followUp: d(3),
      actions: [A(d(-3), 'first', { channel: 'linkedin', message: 'Proposition d\'aftermovie pour leur gala de fin d\'année.', status: 'waiting', next: 'Relance LinkedIn', nextDate: d(3) })] })
  ];
}

const statusOf = k => db.statuses.find(s => s.k === k) || { k, n: k || '—', c: '#94a3b8', s: 'new' };
const stageOf = k => statusOf(k).s;
const byDate = (a, b) => a.date.localeCompare(b.date) || a.ts - b.ts;
const OUT = t => ATYPES[t] && ATYPES[t].dir === 'out';

function derive(p) {
  const acts = [...p.actions].sort(byDate);
  const contacts = acts.filter(a => a.type !== 'note' && a.type !== 'status');
  const outs = acts.filter(a => OUT(a.type));
  const ins = acts.filter(a => a.type === 'reply');
  const first = contacts[0], last = contacts[contacts.length - 1];
  const lastIn = ins[ins.length - 1];
  const idxIn = lastIn ? acts.indexOf(lastIn) : -1;
  const unanswered = outs.filter(o => acts.indexOf(o) > idxIn);
  const waitSince = unanswered.length ? unanswered[0].date : '';
  const stage = stageOf(p.status);
  const done = stage === 'client' || stage === 'lost';
  let rel = 'none';
  if (p.followUp && !done) { const dd = diffDays(p.followUp, today()); rel = dd < 0 ? 'late' : dd === 0 ? 'today' : 'soon'; }
  const lastOut = outs[outs.length - 1];
  const suggest = (!p.followUp && lastOut && waitSince && !done && stage !== 'paused') ? addDays(lastOut.date, db.settings.delay) : '';
  const contacted = contacts.length > 0 || stage !== 'new';
  const posReply = ins.some(r => RT[r.rtype] && RT[r.rtype].g === 'pos');
  const negReply = ins.filter(r => RT[r.rtype] && RT[r.rtype].g === 'neg');
  return {
    acts, contacts, outs, ins, first, last, lastIn, lastOut, stage, done, rel, suggest, contacted,
    firstDate: first ? first.date : '', lastDate: last ? last.date : '',
    lastChannel: last && last.channel ? last.channel : '',
    firstChannel: (outs[0] || first || {}).channel || '',
    sent: outs.length, relances: acts.filter(a => a.type === 'followup').length,
    replied: ins.length > 0,
    daysNoReply: waitSince ? Math.max(0, diffDays(today(), waitSince)) : null,
    interested: ['interested', 'quote', 'accepted', 'client'].includes(stage) || posReply,
    refused: stage === 'lost' || negReply.length > 0,
    quoteSent: acts.some(a => a.type === 'quote' || stageOf(a.status) === 'quote') || stage === 'quote',
    accepted: ['accepted', 'client'].includes(stage) || acts.some(a => ['accepted', 'client'].includes(stageOf(a.status)) || a.rtype === 'accept'),
    client: stage === 'client',
    refusalReason: p.lostReason || (negReply.length ? negReply[negReply.length - 1].rtype : '')
  };
}

/* ---------- état de l'interface ---------- */
const ui = { view: 'dashboard', mode: 'table', filters: {}, showFilters: false, sort: { k: 'last', d: -1 }, openId: null, form: null, histDesc: false, detailsOpen: false };
const VIEW_TITLES = { dashboard: 'Tableau de bord', prospects: 'Prospects', stats: 'Statistiques', settings: 'Réglages' };

/* ---------- affichage commun ---------- */
function relLabel(d, p) {
  if (d.rel === 'late') return `Relance en retard · ${-diffDays(p.followUp, today())} j`;
  if (d.rel === 'today') return 'Relance aujourd’hui';
  if (d.rel === 'soon') { const n = diffDays(p.followUp, today()); return `Relance prévue · ${n === 1 ? 'demain' : 'dans ' + n + ' j'}`; }
  return 'Aucune relance nécessaire';
}
const relBadge = (d, p) => `<span class="badge rel-${d.rel}">${esc(relLabel(d, p))}</span>`;
function statusSelect(p, cls) {
  const s = statusOf(p.status);
  return `<span class="st" style="--sc:${s.c}"><select data-status="${p.id}" ${cls ? `class="${cls}"` : ''} aria-label="Statut">${db.statuses.map(x => `<option value="${x.k}" ${x.k === p.status ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select></span>`;
}
const opts = (list, sel, blank) => (blank != null ? `<option value="">${esc(blank)}</option>` : '') + list.map(o => { const [v, n] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(n)}</option>`; }).join('');
const lastReplyText = (d) => {
  if (!d.lastIn) return '';
  const r = d.lastIn; return (RT[r.rtype] ? RT[r.rtype].n : 'Réponse') + (r.rtext ? ' — ' + r.rtext : '');
};
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2600); }
function mapsUrl(p) {
  if (p.maps) return p.maps;
  const q = [p.company.replace(/\(démo\)/, ''), p.address, p.zip, p.city].filter(Boolean).join(' ');
  return q.trim() ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q) : '';
}
const webUrl = u => !u ? '' : (/^https?:\/\//i.test(u) ? u : 'https://' + u);

/* ---------- filtres ---------- */
function applyFilters(list) {
  const f = ui.filters; const q = (f.q || '').trim().toLowerCase();
  return list.filter(p => {
    const d = derive(p);
    if (q && ![p.company, p.contact, p.city, p.dept, p.region, p.country, p.sector, p.service, p.notes, p.email, p.zip].join(' ').toLowerCase().includes(q)) return false;
    if (f.city && p.city !== f.city) return false;
    if (f.dept && p.dept !== f.dept) return false;
    if (f.region && p.region !== f.region) return false;
    if (f.country && p.country !== f.country) return false;
    if (f.channel && !p.actions.some(a => a.channel === f.channel)) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.service && p.service !== f.service) return false;
    if (f.sector && p.sector !== f.sector) return false;
    if (f.resp === 'interested' && !d.interested) return false;
    if (f.resp === 'refused' && !d.refused) return false;
    if (f.resp === 'noreply' && !(d.contacted && !d.replied)) return false;
    if (f.resp === 'replied' && !d.replied) return false;
    if (f.resp === 'client' && !d.client) return false;
    if (f.rel === 'due' && !(d.rel === 'late' || d.rel === 'today')) return false;
    if (f.rel && f.rel !== 'due' && d.rel !== f.rel) return false;
    const rng = (v, a, b) => !(a || b) || (v && (!a || v >= a) && (!b || v <= b));
    if (!rng(d.firstDate, f.firstFrom, f.firstTo)) return false;
    if (!rng(d.lastDate, f.lastFrom, f.lastTo)) return false;
    if (!rng(p.followUp, f.relFrom, f.relTo)) return false;
    return true;
  });
}
const activeFilterCount = () => Object.entries(ui.filters).filter(([k, v]) => k !== 'q' && v).length;

function sortList(list) {
  const { k, d } = ui.sort;
  const key = p => {
    const x = derive(p);
    switch (k) {
      case 'company': return p.company.toLowerCase();
      case 'city': return p.city.toLowerCase();
      case 'channel': return x.lastChannel ? CH[x.lastChannel].n : '';
      case 'last': return x.lastDate;
      case 'status': return db.statuses.findIndex(s => s.k === p.status);
      case 'reply': return x.lastIn ? (RT[x.lastIn.rtype] || { n: 'a' }).n : '';
      case 'next': return p.followUp || '';
    }
    return '';
  };
  return [...list].sort((a, b) => {
    const ka = key(a), kb = key(b);
    if (ka === '' && kb !== '') return 1; if (kb === '' && ka !== '') return -1;
    return (ka < kb ? -1 : ka > kb ? 1 : 0) * d;
  });
}

/* ---------- tableau de bord ---------- */
function relRow(p, d) {
  return `<div class="row" data-act="open" data-id="${p.id}">
    <div class="row-main"><b>${esc(p.company || 'Sans nom')}</b><small>${esc([p.city, p.contact].filter(Boolean).join(' · '))}</small><small>▸ ${esc(p.nextAction || 'Relancer')}</small></div>
    ${chIcon(d.lastChannel)}
    ${relBadge(d, p)}
    <div class="row-btns"><button class="btn sm primary" data-act="followup" data-id="${p.id}">Relancer</button><button class="btn sm" data-act="snooze" data-id="${p.id}" data-days="3" title="Reporter de 3 jours">+3 j</button></div>
  </div>`;
}
function viewDashboard() {
  const all = db.prospects.map(p => [p, derive(p)]);
  const late = all.filter(([, d]) => d.rel === 'late').sort((a, b) => a[0].followUp.localeCompare(b[0].followUp));
  const tod = all.filter(([, d]) => d.rel === 'today');
  const soon = all.filter(([, d]) => d.rel === 'soon').sort((a, b) => a[0].followUp.localeCompare(b[0].followUp)).slice(0, 8);
  const sugg = all.filter(([, d]) => d.suggest);
  const toContact = all.filter(([, d]) => d.stage === 'new' && !d.contacts.length);
  const S = computeStats(db.prospects);
  const recent = db.prospects.flatMap(p => p.actions.filter(a => a.type !== 'status').map(a => [p, a])).sort((a, b) => b[1].date.localeCompare(a[1].date) || b[1].ts - a[1].ts).slice(0, 7);
  const hasDemo = db.prospects.some(p => p.demo);
  const backupOld = db.prospects.some(p => !p.demo) && (!db.settings.lastExport || diffDays(today(), db.settings.lastExport) > 14);
  return `
  ${hasDemo ? `<div class="banner"><span>Des prospects <b>de démonstration</b> sont affichés pour que tu voies comment ça marche.</span><button class="btn sm" data-act="cleardemo">Supprimer la démo</button></div>` : ''}
  ${backupOld ? `<div class="banner"><span>Pense à faire une <b>sauvegarde</b> : les données sont dans ce navigateur uniquement.</span><button class="btn sm" data-act="exportjson">Exporter une sauvegarde</button></div>` : ''}
  ${memoryOnly ? `<div class="banner"><span><b>Attention :</b> ce navigateur n'enregistre pas les données (navigation privée ?). Exporte ta sauvegarde avant de quitter.</span></div>` : ''}
  <div class="kpis">
    <div class="kpi"><b>${S.total}</b><span>Prospects</span></div>
    <div class="kpi"><b>${S.contacted}</b><span>Contactés</span></div>
    <div class="kpi"><b>${S.replied}</b><span>Ont répondu · ${pct(S.replied, S.contacted)}</span></div>
    <div class="kpi"><b>${S.interested}</b><span>Intéressés</span></div>
    <div class="kpi"><b>${S.quotes}</b><span>Devis envoyés</span></div>
    <div class="kpi acc"><b>${S.clients}</b><span>Clients · ${pct(S.clients, S.contacted)}</span></div>
  </div>
  <div class="grid g2" style="align-items:start">
    <section class="card" style="grid-column:1/-1">
      <h2>Relances du jour <small>${late.length + tod.length ? plural(late.length + tod.length, 'à faire', 'à faire') : 'rien d’urgent'}</small></h2>
      ${late.length ? `<div class="group-title">En retard (${late.length})</div><div class="rows">${late.map(([p, d]) => relRow(p, d)).join('')}</div>` : ''}
      ${tod.length ? `<div class="group-title">Aujourd’hui (${tod.length})</div><div class="rows">${tod.map(([p, d]) => relRow(p, d)).join('')}</div>` : ''}
      ${!late.length && !tod.length ? '<p class="empty">Aucune relance à faire aujourd’hui. 🎉</p>' : ''}
      ${soon.length ? `<div class="group-title">Prévues prochainement</div><div class="rows">${soon.map(([p, d]) => relRow(p, d)).join('')}</div>` : ''}
    </section>
    <section class="card">
      <h2>À planifier <small>sans relance prévue</small></h2>
      ${sugg.length ? `<div class="rows">${sugg.map(([p, d]) => `<div class="row" data-act="open" data-id="${p.id}"><div class="row-main"><b>${esc(p.company)}</b><small>${esc(p.city)} · ${d.daysNoReply} j sans réponse</small></div>${chIcon(d.lastChannel)}<button class="btn sm" data-act="applysuggest" data-id="${p.id}">Relance le ${fmtShort(d.suggest)}</button></div>`).join('')}</div>` : '<p class="empty">Tous tes messages sans réponse ont une relance prévue.</p>'}
    </section>
    <section class="card">
      <h2>À contacter <small>${toContact.length}</small></h2>
      ${toContact.length ? `<div class="rows">${toContact.slice(0, 6).map(([p]) => `<div class="row" data-act="open" data-id="${p.id}"><div class="row-main"><b>${esc(p.company)}</b><small>${esc([p.city, p.sector].filter(Boolean).join(' · '))}</small></div><button class="btn sm primary" data-act="firstcontact" data-id="${p.id}">Premier contact</button></div>`).join('')}</div>` : '<p class="empty">Aucun prospect en attente de premier contact.</p>'}
    </section>
    <section class="card" style="grid-column:1/-1">
      <h2>Activité récente</h2>
      ${recent.length ? `<div class="rows">${recent.map(([p, a]) => `<div class="row" data-act="open" data-id="${p.id}">${chIcon(a.channel)}<div class="row-main"><b>${esc(p.company)}</b><small>${fmt(a.date, true)} · ${esc(ATYPES[a.type].n)}${a.type === 'reply' && RT[a.rtype] ? ' — ' + esc(RT[a.rtype].n) : ''}</small></div></div>`).join('')}</div>` : '<p class="empty">Aucune action enregistrée pour l’instant.</p>'}
    </section>
  </div>`;
}

/* ---------- prospects : tableau + kanban ---------- */
function viewProspects() {
  const f = ui.filters;
  const P = db.prospects;
  const cities = {}; P.forEach(p => { if (p.city) cities[p.city] = (cities[p.city] || 0) + 1; });
  const cityChips = Object.entries(cities).sort((a, b) => b[1] - a[1]);
  const q = (k, v, label) => `<button class="chip ${((f[k] || '') === v) ? 'on' : ''}" data-act="quick" data-k="${k}" data-v="${v}">${label}</button>`;
  const sel = (key, label, list, blank) => `<label>${label}<select data-filter="${key}">${opts(list, f[key] || '', blank || 'Tous')}</select></label>`;
  const rng = (a, b, label) => `<label>${label}<span class="range"><input type="date" data-filter="${a}" value="${f[a] || ''}" aria-label="${label} du" /><input type="date" data-filter="${b}" value="${f[b] || ''}" aria-label="${label} au" /></span></label>`;
  const n = activeFilterCount();
  return `
  <div class="bar">
    <input class="search" data-filter="q" placeholder="Rechercher : entreprise, contact, ville, notes…" value="${esc(f.q || '')}" />
    <div class="seg"><button class="${ui.mode === 'table' ? 'on' : ''}" data-act="mode" data-mode="table">Tableau</button><button class="${ui.mode === 'kanban' ? 'on' : ''}" data-act="mode" data-mode="kanban">Kanban</button></div>
    <button class="btn" data-act="togglefilters">Filtres${n ? ` (${n})` : ''}</button>
    <button class="btn" data-act="exportcsv" title="Exporte la liste affichée">Export CSV</button>
  </div>
  <div class="chips">
    ${q('resp', '', 'Tous')}${q('rel', 'due', 'Relances à faire')}${q('resp', 'interested', 'Intéressés')}${q('resp', 'noreply', 'Sans réponse')}${q('resp', 'refused', 'Refus')}${q('resp', 'client', 'Clients')}
  </div>
  ${cityChips.length ? `<div class="chips"><span class="chips-label">Par ville</span>${cityChips.map(([c, k]) => `<button class="chip ${f.city === c ? 'on' : ''}" data-act="citychip" data-city="${esc(c)}">${esc(c)}<b>${k}</b></button>`).join('')}</div>` : ''}
  ${ui.showFilters ? `<div class="filters">
    ${sel('city', 'Ville', uniq(P.map(p => p.city)))}${sel('dept', 'Département', uniq(P.map(p => p.dept)))}${sel('region', 'Région', uniq(P.map(p => p.region)))}${sel('country', 'Pays', uniq(P.map(p => p.country)))}
    ${sel('channel', 'Canal', CHANNELS.map(c => [c.k, c.n]))}${sel('status', 'Statut', db.statuses.map(s => [s.k, s.n]))}
    ${sel('service', 'Type de prestation', uniq(P.map(p => p.service)))}${sel('sector', 'Secteur d’activité', uniq(P.map(p => p.sector)))}
    ${sel('resp', 'Réponse', [['interested', 'Intéressés'], ['replied', 'Ont répondu'], ['refused', 'Ont refusé'], ['noreply', 'Sans réponse'], ['client', 'Clients']])}
    ${sel('rel', 'Relance', [['due', 'À faire (retard + aujourd’hui)'], ['late', 'En retard'], ['today', 'Aujourd’hui'], ['soon', 'Prévue prochainement'], ['none', 'Aucune']])}
    ${rng('firstFrom', 'firstTo', 'Premier contact')}${rng('lastFrom', 'lastTo', 'Dernier contact')}${rng('relFrom', 'relTo', 'Date de relance')}
    <div style="display:flex;align-items:end"><button class="btn sm" data-act="clearfilters">Réinitialiser</button></div>
  </div>` : ''}
  <div id="results"></div>`;
}
function renderResults() {
  const box = $('#results'); if (!box) return;
  const list = sortList(applyFilters(db.prospects));
  const head = `<div class="res-head"><span>${plural(list.length, 'prospect', 'prospects')}${list.length !== db.prospects.length ? ` sur ${db.prospects.length}` : ''}</span></div>`;
  if (!list.length) { box.innerHTML = head + `<div class="card empty">${db.prospects.length ? 'Aucun prospect ne correspond à ces filtres.' : 'Aucun prospect. Clique sur « + Nouveau prospect » pour commencer.'}</div>`; return; }
  box.innerHTML = head + (ui.mode === 'kanban' ? kanban(list) : table(list));
}
function table(list) {
  const th = (k, label) => `<th class="${ui.sort.k === k ? 'sorted' : ''}"><button data-act="sort" data-k="${k}">${label}${ui.sort.k === k ? (ui.sort.d > 0 ? ' ▲' : ' ▼') : ''}</button></th>`;
  return `<div class="tbl-wrap"><table>
    <thead><tr>${th('company', 'Entreprise')}${th('city', 'Ville')}${th('channel', 'Canal')}${th('last', 'Date du contact')}${th('status', 'Statut')}${th('reply', 'Réponse')}${th('next', 'Prochaine action')}</tr></thead>
    <tbody>${list.map(p => {
      const d = derive(p);
      return `<tr class="pr" data-act="open" data-id="${p.id}">
        <td class="company"><b>${esc(p.company || 'Sans nom')}</b><span class="sub">${esc(p.contact)}</span></td>
        <td>${esc(p.city) || '—'}<span class="sub">${esc(p.dept)}</span></td>
        <td>${d.lastChannel ? chIcon(d.lastChannel, true) : '<span class="muted">—</span>'}</td>
        <td>${d.lastDate ? fmt(d.lastDate, true) : '—'}<span class="sub">${d.firstDate && d.firstDate !== d.lastDate ? '1er : ' + fmtShort(d.firstDate) : ''}</span></td>
        <td>${statusSelect(p)}</td>
        <td class="reply-cell">${d.replied ? `<span style="color:var(--fg)">${esc(RT[d.lastIn.rtype] ? RT[d.lastIn.rtype].n : 'Réponse')}</span><span>${esc(d.lastIn.rtext)}</span>` : (d.contacted ? `<span>Aucune réponse${d.daysNoReply != null ? ' · ' + d.daysNoReply + ' j' : ''}</span>` : '<span>—</span>')}</td>
        <td class="next-cell"><span class="t">${esc(p.nextAction || (p.followUp ? 'Relancer' : '—'))}${p.followUp ? ' · ' + fmtShort(p.followUp) : ''}</span>${p.followUp || d.rel !== 'none' ? relBadge(d, p) : ''}</td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}
function kanban(list) {
  const cols = db.statuses.map(s => [s, list.filter(p => p.status === s.k)]);
  return `<div class="kanban">${cols.map(([s, ps]) => `
    <div class="col" data-col="${s.k}" style="--sc:${s.c}"><div class="col-h"><i></i>${esc(s.n)}<em>${ps.length}</em></div>
      ${ps.map(p => { const d = derive(p); return `<div class="kcard" draggable="true" data-id="${p.id}" data-act="open">
        <b>${esc(p.company || 'Sans nom')}</b><small>${esc([p.city, p.service].filter(Boolean).join(' · '))}</small>
        <div class="kf">${d.lastChannel ? chIcon(d.lastChannel) : '<span></span>'}${d.rel !== 'none' ? relBadge(d, p) : (d.daysNoReply != null ? `<span class="muted" style="font-size:12px">${d.daysNoReply} j sans réponse</span>` : '')}</div>
        <select data-status="${p.id}" aria-label="Déplacer">${db.statuses.map(x => `<option value="${x.k}" ${x.k === p.status ? 'selected' : ''}>${esc(x.n)}</option>`).join('')}</select>
      </div>`; }).join('')}
    </div>`).join('')}</div>`;
}

/* ---------- statistiques ---------- */
function computeStats(list) {
  const S = { total: list.length, contacted: 0, messages: 0, replied: 0, replies: 0, interested: 0, quotes: 0, accepted: 0, clients: 0, refused: 0, byChannel: {}, reasons: {}, byCity: {} };
  CHANNELS.forEach(c => S.byChannel[c.k] = { messages: 0, contacted: 0, replied: 0, interested: 0, quotes: 0, accepted: 0, clients: 0, refused: 0 });
  list.forEach(p => {
    const d = derive(p);
    S.messages += d.sent; S.replies += d.ins.length;
    d.outs.forEach(o => { if (S.byChannel[o.channel]) S.byChannel[o.channel].messages++; });
    const city = p.city || 'Non renseignée';
    const C = S.byCity[city] || (S.byCity[city] = { total: 0, contacted: 0, replied: 0, clients: 0 });
    C.total++;
    if (d.contacted) { S.contacted++; C.contacted++; }
    if (d.replied) { S.replied++; C.replied++; }
    if (d.interested) S.interested++;
    if (d.quoteSent) S.quotes++;
    if (d.accepted) S.accepted++;
    if (d.client) { S.clients++; C.clients++; }
    if (d.refused) { S.refused++; const r = d.refusalReason || 'unknown'; S.reasons[r] = (S.reasons[r] || 0) + 1; }
    const ch = S.byChannel[d.firstChannel];
    if (ch && d.contacted) {
      ch.contacted++;
      if (d.replied) ch.replied++; if (d.interested) ch.interested++; if (d.quoteSent) ch.quotes++;
      if (d.accepted) ch.accepted++; if (d.client) ch.clients++; if (d.refused) ch.refused++;
    }
  });
  return S;
}
function viewStats() {
  const S = computeStats(db.prospects);
  const kpi = (v, l, c) => `<div class="kpi ${c || ''}"><b>${v}</b><span>${l}</span></div>`;
  const maxF = Math.max(1, S.contacted);
  const funnel = [['Contactés', S.contacted], ['Ont répondu', S.replied], ['Intéressés', S.interested], ['Devis envoyés', S.quotes], ['Propositions acceptées', S.accepted], ['Clients gagnés', S.clients]];
  const chRows = CHANNELS.map(c => [c, S.byChannel[c.k]]);
  const used = chRows.filter(([, x]) => x.contacted > 0);
  const best = (fn, min) => { let b = null; used.forEach(([c, x]) => { const v = fn(x); if (v > 0 && (!b || v > b.v)) b = { c, v, x }; }); return b; };
  const bRate = best(x => x.contacted >= 1 ? x.replied / x.contacted : 0);
  const bCli = best(x => x.clients);
  const bAcc = best(x => x.accepted);
  const reasonRows = Object.entries(S.reasons).sort((a, b) => b[1] - a[1]);
  const maxR = Math.max(1, ...reasonRows.map(r => r[1]));
  const cityRows = Object.entries(S.byCity).sort((a, b) => b[1].total - a[1].total).slice(0, 10);
  return `
  <div class="kpis">
    ${kpi(S.contacted, 'Prospects contactés')}${kpi(S.messages, 'Messages envoyés')}${kpi(S.replies, 'Réponses reçues')}${kpi(pct(S.replied, S.contacted), 'Taux de réponse', 'acc')}
    ${kpi(S.interested, 'Prospects intéressés')}${kpi(S.quotes, 'Devis envoyés')}${kpi(S.accepted, 'Propositions acceptées')}${kpi(S.refused, 'Refus')}${kpi(pct(S.clients, S.contacted), 'Taux de conversion en clients', 'acc')}
  </div>
  <div class="grid g2" style="align-items:start">
    <section class="card"><h2>Entonnoir de prospection</h2>
      <div class="bars">${funnel.map(([l, v], i) => `<div class="bar-row"><span>${l}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v / maxF * 100)}%"></div></div><span>${v}${i ? ' · ' + pct(v, funnel[i - 1][1]) : ''}</span></div>`).join('')}</div>
      <p class="note">Le pourcentage à droite est calculé par rapport à l’étape précédente.</p>
    </section>
    <section class="card"><h2>Pourquoi je perds des prospects</h2>
      ${reasonRows.length ? `<div class="bars">${reasonRows.map(([k, v]) => `<div class="bar-row"><span>${esc(k === 'unknown' ? 'Raison non précisée' : (RT[k] ? RT[k].n : k))}</span><div class="bar-track"><div class="bar-fill neg" style="width:${Math.round(v / maxR * 100)}%"></div></div><span>${v} · ${pct(v, S.refused)}</span></div>`).join('')}</div>
      <p class="note">Basé sur le type de réponse reçu, ou sur la raison choisie dans la fiche d’un prospect perdu.</p>` : '<p class="empty">Aucun refus enregistré pour l’instant.</p>'}
    </section>
    <section class="card" style="grid-column:1/-1"><h2>Résultats par canal <small>canal du premier contact</small></h2>
      <div class="best">
        <div><small>Meilleur taux de réponse</small><b>${bRate ? chIcon(bRate.c.k, true) + ' · ' + pct(bRate.x.replied, bRate.x.contacted) : '—'}</b></div>
        <div><small>Plus de propositions acceptées</small><b>${bAcc ? chIcon(bAcc.c.k, true) + ' · ' + bAcc.x.accepted : '—'}</b></div>
        <div><small>Plus de clients gagnés</small><b>${bCli ? chIcon(bCli.c.k, true) + ' · ' + bCli.x.clients : '—'}</b></div>
      </div>
      <div class="tbl-wrap" style="box-shadow:none"><table class="mini-table"><thead><tr><th>Canal</th><th class="num">Prospects</th><th class="num">Messages</th><th class="num">Ont répondu</th><th class="num">Taux réponse</th><th class="num">Intéressés</th><th class="num">Devis</th><th class="num">Acceptés</th><th class="num">Clients</th><th class="num">Conversion</th><th class="num">Refus</th></tr></thead><tbody>
      ${chRows.map(([c, x]) => `<tr class="${!x.contacted && !x.messages ? 'dim' : ''}"><td>${chIcon(c.k, true)}</td><td class="num">${x.contacted}</td><td class="num">${x.messages}</td><td class="num">${x.replied}</td><td class="num">${pct(x.replied, x.contacted)}</td><td class="num">${x.interested}</td><td class="num">${x.quotes}</td><td class="num">${x.accepted}</td><td class="num"><b>${x.clients}</b></td><td class="num">${pct(x.clients, x.contacted)}</td><td class="num">${x.refused}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="note">Chaque prospect est rattaché au canal de son premier contact. Les messages envoyés sont comptés sur le canal réellement utilisé.</p>
    </section>
    <section class="card" style="grid-column:1/-1"><h2>Par ville <small>pour organiser une journée de prospection</small></h2>
      ${cityRows.length ? `<div class="tbl-wrap" style="box-shadow:none"><table class="mini-table"><thead><tr><th>Ville</th><th class="num">Prospects</th><th class="num">Contactés</th><th class="num">Ont répondu</th><th class="num">Clients</th></tr></thead><tbody>${cityRows.map(([c, x]) => `<tr><td>${esc(c)}</td><td class="num">${x.total}</td><td class="num">${x.contacted}</td><td class="num">${x.replied}</td><td class="num"><b>${x.clients}</b></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Pas encore de données.</p>'}
    </section>
  </div>`;
}

/* ---------- réglages ---------- */
function viewSettings() {
  return `
  <div class="grid g2" style="align-items:start">
    <section class="card"><h2>Statuts <small>modifiables</small></h2>
      <p class="note" style="margin:0 0 12px">« Étape » sert aux statistiques et au Kanban : elle dit où en est le prospect, même si tu renommes le statut.</p>
      ${db.statuses.map((s, i) => `<div class="st-row" data-sid="${s.k}">
        <input type="color" value="${s.c}" data-sf="c" aria-label="Couleur" />
        <input value="${esc(s.n)}" data-sf="n" aria-label="Nom du statut" />
        <select data-sf="s" aria-label="Étape">${opts(Object.entries(STAGES), s.s)}</select>
        <span class="ctl"><button class="btn sm" data-act="stup" data-k="${s.k}" ${i === 0 ? 'disabled' : ''} title="Monter">↑</button><button class="btn sm" data-act="stdown" data-k="${s.k}" ${i === db.statuses.length - 1 ? 'disabled' : ''} title="Descendre">↓</button><button class="btn sm danger" data-act="stdel" data-k="${s.k}" title="Supprimer">✕</button></span>
      </div>`).join('')}
      <div class="set-actions"><button class="btn sm" data-act="stadd">+ Ajouter un statut</button><button class="btn sm ghost" data-act="streset">Remettre les statuts d’origine</button></div>
    </section>
    <div class="grid">
      <section class="card"><h2>Relances</h2>
        <div class="field-inline"><label for="s-delay">Relancer après</label><input id="s-delay" type="number" min="1" max="60" value="${db.settings.delay}" data-setting="delay" /> <span class="muted">jours sans réponse</span></div>
        <p class="note">Ce délai pré-remplit la date de la prochaine relance quand tu enregistres un message. Rien n’est jamais envoyé automatiquement : c’est toi qui envoies, puis tu notes l’action ici.</p>
      </section>
      <section class="card"><h2>Sauvegarde en ligne <small>GitHub privé</small></h2>
        ${sync ? `
        <p class="note" style="margin-top:0">Connecté au dépôt <b>${esc(sync.repo)}</b>. Chaque modification est envoyée automatiquement et retrouvée sur tes autres appareils.</p>
        <p class="note">État : <b>${esc($('#sync-state') ? $('#sync-state').textContent : '')}</b></p>
        <div class="set-actions"><button class="btn primary" data-act="sync-now">Synchroniser maintenant</button><button class="btn danger" data-act="sync-off">Désactiver</button></div>
        <p class="note">Le jeton est gardé uniquement dans ce navigateur (jamais dans les sauvegardes .json).</p>` : `
        <p class="note" style="margin-top:0">Enregistre tes prospects dans un dépôt GitHub <b>privé</b> pour les retrouver sur tous tes appareils.</p>
        <label class="field-inline" style="flex-direction:column;align-items:stretch;gap:4px"><span class="muted" style="font-size:12px;font-weight:600">Dépôt privé</span><input id="sync-repo" value="ndyxxprod/prospection-donnees" autocapitalize="off" autocomplete="off" /></label>
        <label class="field-inline" style="flex-direction:column;align-items:stretch;gap:4px"><span class="muted" style="font-size:12px;font-weight:600">Jeton d’accès</span><input id="sync-token" type="password" placeholder="github_pat_…" autocapitalize="off" autocomplete="off" /></label>
        <div class="set-actions"><button class="btn primary" data-act="sync-connect">Connecter</button></div>
        <details style="margin-top:12px"><summary class="link" style="cursor:pointer">Comment obtenir le dépôt et le jeton ?</summary>
          <ol class="note" style="padding-left:18px;line-height:1.6">
            <li>Sur github.com, clique sur <b>+</b> (en haut à droite) puis <b>New repository</b>.</li>
            <li>Nom : <b>prospection-donnees</b>. Choisis <b>Private</b>. Coche <b>Add a README file</b>. Clique <b>Create repository</b>.</li>
            <li>Clique sur ta photo de profil → <b>Settings</b> → tout en bas <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b>.</li>
            <li>Nom : <b>prospection</b>. Expiration : la plus longue proposée. <b>Only select repositories</b> → choisis <b>prospection-donnees</b>.</li>
            <li><b>Permissions → Repository permissions → Contents → Read and write</b>.</li>
            <li>Clique <b>Generate token</b>, copie le jeton (il n’apparaît qu’une fois) et colle-le ci-dessus.</li>
          </ol></details>`}
      </section>
      <section class="card"><h2>Sauvegarde sur fichier</h2>
        <p class="note" style="margin-top:0">Tes données sont enregistrées <b>dans ce navigateur</b> (ni sur GitHub, ni en ligne). Fais une sauvegarde de temps en temps, et pour passer d’un appareil à l’autre.</p>
        <div class="set-actions">
          <button class="btn primary" data-act="exportjson">Exporter la sauvegarde (.json)</button>
          <button class="btn" data-act="importjson">Importer une sauvegarde</button>
          <button class="btn" data-act="exportcsv-all">Tout exporter en CSV</button>
        </div>
        <p class="note">Dernière sauvegarde : ${db.settings.lastExport ? fmt(db.settings.lastExport) : 'jamais'}</p>
      </section>
      <section class="card"><h2>Zone sensible</h2>
        <div class="set-actions">
          ${db.prospects.some(p => p.demo) ? '<button class="btn" data-act="cleardemo">Supprimer les prospects de démo</button>' : ''}
          <button class="btn danger" data-act="resetall">Tout effacer</button>
        </div>
      </section>
    </div>
  </div>`;
}

/* ---------- fiche prospect ---------- */
function openProspect(id, opt) {
  ui.openId = id; ui.form = null;
  const p = db.prospects.find(x => x.id === id); if (!p) return;
  if (opt && opt.action) openActionForm(p, opt.action); else renderDrawer();
  $('#drawer').hidden = false; document.body.classList.add('noscroll');
  if (opt && opt.focus) setTimeout(() => { const e = $('#drawer [data-f="company"]'); if (e) e.focus(); }, 60);
}
function closeDrawer() {
  const p = db.prospects.find(x => x.id === ui.openId);
  if (p && !p.company.trim() && !p.actions.length) { db.prospects = db.prospects.filter(x => x !== p); save(); }
  ui.openId = null; ui.form = null; $('#drawer').hidden = true; document.body.classList.remove('noscroll');
  renderAll();
}
function newProspect() {
  const p = { id: uid(), company: '', contact: '', email: '', phone: '', social: '', city: '', zip: '', dept: '', region: '', country: 'France', address: '', website: '', maps: '', sector: '', service: '', notes: '', status: 'todo', nextAction: '', followUp: '', lostReason: '', createdAt: today(), actions: [] };
  db.prospects.push(p); save(); ui.detailsOpen = true; openProspect(p.id, { focus: true });
}
function openActionForm(p, type, editId) {
  const d = derive(p);
  let v;
  if (editId) { const a = p.actions.find(x => x.id === editId); v = { ...a, editId }; }
  else v = { date: today(), type: type || (d.contacts.length ? 'followup' : 'first'), channel: d.lastChannel || 'email', message: '', rtype: '', rtext: '', status: '', next: '', nextDate: '', editId: null, fresh: true };
  ui.form = v; renderDrawer();
  syncForm(v.fresh ? 'type' : 'init');
  setTimeout(() => { const b = $('#drawer .action-form'); if (b) b.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 40);
}
function syncForm(trigger) {
  const f = $('#af'); if (!f) return;
  const type = f.type.value, isReply = type === 'reply';
  $('.af-reply', f).hidden = !isReply; $('.af-msg', f).hidden = isReply;
  const lab = { first: 'Message envoyé (texte ou résumé)', followup: 'Message de relance', message: 'Message envoyé', quote: 'Détail du devis (montant, contenu…)', meeting: 'Résumé de l’échange', note: 'Note' }[type] || 'Message';
  $('.af-msg-label', f).textContent = lab;
  if (trigger === 'type' || trigger === 'rtype') {
    let st = '', next = '', days = 0;
    if (isReply) { const r = RULE[f.rtype.value || 'other']; [st, next, days] = r; }
    else if (type === 'quote') { st = 'quote_sent'; next = 'Relancer pour le devis'; days = db.settings.delay + 2; }
    else if (OUT(type)) { st = { first: 'sent', followup: 'followed', message: 'sent' }[type]; next = 'Relance prévue'; days = db.settings.delay; }
    f.status.value = st; f.next.value = next; f.nextdate.value = days ? addDays(f.date.value || today(), days) : '';
  }
}
function readForm() {
  const f = $('#af'); const type = f.type.value, isReply = type === 'reply';
  return { date: f.date.value || today(), type, channel: f.channel.value, message: isReply ? '' : f.message.value.trim(), rtype: isReply ? (f.rtype.value || 'other') : '', rtext: isReply ? f.rtext.value.trim() : '', status: f.status.value, next: f.next.value.trim(), nextDate: f.nextdate.value };
}
function saveAction() {
  const p = db.prospects.find(x => x.id === ui.openId); if (!p) return;
  const data = readForm(); const editId = ui.form && ui.form.editId; let a;
  if (editId) { a = p.actions.find(x => x.id === editId); Object.assign(a, data); }
  else { a = { id: uid(), ts: Date.now(), ...data }; p.actions.push(a); }
  const latest = [...p.actions].filter(x => x.type !== 'status').sort(byDate).pop();
  if (latest && latest.id === a.id) {
    if (data.status) p.status = data.status;
    if (data.type !== 'note' || data.next || data.nextDate) { p.nextAction = data.next; p.followUp = data.nextDate; }
  } else if (data.status && !editId) p.status = data.status;
  save(); ui.form = null; renderDrawer(); renderAll(); toast(editId ? 'Action modifiée' : 'Action enregistrée');
}
function setStatus(p, key, silent) {
  if (!p || p.status === key) return;
  p.status = key;
  p.actions.push({ id: uid(), ts: Date.now(), date: today(), type: 'status', channel: '', message: '', rtype: '', rtext: '', status: key, next: '', nextDate: '' });
  save(); if (!silent) toast('Statut : ' + statusOf(key).n);
}

function renderDrawer() {
  const p = db.prospects.find(x => x.id === ui.openId); const panel = $('#drawer-panel'); if (!p) return;
  const keep = $('.dr-body', panel); const sc = keep ? keep.scrollTop : 0;
  const d = derive(p); const mu = mapsUrl(p); const wu = webUrl(p.website);
  const geo = [p.zip && p.city ? `${p.city} (${p.zip})` : p.city, p.dept, p.region, p.country && p.country !== 'France' ? p.country : ''].filter(Boolean).join(' · ');
  const field = (k, label, extra) => `<label>${label}<input data-f="${k}" value="${esc(p[k])}" ${extra || ''} /></label>`;
  const acts = ui.histDesc ? [...d.acts].reverse() : d.acts;
  const f = ui.form;
  panel.innerHTML = `
  <div class="dr-head">
    <div class="dr-title">
      <input data-f="company" value="${esc(p.company)}" placeholder="Nom de l’entreprise" aria-label="Nom de l’entreprise" />
      <div class="dr-id">
        ${p.contact ? `<span>👤 ${esc(p.contact)}</span>` : ''}${geo ? `<span>📍 ${esc(geo)}</span>` : '<span>📍 ville non renseignée</span>'}
        ${p.sector ? `<span class="tag">${esc(p.sector)}</span>` : ''}${p.service ? `<span class="tag">${esc(p.service)}</span>` : ''}
        ${wu ? `<a href="${esc(wu)}" target="_blank" rel="noopener">Site ↗</a>` : ''}${mu ? `<a href="${esc(mu)}" target="_blank" rel="noopener">Google Maps ↗</a>` : ''}
        ${p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : ''}${p.phone ? `<a href="tel:${esc(p.phone.replace(/\s/g, ''))}">${esc(p.phone)}</a>` : ''}
      </div>
    </div>
    ${statusSelect(p)}
    <button class="x" data-act="close" aria-label="Fermer">✕</button>
  </div>
  <div class="dr-body">
    <div class="tiles">
      <div class="tile"><small>Premier contact</small><b>${d.firstDate ? fmt(d.firstDate, true) : '—'}</b></div>
      <div class="tile"><small>Dernier contact</small><b>${d.lastDate ? fmt(d.lastDate, true) : '—'}</b>${d.lastChannel ? `<div style="margin-top:4px">${chIcon(d.lastChannel, true)}</div>` : ''}</div>
      <div class="tile"><small>Messages envoyés</small><b>${d.sent}</b></div>
      <div class="tile"><small>Relances</small><b>${d.relances}</b></div>
      <div class="tile"><small>Jours sans réponse</small><b>${d.daysNoReply != null ? d.daysNoReply : (d.replied ? 'A répondu' : '—')}</b></div>
      <div class="tile"><small>Réponse</small><b>${d.replied ? 'Oui' : (d.contacted ? 'Non' : '—')}</b></div>
    </div>

    <section class="card">
      <div class="next-top"><h2 style="margin:0">Prochaine action</h2><span id="dr-rel">${relBadge(d, p)}</span></div>
      <div class="next-box">
        <label>Quoi ?<input data-f="nextAction" value="${esc(p.nextAction)}" placeholder="Ex. : relancer, envoyer un devis…" /></label>
        <label>Quand ?<input type="date" data-f="followUp" value="${esc(p.followUp)}" /></label>
      </div>
      ${d.stage === 'lost' ? `<label style="display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--muted);font-weight:600;margin-top:10px">Raison du refus / de la perte<select data-f="lostReason">${opts(RTYPES.filter(r => r.g === 'neg').map(r => [r.k, r.n]), p.lostReason, 'Non précisée')}</select></label>` : ''}
      <div class="next-btns">
        <button class="btn sm primary" data-act="followup" data-id="${p.id}">Enregistrer une relance</button>
        <button class="btn sm" data-act="snooze" data-id="${p.id}" data-days="3">Reporter de 3 jours</button>
        <button class="btn sm" data-act="clearnext" data-id="${p.id}">Effacer la relance</button>
        ${d.suggest ? `<span class="suggest">· Suggestion : le ${fmt(d.suggest)} <button class="link" data-act="applysuggest" data-id="${p.id}">Appliquer</button></span>` : ''}
      </div>
    </section>

    <section>
      <div class="hist-head"><h2>Historique <small class="muted">(${d.acts.filter(a => a.type !== 'status').length})</small></h2>
        <div style="display:flex;gap:6px"><button class="btn sm" data-act="historder">${ui.histDesc ? 'Récent → ancien' : 'Ancien → récent'}</button>${f ? '' : '<button class="btn sm primary" data-act="addaction">+ Ajouter une action</button>'}</div>
      </div>
      ${f ? actionFormHtml(f) : ''}
      ${acts.length ? `<ul class="timeline">${acts.map(timelineItem).join('')}</ul>` : '<p class="empty">Aucune action pour l’instant. Ajoute ton premier contact.</p>'}
    </section>

    <details class="card" ${ui.detailsOpen ? 'open' : ''} id="info-card">
      <summary>Informations du prospect</summary>
      <div class="form">
        ${field('contact', 'Nom du contact')}${field('email', 'E-mail', 'type="email"')}
        ${field('phone', 'Téléphone')}${field('social', 'Instagram / LinkedIn (lien ou @)')}
        ${field('city', 'Ville')}${field('zip', 'Code postal', 'inputmode="numeric"')}
        ${field('dept', 'Département')}${field('region', 'Région')}
        ${field('country', 'Pays')}${field('address', 'Adresse complète')}
        ${field('website', 'Site internet')}${field('maps', 'Lien Google Maps (sinon généré)')}
        <label>Secteur d’activité<input data-f="sector" list="dl-sector" value="${esc(p.sector)}" /></label>
        <label>Type de prestation proposée<input data-f="service" list="dl-service" value="${esc(p.service)}" /></label>
        <label class="full">Notes<textarea data-f="notes" placeholder="Contexte, ce qu’ils aiment, idées…">${esc(p.notes)}</textarea></label>
      </div>
      <datalist id="dl-sector">${uniq([...SECTORS, ...db.prospects.map(x => x.sector)]).map(x => `<option value="${esc(x)}">`).join('')}</datalist>
      <datalist id="dl-service">${uniq([...SERVICES, ...db.prospects.map(x => x.service)]).map(x => `<option value="${esc(x)}">`).join('')}</datalist>
    </details>
    <div class="danger-zone"><button class="btn sm danger" data-act="delprospect" data-id="${p.id}">Supprimer ce prospect</button></div>
  </div>`;
  const nb = $('.dr-body', panel); if (nb) nb.scrollTop = sc;
}
function timelineItem(a) {
  const t = ATYPES[a.type]; const dir = t.dir;
  const isStatus = a.type === 'status';
  const arrow = dir === 'out' ? '↗ envoyé' : dir === 'in' ? '↙ reçu' : '';
  const st = a.status ? statusOf(a.status) : null;
  if (isStatus) return `<li class="tl-item status"><span class="tl-dot"><span class="ch"><i style="background:var(--none)"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></i></span></span><div class="tl-card"><div class="tl-top"><time>${fmt(a.date, true)}</time><span class="muted">Statut → <b style="color:${st.c}">${esc(st.n)}</b></span><span class="grow"></span><span class="tl-btns"><button data-act="delaction" data-id="${a.id}" title="Supprimer">✕</button></span></div></div></li>`;
  return `<li class="tl-item ${dir === 'in' ? 'in' : ''}">
    <span class="tl-dot">${a.channel ? chIcon(a.channel, false, true) : `<span class="ch lg"><i style="background:#64748b"><svg viewBox="0 0 24 24"><path d="M6 5h12v14H6zM9 9h6M9 13h6"/></svg></i></span>`}</span>
    <div class="tl-card">
      <div class="tl-top"><time>${fmt(a.date)}</time><span class="tag">${esc(t.n)}</span>${a.channel ? `<span class="muted" style="font-size:13px">${esc(CH[a.channel].n)}</span>` : ''}${arrow ? `<span class="muted" style="font-size:12px">${arrow}</span>` : ''}<span class="grow"></span>
        <span class="tl-btns"><button data-act="editaction" data-id="${a.id}" title="Modifier">✎</button><button data-act="delaction" data-id="${a.id}" title="Supprimer">✕</button></span></div>
      ${a.message ? `<div class="tl-msg"><span class="lbl">${a.type === 'note' ? 'Note' : 'Message'}</span>${esc(a.message)}</div>` : ''}
      ${a.type === 'reply' ? `<div class="tl-msg"><span class="lbl">Réponse du prospect <span class="tag ${RT[a.rtype] ? RT[a.rtype].g : ''}">${esc(RT[a.rtype] ? RT[a.rtype].n : '')}</span></span>${a.rtext ? `<blockquote>${esc(a.rtext)}</blockquote>` : '<span class="muted">(texte non noté)</span>'}</div>` : ''}
      <div class="tl-top" style="margin-top:8px">${st ? `<span class="muted" style="font-size:13px">Statut :</span><span class="badge" style="--c:${st.c}">${esc(st.n)}</span>` : ''}</div>
      ${a.next || a.nextDate ? `<div class="tl-next">▸ Prochaine action : ${esc(a.next || 'Relancer')}${a.nextDate ? ' — ' + fmt(a.nextDate) : ''}</div>` : ''}
    </div></li>`;
}
function actionFormHtml(v) {
  const types = Object.entries(ATYPES).filter(([k]) => k !== 'status').map(([k, t]) => [k, t.n]);
  return `<form class="action-form" id="af" novalidate onsubmit="return false">
    <h3>${v.editId ? 'Modifier l’action' : 'Nouvelle action'}</h3>
    <div class="form">
      <label>Date<input type="date" name="date" value="${esc(v.date)}" /></label>
      <label>Type d’action<select name="type">${opts(types, v.type)}</select></label>
      <label>Canal<select name="channel">${opts(CHANNELS.map(c => [c.k, c.n]), v.channel, '— aucun —')}</select></label>
      <label>Nouveau statut<select name="status">${opts(db.statuses.map(s => [s.k, s.n]), v.status, '(inchangé)')}</select></label>
      <label class="full af-msg"><span class="af-msg-label">Message</span><textarea name="message" placeholder="Ce que tu as envoyé ou dit…">${esc(v.message)}</textarea></label>
      <div class="af-reply full" hidden><div class="form">
        <label>Type de réponse<select name="rtype">${opts(RTYPES.map(r => [r.k, r.n]), v.rtype || 'interested')}</select></label>
        <span></span>
        <label class="full">Texte exact de la réponse<textarea name="rtext" placeholder="Copie ici la réponse du prospect, mot pour mot…">${esc(v.rtext)}</textarea></label>
      </div></div>
      <label>Prochaine action<input name="next" value="${esc(v.next)}" placeholder="Ex. : envoyer un devis" /></label>
      <label>Date de la prochaine action<input type="date" name="nextdate" value="${esc(v.nextDate)}" /></label>
      <div class="form-actions"><button type="button" class="btn" data-act="cancelaction">Annuler</button><button type="button" class="btn primary" data-act="saveaction">${v.editId ? 'Enregistrer' : 'Ajouter à l’historique'}</button></div>
    </div></form>`;
}
function refreshRelBadge() {
  const p = db.prospects.find(x => x.id === ui.openId); if (!p) return;
  const el = $('#dr-rel'); if (el) el.innerHTML = relBadge(derive(p), p);
}

/* ---------- export / import ---------- */
function download(name, text, type) {
  const blob = new Blob([text], { type }); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function exportJson() {
  db.settings.lastExport = today(); save();
  download(`prospection-sauvegarde-${today()}.json`, JSON.stringify({ app: 'prospection-ndyxx', exportedAt: new Date().toISOString(), data: db }, null, 1), 'application/json');
  toast('Sauvegarde téléchargée'); if (ui.view !== 'settings') renderAll(); else render();
}
function exportCsv(list) {
  const cols = ['Entreprise', 'Contact', 'E-mail', 'Téléphone', 'Ville', 'Code postal', 'Département', 'Région', 'Pays', 'Adresse', 'Site internet', 'Google Maps', 'Secteur', 'Prestation proposée', 'Statut', 'Dernier canal', 'Premier contact', 'Dernier contact', 'Messages envoyés', 'Relances', 'Jours sans réponse', 'Prochaine relance', 'Prochaine action', 'Type de dernière réponse', 'Dernière réponse', 'Notes'];
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const rows = list.map(p => { const d = derive(p); return [p.company, p.contact, p.email, p.phone, p.city, p.zip, p.dept, p.region, p.country, p.address, p.website, mapsUrl(p), p.sector, p.service, statusOf(p.status).n, d.lastChannel ? CH[d.lastChannel].n : '', d.firstDate, d.lastDate, d.sent, d.relances, d.daysNoReply == null ? '' : d.daysNoReply, p.followUp, p.nextAction, d.lastIn ? (RT[d.lastIn.rtype] || {}).n : '', d.lastIn ? d.lastIn.rtext : '', p.notes].map(q).join(';'); });
  download(`prospects-${today()}.csv`, '﻿' + cols.map(q).join(';') + '\r\n' + rows.join('\r\n'), 'text/csv;charset=utf-8');
  toast(plural(list.length, 'prospect exporté', 'prospects exportés'));
}
function importJson(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const j = JSON.parse(r.result); const d = j.data || j;
      if (!d || !Array.isArray(d.prospects)) throw new Error('format');
      if (!confirm(`Remplacer toutes les données actuelles par cette sauvegarde (${d.prospects.length} prospects) ?`)) return;
      d.statuses = d.statuses && d.statuses.length ? d.statuses : DEFAULT_STATUSES.map(s => ({ ...s }));
      d.settings = Object.assign({ delay: 4, lastExport: '' }, d.settings);
      d.prospects.forEach(p => { p.actions = p.actions || []; });
      db = d; save(); render(); renderNav(); toast('Sauvegarde importée');
    } catch (e) { toast('Fichier non reconnu'); }
  };
  r.readAsText(file);
}

/* ---------- rendu global ---------- */
function renderNav() {
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.view === ui.view));
  $('#nb-all').textContent = db.prospects.length;
  const due = db.prospects.filter(p => { const r = derive(p).rel; return r === 'late' || r === 'today'; }).length;
  const el = $('#nb-due'); el.hidden = !due; el.textContent = due;
  $('#view-title').textContent = VIEW_TITLES[ui.view];
}
function render() {
  const v = $('#view');
  v.innerHTML = ui.view === 'dashboard' ? viewDashboard() : ui.view === 'prospects' ? viewProspects() : ui.view === 'stats' ? viewStats() : viewSettings();
  if (ui.view === 'prospects') renderResults();
  renderNav();
}
function renderAll() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function go(view) { ui.view = view; if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view); render(); window.scrollTo(0, 0); }

/* ---------- événements ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const act = t.dataset.act, id = t.dataset.id;
  const P = id ? db.prospects.find(x => x.id === id) : null;
  switch (act) {
    case 'nav': go(t.dataset.view); break;
    case 'new': newProspect(); break;
    case 'open': if (!e.target.closest('select')) openProspect(id); break;
    case 'close': closeDrawer(); break;
    case 'mode': ui.mode = t.dataset.mode; render(); break;
    case 'sort': ui.sort = { k: t.dataset.k, d: ui.sort.k === t.dataset.k ? -ui.sort.d : (t.dataset.k === 'last' ? -1 : 1) }; render(); break;
    case 'quick': { const k = t.dataset.k, v = t.dataset.v; if (k === 'resp' && !v) { ui.filters.resp = ''; ui.filters.rel = ''; } else ui.filters[k] = ui.filters[k] === v ? '' : v; render(); break; }
    case 'citychip': ui.filters.city = ui.filters.city === t.dataset.city ? '' : t.dataset.city; render(); break;
    case 'togglefilters': ui.showFilters = !ui.showFilters; render(); break;
    case 'clearfilters': ui.filters = {}; render(); break;
    case 'exportcsv': exportCsv(sortList(applyFilters(db.prospects))); break;
    case 'exportcsv-all': exportCsv(db.prospects); break;
    case 'exportjson': exportJson(); break;
    case 'importjson': $('#file-import').click(); break;
    case 'cleardemo': if (confirm('Supprimer les prospects de démonstration ?')) { db.prospects = db.prospects.filter(p => !p.demo); save(); render(); toast('Démo supprimée'); } break;
    case 'sync-connect': connectSync(); break;
    case 'sync-now': syncNow(true); break;
    case 'sync-off': if (confirm('Désactiver la sauvegarde en ligne sur cet appareil ? (Tes données en ligne restent dans le dépôt GitHub.)')) { sync = null; saveSyncCfg(); setSyncState('off'); render(); toast('Sauvegarde en ligne désactivée'); } break;
    case 'resetall': if (confirm('Tout effacer (prospects et réglages) ? Cette action est définitive.') && confirm('Vraiment tout effacer ?')) { db = blankDb(); save(); render(); toast('Tout est effacé'); } break;
    case 'followup': openProspect(id, { action: 'followup' }); break;
    case 'firstcontact': openProspect(id, { action: 'first' }); break;
    case 'addaction': openActionForm(P ? P : db.prospects.find(x => x.id === ui.openId)); break;
    case 'editaction': openActionForm(db.prospects.find(x => x.id === ui.openId), null, id); break;
    case 'cancelaction': ui.form = null; renderDrawer(); break;
    case 'saveaction': saveAction(); break;
    case 'delaction': if (confirm('Supprimer cette ligne de l’historique ?')) { const p = db.prospects.find(x => x.id === ui.openId); p.actions = p.actions.filter(a => a.id !== id); save(); renderDrawer(); renderAll(); } break;
    case 'historder': ui.histDesc = !ui.histDesc; renderDrawer(); break;
    case 'snooze': { const base = P.followUp && P.followUp > today() ? P.followUp : today(); P.followUp = addDays(base, +t.dataset.days); if (!P.nextAction) P.nextAction = 'Relancer'; save(); renderAll(); if (ui.openId === id) renderDrawer(); toast('Relance reportée au ' + fmt(P.followUp)); break; }
    case 'clearnext': P.followUp = ''; P.nextAction = ''; save(); renderDrawer(); renderAll(); break;
    case 'applysuggest': { const d = derive(P); P.followUp = d.suggest; if (!P.nextAction) P.nextAction = 'Relance prévue'; save(); renderAll(); if (ui.openId === id) renderDrawer(); toast('Relance planifiée au ' + fmt(P.followUp)); break; }
    case 'delprospect': if (confirm('Supprimer ce prospect et tout son historique ?')) { db.prospects = db.prospects.filter(p => p.id !== id); save(); ui.openId = null; $('#drawer').hidden = true; document.body.classList.remove('noscroll'); renderAll(); toast('Prospect supprimé'); } break;
    case 'stadd': db.statuses.push({ k: 's' + uid(), n: 'Nouveau statut', c: '#64748b', s: 'contacted' }); save(); render(); break;
    case 'stdel': { const k = t.dataset.k; if (db.prospects.some(p => p.status === k)) { toast('Ce statut est utilisé par des prospects'); break; } if (db.statuses.length <= 2) break; db.statuses = db.statuses.filter(s => s.k !== k); save(); render(); break; }
    case 'stup': case 'stdown': { const i = db.statuses.findIndex(s => s.k === t.dataset.k), j = act === 'stup' ? i - 1 : i + 1; if (db.statuses[j]) { [db.statuses[i], db.statuses[j]] = [db.statuses[j], db.statuses[i]]; save(); render(); } break; }
    case 'streset': if (confirm('Remettre la liste de statuts d’origine ? (les statuts ajoutés seront perdus)')) { db.statuses = DEFAULT_STATUSES.map(s => ({ ...s })); db.prospects.forEach(p => { if (!db.statuses.some(s => s.k === p.status)) p.status = 'todo'; }); save(); render(); } break;
  }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.filter === 'q') { ui.filters.q = t.value; renderResults(); }
  if (t.dataset.sf) { const s = db.statuses.find(x => x.k === t.closest('.st-row').dataset.sid); if (s && t.dataset.sf !== 's') { s[t.dataset.sf] = t.value; save(); } }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.filter && t.dataset.filter !== 'q') { ui.filters[t.dataset.filter] = t.value; render(); return; }
  if (t.dataset.status) { const p = db.prospects.find(x => x.id === t.dataset.status); setStatus(p, t.value); renderAll(); if (ui.openId === p.id) renderDrawer(); return; }
  if (t.dataset.sf) { const s = db.statuses.find(x => x.k === t.closest('.st-row').dataset.sid); if (s) { s[t.dataset.sf] = t.value; save(); } return; }
  if (t.dataset.setting) { db.settings[t.dataset.setting] = Math.max(1, +t.value || 4); save(); return; }
  if (t.id === 'file-import') { if (t.files[0]) importJson(t.files[0]); t.value = ''; return; }
  if (t.dataset.f) {
    const p = db.prospects.find(x => x.id === ui.openId); if (!p) return;
    p[t.dataset.f] = t.value.trim ? t.value.trim() : t.value;
    if (t.dataset.f === 'zip') {
      const g = geoFromZip(p.zip);
      if (g) {
        if (!p.dept) { p.dept = g.dept; const i = $('[data-f="dept"]'); if (i) i.value = g.dept; }
        if (!p.region) { p.region = g.region; const i = $('[data-f="region"]'); if (i) i.value = g.region; }
        if (!p.country) { p.country = 'France'; const i = $('[data-f="country"]'); if (i) i.value = 'France'; }
      }
    }
    save();
    if (t.dataset.f === 'followUp' || t.dataset.f === 'lostReason') refreshRelBadge();
    renderBehind();
    return;
  }
  if (t.closest && t.closest('#af')) {
    if (t.name === 'type') syncForm('type');
    else if (t.name === 'rtype') syncForm('rtype');
  }
});
/* met à jour la liste derrière le tiroir sans toucher à la fiche */
function renderBehind() { const y = window.scrollY; render(); window.scrollTo(0, y); }

/* glisser-déposer (Kanban) */
let dragId = null;
document.addEventListener('dragstart', e => { const c = e.target.closest && e.target.closest('.kcard'); if (!c) return; dragId = c.dataset.id; c.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (x) { } });
document.addEventListener('dragend', e => { const c = e.target.closest && e.target.closest('.kcard'); if (c) c.classList.remove('drag'); $$('.col.over').forEach(x => x.classList.remove('over')); });
document.addEventListener('dragover', e => { const c = e.target.closest && e.target.closest('.col'); if (!c || !dragId) return; e.preventDefault(); $$('.col.over').forEach(x => x !== c && x.classList.remove('over')); c.classList.add('over'); });
document.addEventListener('drop', e => {
  const c = e.target.closest && e.target.closest('.col'); if (!c || !dragId) return; e.preventDefault();
  const p = db.prospects.find(x => x.id === dragId); dragId = null; if (!p) return;
  setStatus(p, c.dataset.col); renderAll();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });
window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (VIEW_TITLES[v] && v !== ui.view) { ui.view = v; render(); } });

/* ---------- synchronisation GitHub ---------- */
const b64 = t => btoa(unescape(encodeURIComponent(t)));
const unb64 = b => decodeURIComponent(escape(atob(b.replace(/\s/g, ''))));
function ghFetch(path, opt) {
  opt = opt || {};
  return fetch('https://api.github.com/repos/' + sync.repo + path, Object.assign({}, opt, {
    cache: 'no-store',
    headers: Object.assign({ Authorization: 'Bearer ' + sync.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opt.headers || {})
  }));
}
function syncError(e) {
  if (e && e.status === 401) return 'Jeton refusé ou expiré';
  if (e && (e.status === 403 || e.status === 404)) return 'Accès refusé ou dépôt introuvable';
  if (e && e.status) return 'Erreur GitHub (' + e.status + ')';
  return 'Pas de connexion';
}
const httpErr = r => { const e = new Error('http'); e.status = r.status; return e; };
function setSyncState(state, msg) {
  syncMsg = msg || '';
  const el = $('#sync-state'); if (!el) return;
  const hm = sync && sync.last ? new Date(sync.last).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
  el.className = 'sync ' + (sync ? state : 'off');
  el.textContent = !sync ? '☁ Sauvegarde en ligne : non activée'
    : state === 'busy' ? '⟳ Synchronisation…'
    : state === 'dirty' ? '● Modifications en cours d’envoi…'
    : state === 'err' ? '⚠ ' + msg
    : state === 'conflict' ? '⚠ Conflit : ouvre Réglages'
    : '☁ Sauvegardé en ligne' + (hm ? ' · ' + hm : '');
}
async function remoteGet() {
  const r = await ghFetch('/contents/' + SYNC_FILE);
  if (r.status === 404) return null;
  if (!r.ok) throw httpErr(r);
  const j = await r.json();
  let text;
  if (j.content) text = unb64(j.content);
  else { const r2 = await ghFetch('/contents/' + SYNC_FILE, { headers: { Accept: 'application/vnd.github.raw' } }); if (!r2.ok) throw httpErr(r2); text = await r2.text(); }
  const parsed = JSON.parse(text);
  return { sha: j.sha, data: parsed.data || parsed };
}
async function remotePut() {
  const ver = localVer;
  const body = { message: 'Sauvegarde ' + new Date().toISOString().slice(0, 16).replace('T', ' '), content: b64(JSON.stringify({ app: 'prospection-ndyxx', savedAt: new Date().toISOString(), data: db })) };
  if (sync.sha) body.sha = sync.sha;
  const r = await ghFetch('/contents/' + SYNC_FILE, { method: 'PUT', body: JSON.stringify(body) });
  if (!r.ok) throw httpErr(r);
  const j = await r.json();
  sync.sha = j.content.sha; sync.last = Date.now(); sync.dirty = (ver !== localVer); saveSyncCfg();
}
function normalizeDb(d) {
  d.statuses = d.statuses && d.statuses.length ? d.statuses : DEFAULT_STATUSES.map(x => ({ ...x }));
  d.settings = Object.assign({ delay: 4, lastExport: '' }, d.settings);
  d.prospects.forEach(p => { p.actions = p.actions || []; });
  return d;
}
function adoptRemote(rem) {
  applyingRemote = true; db = normalizeDb(rem.data); save(); applyingRemote = false;
  sync.sha = rem.sha; sync.dirty = false; sync.last = Date.now(); saveSyncCfg();
  if (ui.openId && !db.prospects.some(p => p.id === ui.openId)) { ui.openId = null; ui.form = null; $('#drawer').hidden = true; document.body.classList.remove('noscroll'); }
  render(); if (ui.openId) renderDrawer();
}
function scheduleSync() { clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(), 2500); }
async function syncNow(manual) {
  if (!sync) return;
  if (syncBusy) { scheduleSync(); return; }
  syncBusy = true; setSyncState('busy');
  try {
    const rem = await remoteGet();
    if (!rem) { sync.sha = ''; await remotePut(); }
    else if (rem.sha === sync.sha) { if (sync.dirty) await remotePut(); }
    else if (!sync.dirty && sync.sha) {
      if (ui.openId && !manual) { setSyncState('ok'); syncBusy = false; return; }
      adoptRemote(rem); toast('Données mises à jour depuis GitHub');
    } else {
      /* données différentes en ligne ET sur cet appareil */
      const n = (rem.data.prospects || []).length;
      if (confirm(`Des données existent déjà en ligne (${n} prospect${n > 1 ? 's' : ''}).\n\nOK = utiliser les données EN LIGNE (celles de cet appareil seront remplacées).\nAnnuler = garder celles de CET APPAREIL.`)) adoptRemote(rem);
      else if (confirm('Écraser les données en ligne par celles de cet appareil ?')) { sync.sha = rem.sha; await remotePut(); }
      else { setSyncState('conflict'); syncBusy = false; return; }
    }
    if (sync.dirty) scheduleSync();
    setSyncState('ok');
  } catch (e) {
    if (e && (e.status === 409 || e.status === 422)) { sync.sha = ''; saveSyncCfg(); setSyncState('err', 'Conflit, nouvelle tentative…'); setTimeout(() => syncNow(), 1500); }
    else setSyncState('err', syncError(e));
  } finally {
    syncBusy = false;
    if (ui.view === 'settings' && !(document.activeElement && document.activeElement.matches && document.activeElement.matches('input'))) render();
  }
}
async function connectSync() {
  const repoIn = $('#sync-repo').value.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/$/, '');
  const token = $('#sync-token').value.trim();
  if (!/^[\w.-]+\/[\w.-]+$/.test(repoIn)) { toast('Dépôt : écris-le sous la forme ton-nom/nom-du-depot'); return; }
  if (!token) { toast('Colle ton jeton d’accès'); return; }
  const prev = sync; sync = { repo: repoIn, token, sha: '', dirty: true, last: 0 };
  setSyncState('busy');
  try {
    const r = await ghFetch('');
    if (!r.ok) throw httpErr(r);
    const j = await r.json();
    if (j.private === false) { sync = prev; setSyncState('ok'); toast('Ce dépôt est PUBLIC : crée un dépôt privé'); render(); return; }
    if (j.permissions && j.permissions.push === false) { sync = prev; setSyncState('ok'); toast('Le jeton n’a pas le droit d’écrire (Contents : Read and write)'); render(); return; }
  } catch (e) { sync = prev; setSyncState(prev ? 'ok' : 'off'); toast(syncError(e)); render(); return; }
  saveSyncCfg(); render(); await syncNow(true);
  if (sync && sync.last) toast('Sauvegarde en ligne activée');
}

/* ---------- démarrage ---------- */
db = load();
try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { memoryOnly = true; }
const h = location.hash.slice(1); if (VIEW_TITLES[h]) ui.view = h;
render();
setSyncState(sync && sync.dirty ? 'dirty' : 'ok');
if (sync) syncNow();
document.addEventListener('visibilitychange', () => { if (!document.hidden && sync) syncNow(); });
window.__crm = { get db() { return db; }, derive, computeStats };
})();
