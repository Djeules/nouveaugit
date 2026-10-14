// Fonction Cloudflare Pages — exporte en CSV la liste des personnes qui ont demandé une ressource offerte.
// Elle répond à GET /api/inscrits?cle=VOTRE_CLE et s'ouvre directement dans Excel ou Numbers.
//
// Réglages à faire une fois dans Cloudflare (projet avecjulien → Settings) :
//   INSCRITS     liaison KV (la même que pour functions/api/ressource.js)
//   EXPORT_CLE   secret : une longue phrase que vous seul connaissez. Sans elle, l'export est fermé.

const texte = (status, message) =>
  new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

// Comparaison à durée constante, pour ne rien laisser deviner de la clé.
const egal = (a, b) => {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
};

// Une cellule qui commence par = + - @ serait lue comme une formule par un tableur : on la neutralise.
const cellule = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};

export async function onRequestGet({ request, env }) {
  // Trois messages distincts, pour savoir quoi corriger sans rien révéler de la clé elle-même.
  const attendue = (env.EXPORT_CLE || '').trim();
  if (!attendue) {
    return texte(503, 'Export fermé : le secret EXPORT_CLE n’est pas présent dans ce déploiement (vérifier qu’il est enregistré, puis relancer le déploiement).');
  }
  const fournie = (new URL(request.url).searchParams.get('cle') || '').trim();
  if (!fournie) return texte(403, 'Clé manquante : ajouter ?cle=votre-phrase à la fin de l’adresse.');
  if (!egal(fournie, attendue)) return texte(403, 'Clé incorrecte.');
  if (!env.INSCRITS) return texte(500, 'La liaison KV INSCRITS n’est pas configurée.');

  const lignes = [['email', 'prenom', 'accord_lettre', 'accord_lettre_depuis', 'ressources', 'premiere_demande', 'derniere_demande']];
  let curseur;
  do {
    const lot = await env.INSCRITS.list({ cursor: curseur, limit: 1000 });
    for (const { name, metadata: m } of lot.keys) {
      const i = m || { email: name };
      lignes.push([i.email || name, i.prenom, i.lettre ? 'oui' : 'non', i.lettreDepuis, (i.ressources || []).join(' '), i.premiere, i.derniere]);
    }
    curseur = lot.list_complete ? undefined : lot.cursor;
  } while (curseur);

  // Point-virgule et BOM : c'est ce qu'attend Excel en français pour ouvrir le fichier sans assistant.
  const csv = '﻿' + lignes.map((l) => l.map(cellule).join(';')).join('\r\n') + '\r\n';
  const jour = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inscrits-avecjulien-${jour}.csv"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
