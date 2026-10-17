// Fabrique le PDF « 100 prompts pour vendre » à partir de 100-prompts-pour-vendre.md.
//
//   NODE_PATH="$(npm root -g)" node tools/ressources/build-prompts.cjs
//
// Produit, à côté de ce fichier, 100-prompts-pour-vendre.html (pour relire dans un navigateur)
// et 100-prompts-pour-vendre.pdf (le document offert). Même charte que la méthode des
// 5 minutes : 16:9, Poppins, fond #f6f5f1, jaune #e8b723.
//
// Le script refuse de produire le PDF si une partie n'a pas exactement dix prompts, ou si
// un texte déborde de sa case : on raccourcit le texte, on ne réduit pas la police.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ICI = __dirname;
const SOURCE = path.join(ICI, '100-prompts-pour-vendre.md');
const SORTIE_HTML = path.join(ICI, '100-prompts-pour-vendre.html');
const SORTIE_PDF = path.join(ICI, '100-prompts-pour-vendre.pdf');

const TITRE = '100 prompts pour vendre';
const CAL = 'cal.com/marquer-julien-4swnpa/diagnostic';

// --- Lecture de la source ---------------------------------------------------------------

function lire() {
  const parties = [];
  let partie = null;
  let prompt = null;
  for (const brute of fs.readFileSync(SOURCE, 'utf8').split('\n')) {
    const ligne = brute.trimEnd();
    if (ligne.startsWith('# ') || ligne === '#') continue;
    if (ligne.startsWith('= ')) {
      partie = { titre: ligne.slice(2).trim(), intro: '', note: '', prompts: [] };
      parties.push(partie);
      prompt = null;
    } else if (ligne.startsWith('intro: ')) partie.intro = ligne.slice(7).trim();
    else if (ligne.startsWith('note: ')) partie.note = ligne.slice(6).trim();
    else if (ligne.startsWith('## ')) {
      prompt = { titre: ligne.slice(3).trim(), texte: '' };
      partie.prompts.push(prompt);
    } else if (ligne.trim() && prompt) prompt.texte += (prompt.texte ? ' ' : '') + ligne.trim();
  }
  const erreurs = parties
    .filter((p) => p.prompts.length !== 10 || !p.intro || !p.note)
    .map((p) => `« ${p.titre} » : ${p.prompts.length} prompts, intro ${p.intro ? 'ok' : 'absente'}, note ${p.note ? 'ok' : 'absente'}`);
  if (parties.length !== 10) erreurs.unshift(`${parties.length} parties au lieu de 10`);
  if (erreurs.length) throw new Error('Source incomplète :\n' + erreurs.join('\n'));
  return parties;
}

// --- Typographie --------------------------------------------------------------------------

const echapper = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Espaces insécables avant ; : ! ? » et après «, crochets mis en évidence.
const typo = (s) =>
  echapper(s)
    .replace(/'/g, '’')
    .replace(/ ([;:!?»])/g, ' $1')
    .replace(/« /g, '« ')
    .replace(/\[([^\]]+)\]/g, '<span class="crochet">[$1]</span>');

const num = (n) => String(n).padStart(2, '0');

// --- Pages --------------------------------------------------------------------------------

const entete = (page) =>
  `<header class="entete"><span>${TITRE}</span><span>${num(page)}</span></header>`;

function couverture() {
  return `<section class="page couverture">
  <div class="meta-haut">
    <div><b>Auteur</b>Julien Marquer</div>
    <div><b>En ligne</b>avecjulien.fr</div>
    <div><b>Instagram</b>@avecjulien.fr</div>
    <span class="pastille"></span>
  </div>
  <div class="bloc-jaune">
    <h1>100 prompts<br>pour vendre</h1>
    <hr>
    <p class="sous-titre">Du premier appel à la signature.</p>
    <p class="themes">Ciblage · Téléphone · Cold call · Pitch · Rendez-vous · Présentation · Offre · Négociation · Closing · Pipeline</p>
    <div class="meta-bas">
      <div><b>Offert à</b>Ceux qui vendent, et ceux qui doivent s'y mettre</div>
      <div><b>Édition</b>Octobre 2026</div>
      <div><b>Note de confidentialité</b>Ce document n'a rien de confidentiel. Faites-le circuler.</div>
    </div>
  </div>
</section>`;
}

function sommaire(parties, pages) {
  // Les badges reprennent le numéro de chaque partie ; les pages hors parties ont un repère neutre.
  const lignes = [
    ['·', 'Mode d’emploi', pages.mode],
    ['00', 'Avant tout : le prompt de contexte', pages.contexte],
    ...parties.map((p, i) => [num(i + 1), `${p.titre} <i>prompts ${num(i * 10 + 1)} à ${num(i * 10 + 10)}</i>`, pages.parties[i]]),
    ['→', 'Par où commencer', pages.commencer],
  ];
  return `<section class="page">${entete(2)}
  <div class="deux-colonnes">
    <div class="colonne-titre">
      <h2>Sommaire.</h2>
      <p class="chapeau">Cent prompts, dix étapes de la vente. Gardez-le ouvert pendant vos appels.</p>
    </div>
    <ol class="sommaire">${lignes
      .map(([b, t, p]) => `<li><span class="badge">${b}</span><span class="intitule">${typo(t).replace(/&lt;(\/?)i&gt;/g, '<$1i>')}</span><span class="no">${num(p)}</span></li>`)
      .join('')}</ol>
  </div>
</section>`;
}

const REGLES = [
  ['Remplissez les crochets.', 'Tout ce qui est entre [crochets] décrit votre situation. Plus c’est précis, plus la réponse l’est.'],
  ['Donnez votre matière.', 'Vos notes, vos chiffres, vos vrais e-mails. L’IA ne connaît pas votre client. Vous, si.'],
  ['Commencez par le prompt 00.', 'Il installe votre contexte une fois pour toutes. Les cent autres s’appuient dessus.'],
  ['Relisez tout.', 'Une IA peut inventer un chiffre ou une actualité avec aplomb. Rien ne part chez un client sans votre relecture.'],
  ['Protégez vos clients.', 'Pas de données personnelles ni d’informations confidentielles dans un outil dont vous ignorez les règles. Anonymisez.'],
];

function modeEmploi(page) {
  return `<section class="page">${entete(page)}
  <h2>Mode d’emploi.</h2>
  <p class="chapeau">Un prompt, c’est une consigne. Une bonne consigne donne une bonne réponse.</p>
  <div class="regles">${REGLES.map(
    ([t, x], i) => `<div class="regle"><span class="badge">${num(i + 1)}</span><h3>${typo(t)}</h3><p>${typo(x)}</p></div>`
  ).join('')}</div>
  <p class="filet">Fonctionne avec Claude, ChatGPT, Gemini ou Le Chat. Pensé pour la vente entre entreprises : auprès des particuliers, le démarchage téléphonique est très encadré, vérifiez les règles avant d’appeler.</p>
</section>`;
}

const CONTEXTE = [
  'Tu es mon directeur commercial. Vingt ans de terrain en vente B2B, exigeant et direct. Voici mon contexte : garde-le en tête pour toute la conversation.',
  '— Mon offre : [ce que je vends, format, prix]',
  '— Mes clients : [secteur, taille, poste du décideur]',
  '— Ce qui me distingue : [deux ou trois éléments vérifiables]',
  '— Mes preuves : [références, résultats réels]',
  '— Mon objectif du moment : [chiffre, échéance]',
  'Tes règles : tu n’inventes jamais un chiffre, un client ou une citation. Si une information te manque, tu me poses la question. Si mon idée est mauvaise, tu me le dis.',
];

function promptContexte(page) {
  return `<section class="page">${entete(page)}
  <div class="deux-colonnes">
    <div class="colonne-titre">
      <p class="surtitre">Prompt 00</p>
      <h2>Avant tout : le contexte.</h2>
      <p class="chapeau">Collez-le en début de conversation. Remplissez-le une fois, gardez-le dans vos notes, réutilisez-le à chaque séance.</p>
    </div>
    <div class="carte grande">${CONTEXTE.map((l) => `<p>${typo(l)}</p>`).join('')}</div>
  </div>
</section>`;
}

function pagePrompts(partie, iPartie, moitie, page) {
  const debut = moitie * 5;
  const premiere =
    moitie === 0
      ? `<div class="case ouverture"><span class="grand-num">${num(iPartie + 1)}</span><h2>${typo(partie.titre)}.</h2><p>${typo(partie.intro)}</p></div>`
      : `<div class="case note"><p class="surtitre">Note de terrain</p><p class="note-texte">${typo(partie.note)}</p><p class="suite">${typo(partie.titre)} · suite</p></div>`;
  const cases = partie.prompts
    .slice(debut, debut + 5)
    .map((p, j) => {
      const n = iPartie * 10 + debut + j + 1;
      return `<div class="case prompt"><div class="tete"><span class="badge">${num(n)}</span><h3>${typo(p.titre)}</h3></div><p>${typo(p.texte)}</p></div>`;
    })
    .join('');
  return `<section class="page">${entete(page)}<div class="grille">${premiere}${cases}</div></section>`;
}

function commencer(page) {
  return `<section class="page jaune">${entete(page)}
  <div class="centre">
    <p class="surtitre">Par où commencer</p>
    <h2 class="titre-xl">Par l’étape où vous perdez le plus d’affaires.</h2>
    <hr>
    <p>Vous ne savez pas laquelle ? Le prompt 94 vous le dira, chiffres à l’appui.</p>
    <p>Un prompt aujourd’hui, avant votre prochain appel. Le suivant viendra tout seul.</p>
  </div>
</section>`;
}

function merci() {
  return `<section class="page couverture fin">
  <div class="bloc-jaune">
    <h1 class="merci">Merci.</h1>
    <hr>
    <p class="sous-titre">Maintenant, décrochez.</p>
    <div class="meta-bas">
      <div><b>Un diagnostic ?</b><u>${CAL}</u></div>
      <div><b>Le site</b><u>avecjulien.fr</u></div>
      <div><b>Instagram</b>@avecjulien.fr</div>
    </div>
  </div>
  <p class="pied">${TITRE} · Julien Marquer · 2026</p>
</section>`;
}

// --- Assemblage ---------------------------------------------------------------------------

const CSS = `
@font-face { font-family: Poppins; font-weight: 300; src: url(fonts/Poppins-Light.ttf); }
@font-face { font-family: Poppins; font-weight: 400; src: url(fonts/Poppins-Regular.ttf); }
@font-face { font-family: Poppins; font-weight: 500; src: url(fonts/Poppins-Medium.ttf); }
@font-face { font-family: Poppins; font-weight: 600; src: url(fonts/Poppins-SemiBold.ttf); }
@page { size: 1280px 720px; margin: 0; }
:root { --fond: #f6f5f1; --carte: #ecebe5; --jaune: #e8b723; --encre: #22201c; --gris: #6b675f; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Poppins, sans-serif; font-weight: 300; color: var(--encre); background: #ccc; }
.page { width: 1280px; height: 720px; background: var(--fond); padding: 36px 56px 40px; position: relative; overflow: hidden; break-after: page; display: flex; flex-direction: column; }
@media screen { .page { margin: 0 auto 24px; } }
b, h3 { font-weight: 600; }
h2 { font-weight: 300; font-size: 34px; letter-spacing: -0.01em; line-height: 1.15; }
.entete { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gris); padding-bottom: 10px; border-bottom: 1.5px solid var(--jaune); margin-bottom: 26px; flex: none; }
.badge { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 18px; padding: 0 4px; background: var(--jaune); color: var(--encre); font-weight: 600; font-size: 9.5px; border-radius: 2px; flex: none; }
.crochet { font-weight: 500; }
.surtitre { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gris); margin-bottom: 10px; }
.chapeau { font-size: 13px; color: var(--gris); margin-top: 8px; line-height: 1.55; max-width: 380px; }
hr { width: 56px; border: 0; border-top: 2px solid var(--encre); margin: 22px 0; }

/* couverture et fin */
.couverture { padding: 36px 56px 48px; }
.meta-haut { display: flex; gap: 48px; font-size: 11px; margin-bottom: 22px; align-items: flex-start; }
.meta-haut b, .meta-bas b { display: block; font-size: 11px; margin-bottom: 2px; }
.pastille { margin-left: auto; width: 22px; height: 22px; border-radius: 50%; background: var(--jaune); }
.bloc-jaune { flex: 1; background: var(--jaune); padding: 56px 64px 48px; display: flex; flex-direction: column; }
.bloc-jaune h1 { font-weight: 400; font-size: 64px; line-height: 1.02; text-transform: uppercase; letter-spacing: -0.01em; }
.bloc-jaune h1.merci { text-transform: none; font-size: 80px; font-weight: 300; }
.bloc-jaune hr { margin: 26px 0 20px; }
.sous-titre { font-size: 18px; font-weight: 400; }
.themes { font-size: 11.5px; margin-top: 10px; opacity: 0.8; }
.meta-bas { margin-top: auto; display: flex; gap: 56px; font-size: 11px; }
.fin .bloc-jaune { margin-top: 4px; }
.pied { font-size: 10px; color: var(--gris); margin-top: 14px; }

/* sommaire, contexte */
.deux-colonnes { display: grid; grid-template-columns: 400px 1fr; gap: 56px; flex: 1; }
.sommaire { list-style: none; font-size: 13.5px; }
.sommaire li { display: flex; align-items: center; gap: 16px; padding: 7.5px 0; border-bottom: 1px solid #dedbd2; }
.sommaire .intitule { flex: 1; font-weight: 400; }
.sommaire i { font-style: normal; color: var(--gris); font-weight: 300; font-size: 11.5px; margin-left: 8px; }
.sommaire .no { font-size: 11px; color: var(--gris); }
.carte { background: var(--carte); border-radius: 6px; }
.carte.grande { padding: 30px 34px; align-self: start; font-size: 15px; line-height: 1.6; font-weight: 400; }
.carte.grande p + p { margin-top: 6px; }
.carte.grande p:first-child, .carte.grande p:last-child { margin: 0 0 12px; }
.carte.grande p:last-child { margin: 14px 0 0; }

/* mode d'emploi */
.regles { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-top: 48px; }
.regle { min-height: 210px; }
.regle { background: var(--carte); border-radius: 6px; padding: 20px 18px 22px; }
.regle h3 { font-size: 15px; margin: 14px 0 8px; line-height: 1.3; }
.regle p { font-size: 13px; line-height: 1.55; }
.filet { margin-top: auto; border-left: 3px solid var(--jaune); padding-left: 14px; font-size: 11.5px; color: var(--gris); line-height: 1.5; max-width: 900px; }

/* pages de prompts */
.grille { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: 1fr 1fr; gap: 14px; min-height: 0; }
.case { border-radius: 6px; padding: 18px 20px; overflow: hidden; min-height: 0; }
.case.prompt { background: var(--carte); }
.case .tete { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px; }
.case .tete h3 { font-size: 14px; line-height: 1.3; padding-top: 1px; }
.case.prompt p { font-size: 12.8px; line-height: 1.58; font-weight: 400; }
.case.ouverture { background: var(--jaune); display: flex; flex-direction: column; }
.grand-num { font-size: 52px; font-weight: 300; line-height: 1; margin-bottom: auto; }
.case.ouverture h2 { font-size: 26px; margin: 0 0 10px; }
.case.ouverture p { font-size: 13px; line-height: 1.5; }
.case.note { border: 1.5px solid var(--jaune); display: flex; flex-direction: column; }
.note-texte { font-size: 15px; line-height: 1.5; font-weight: 400; }
.suite { margin-top: auto; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gris); }

/* par où commencer */
.page.jaune { background: var(--jaune); }
.page.jaune .entete { color: var(--encre); border-color: var(--encre); }
.centre { margin: auto 0; max-width: 820px; }
.centre .surtitre { color: var(--encre); }
.titre-xl { font-size: 46px; }
.centre p:not(.surtitre) { font-size: 16px; line-height: 1.6; margin-bottom: 10px; }
`;

async function main() {
  const parties = lire();
  // Pagination : 1 couverture, 2 sommaire, 3 mode d'emploi, 4 contexte, puis deux pages par partie.
  const pages = { mode: 3, contexte: 4, parties: parties.map((_, i) => 5 + i * 2) };
  pages.commencer = 5 + parties.length * 2;

  const corps = [
    couverture(),
    sommaire(parties, pages),
    modeEmploi(pages.mode),
    promptContexte(pages.contexte),
    ...parties.flatMap((p, i) => [pagePrompts(p, i, 0, pages.parties[i]), pagePrompts(p, i, 1, pages.parties[i] + 1)]),
    commencer(pages.commencer),
    merci(),
  ].join('\n');

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>${TITRE}</title><style>${CSS}</style></head>
<body>
${corps}
</body></html>`;
  fs.writeFileSync(SORTIE_HTML, html);

  const navigateur = await chromium.launch();
  const onglet = await navigateur.newPage({ viewport: { width: 1280, height: 720 } });
  await onglet.goto('file://' + SORTIE_HTML);
  await onglet.evaluate(() => document.fonts.ready);
  const polices = await onglet.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').length);
  if (polices < 4) throw new Error(`Polices chargées : ${polices} sur 4`);

  // Aucun texte ne doit déborder de sa case ni de sa page.
  const debords = await onglet.evaluate(() =>
    [...document.querySelectorAll('.case, .page, .regle, .carte')]
      .filter((el) => el.scrollHeight > el.clientHeight + 1)
      .map((el) => (el.querySelector('h3, h2, h1')?.textContent || el.className).trim())
  );
  if (debords.length) throw new Error('Texte qui déborde :\n' + debords.join('\n'));

  await onglet.pdf({ path: SORTIE_PDF, width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });
  await navigateur.close();
  const total = parties.reduce((n, p) => n + p.prompts.length, 0);
  console.log(`${total} prompts, ${pages.commencer + 1} pages → ${path.relative(process.cwd(), SORTIE_PDF)}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
