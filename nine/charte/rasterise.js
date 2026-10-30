// Rasterise des SVG en PNG transparents : node rasterise.js <largeur> a.svg b.svg …
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [largeur, ...fichiers] = process.argv.slice(2);
  const nav = await chromium.launch();
  const page = await nav.newPage();
  for (const f of fichiers) {
    const svg = fs.readFileSync(f, 'utf8').replace('<svg ', '<svg style="width:100%;height:auto;display:block" ');
    await page.setContent(`<html><body style="margin:0;background:transparent"><div id="l" style="width:${largeur}px">${svg}</div></body></html>`);
    await page.locator('#l').screenshot({ path: f.replace(/\.svg$/, '.png'), omitBackground: true });
  }
  await nav.close();
})();
