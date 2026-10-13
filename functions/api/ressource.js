// Fonction Cloudflare Pages — reçoit le formulaire d'une ressource offerte (methode-5-minutes.html),
// enregistre l'adresse dans Cloudflare KV, puis renvoie le visiteur vers la page qui donne la ressource.
// Elle répond à POST /api/ressource.
//
// Réglage à faire une fois dans Cloudflare (projet avecjulien → Settings → Bindings) :
//   INSCRITS   liaison « KV namespace » vers un espace de noms KV (par exemple « avecjulien-inscrits »).
// Sans cette liaison, le visiteur reçoit quand même la ressource, mais son adresse n'est pas gardée
// (une erreur est écrite dans les journaux de la fonction).
//
// La liste se télécharge en CSV par /api/inscrits (voir functions/api/inscrits.js).

// Seules les ressources listées ici sont acceptées : le formulaire ne peut pas inventer une destination.
const RESSOURCES = {
  'methode-5-minutes': { merci: '/methode-5-minutes-merci.html', formulaire: '/methode-5-minutes.html' },
};

const page = (status, titre, texte, retour) =>
  new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${titre}</title></head>` +
      `<body><h1>${titre}</h1><p>${texte}</p><p><a href="${retour}">← Revenir au formulaire</a></p></body></html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'",
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );

const champ = (form, nom, max) => {
  const v = form.get(nom);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
};

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const retourDefaut = RESSOURCES['methode-5-minutes'].formulaire;

  // Un navigateur envoie toujours Origin sur un POST : s'il vient d'ailleurs, on refuse.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== url.host) {
    return page(403, 'Envoi refusé', 'Ce formulaire ne peut être envoyé que depuis avecjulien.fr.', retourDefaut);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return page(400, 'Envoi impossible', 'Le formulaire n’a pas pu être lu. Merci de réessayer.', retourDefaut);
  }

  const cle = champ(form, 'ressource', 60);
  const ressource = RESSOURCES[cle];
  if (!ressource) {
    return page(400, 'Ressource inconnue', 'Cette ressource n’existe pas, ou plus.', '/');
  }
  const merci = Response.redirect(new URL(ressource.merci, url), 303);

  // Champ piège (invisible pour les humains) : un robot le remplit. On fait semblant que tout va bien.
  if (champ(form, 'piege', 200)) return merci;

  const email = champ(form, 'email', 254).toLowerCase();
  const prenom = champ(form, 'prenom', 60).replace(/[\r\n\t;,"]+/g, ' ');
  const lettre = champ(form, 'lettre', 5) === 'oui';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return page(400, 'Adresse incomplète', 'Merci d’indiquer une adresse e-mail valide.', ressource.formulaire);
  }

  if (!env.INSCRITS) {
    console.error('ressource: liaison KV INSCRITS manquante — adresse non enregistrée');
    return merci;
  }

  const maintenant = new Date().toISOString();
  try {
    const avant = (await env.INSCRITS.getWithMetadata(email)).metadata || null;
    const inscrit = {
      email,
      prenom: prenom || (avant && avant.prenom) || '',
      // L'accord pour la lettre ne se retire pas en décochant une case lors d'une nouvelle demande :
      // il se retire par le lien de désinscription. On garde donc la date du premier accord.
      lettre: Boolean(lettre || (avant && avant.lettre)),
      lettreDepuis: (avant && avant.lettreDepuis) || (lettre ? maintenant : ''),
      ressources: [...new Set([...((avant && avant.ressources) || []), cle])],
      premiere: (avant && avant.premiere) || maintenant,
      derniere: maintenant,
    };
    // Tout tient dans les métadonnées (moins de 1 Ko) : l'export lit la liste sans relire chaque entrée.
    await env.INSCRITS.put(email, '', { metadata: inscrit });
  } catch (e) {
    console.error('ressource: écriture KV impossible', e && e.message);
  }

  return merci;
}
