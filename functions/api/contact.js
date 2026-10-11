// Fonction Cloudflare Pages — reçoit le formulaire de contact et l'envoie par e-mail via Resend.
// Elle remplace Netlify Forms. Elle répond à POST /api/contact, puis renvoie le visiteur vers /merci.html.
//
// Réglages à faire une fois dans Cloudflare (Settings > Variables and secrets) :
//   RESEND_API_KEY  (secret, obligatoire)  clé d'API Resend
//   CONTACT_TO      (facultatif)           destinataire, par défaut julien@avecjulien.fr
//   CONTACT_FROM    (facultatif)           expéditeur, par défaut « Site avecjulien.fr <contact@avecjulien.fr> »
//                                          (le domaine doit être vérifié dans Resend)

const SUJETS = {
  vendre: 'Vendre mieux',
  choisi: 'Être choisi',
  site: 'Un site en deux jours',
  equipes: 'Former mes équipes',
  autre: 'Autre chose',
};

const MAIL_SECOURS = 'julien@avecjulien.fr';

const page = (status, titre, texte) =>
  new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${titre}</title></head>` +
      `<body><h1>${titre}</h1><p>${texte}</p><p><a href="/#contact">← Retour au site</a></p></body></html>`,
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
  const merci = Response.redirect(new URL('/merci.html', url), 303);

  // Un navigateur envoie toujours Origin sur un POST : s'il vient d'ailleurs, on refuse.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== url.host) {
    return page(403, 'Envoi refusé', 'Ce formulaire ne peut être envoyé que depuis avecjulien.fr.');
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return page(400, 'Envoi impossible', 'Le formulaire n’a pas pu être lu. Merci de réessayer.');
  }

  // Champ piège (invisible pour les humains) : un robot le remplit. On fait semblant que tout va bien.
  if (champ(form, 'piege', 200)) return merci;

  const nom = champ(form, 'nom', 120);
  const email = champ(form, 'email', 254);
  const entreprise = champ(form, 'entreprise', 120);
  const sujet = SUJETS[champ(form, 'sujet', 20)] || SUJETS.autre;
  const message = champ(form, 'message', 5000);

  if (!nom || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return page(400, 'Formulaire incomplet', 'Merci d’indiquer votre nom, une adresse e-mail valide et votre message.');
  }

  if (!env.RESEND_API_KEY) {
    console.error('contact: RESEND_API_KEY manquante');
    return page(500, 'Envoi indisponible', `Le formulaire est momentanément indisponible. Écrivez-moi directement à ${MAIL_SECOURS}.`);
  }

  const sansRetour = (s) => s.replace(/[\r\n]+/g, ' ');
  const texte = [
    `Nom : ${nom}`,
    `E-mail : ${email}`,
    `Entreprise : ${entreprise || '—'}`,
    `Ce qui l'amène : ${sujet}`,
    '',
    message,
  ].join('\n');

  let reponse;
  try {
    reponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM || 'Site avecjulien.fr <contact@avecjulien.fr>',
        to: [env.CONTACT_TO || MAIL_SECOURS],
        reply_to: email,
        subject: sansRetour(`Contact avecjulien.fr — ${nom} (${sujet})`),
        text: texte,
      }),
    });
  } catch (e) {
    console.error('contact: Resend injoignable', e && e.message);
    return page(502, 'Envoi impossible', `Votre message n’a pas pu partir. Écrivez-moi directement à ${MAIL_SECOURS}.`);
  }

  if (!reponse.ok) {
    console.error('contact: Resend a refusé', reponse.status, (await reponse.text()).slice(0, 300));
    return page(502, 'Envoi impossible', `Votre message n’a pas pu partir. Écrivez-moi directement à ${MAIL_SECOURS}.`);
  }

  return merci;
}
