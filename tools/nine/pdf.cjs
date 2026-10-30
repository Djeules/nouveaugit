// Imprime sortie/business-plan-nine.html en PDF, après avoir vérifié qu'aucune page ne déborde :
// on raccourcit le texte, on ne réduit pas la police.
//
//   node tools/nine/pdf.cjs [--captures]
//
// --captures enregistre aussi une image par page dans sortie/pages/, pour relire la mise en page.

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const SORTIE = path.join(__dirname, 'sortie');
const HTML = path.join(SORTIE, 'business-plan-nine.html');
const PDF = path.join(SORTIE, 'business-plan-nine.pdf');

(async () => {
  const navigateur = await chromium.launch();
  const onglet = await navigateur.newPage({ viewport: { width: 1280, height: 720 } });
  await onglet.goto('file://' + HTML);
  await onglet.evaluate(() => document.fonts.ready);

  const debords = await onglet.evaluate(() =>
    [...document.querySelectorAll('.page')].flatMap((p, i) => {
      const zones = [p.querySelector('.corps') || p, ...p.querySelectorAll('.carte, td, .etapes li')];
      return zones
        .filter((z) => z.scrollHeight > z.clientHeight + 1 || z.scrollWidth > z.clientWidth + 1)
        .map((z) => `page ${i + 1} : ${z.className || z.tagName} « ${z.textContent.trim().slice(0, 50)} »`);
    })
  );
  if (debords.length) {
    console.error('Débordements :\n' + debords.join('\n'));
    process.exitCode = 1;
  }

  if (process.argv.includes('--captures')) {
    const dossier = path.join(SORTIE, 'pages');
    fs.mkdirSync(dossier, { recursive: true });
    const nb = await onglet.locator('.page').count();
    for (let i = 0; i < nb; i++) {
      await onglet.locator('.page').nth(i).screenshot({ path: path.join(dossier, `${String(i + 1).padStart(2, '0')}.png`) });
    }
  }

  await onglet.pdf({ path: PDF, width: '1280px', height: '720px', printBackground: true });
  await navigateur.close();
  console.log(PDF);
})();
