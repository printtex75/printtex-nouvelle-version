/* Kit de visite pour les agents de l'audit printtex.fr : un vrai navigateur (Chromium) qui clique, tape, envoie une image.
   Utilisation dans un script Node :
     const nav = require('/home/user/printtex-nouvelle-version/audit/kit/navigateur.js');
     const v = await nav.ouvrir({ appareil:'telephone', dossier:'/tmp/claude-0/audit/profil-1' });   // ou 'ordinateur'
     await v.aller('https://printtex.fr/products/t-shirt-basic-noir');
     await v.capture('fiche');                       // capture de ce qu'on voit à l'écran (pas toute la page)
     await v.capture('fiche-entiere', true);         // toute la page
     console.log(await v.texte());                   // texte visible à l'écran
     await v.cliquer('Personnaliser');               // par texte visible, ou par sélecteur CSS : v.cliquer('[data-pp-open]')
     console.log(await v.boutons());                 // boutons et liens visibles, pour savoir où cliquer
     await v.taper('input[type=text]', 'Team Sarah 2026');
     await v.envoyer('input[type=file]', nav.IMAGES.photo);   // images de test : logo, photo, logoFondBlanc
     await v.defiler(800);                           // défile de 800 px
     await v.fermer();
   Règles : pas de passage en caisse, pas de formulaire envoyé, pas de bouton « Ajouter au panier » / « Panier » final,
   pas d'avis, pas de message dans la discussion. On s'arrête à l'aperçu. */
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');
const KIT = __dirname;
const IMAGES = { logo: path.join(KIT, 'logo.png'), photo: path.join(KIT, 'photo.jpg'), logoFondBlanc: path.join(KIT, 'logo-fond-blanc.png') };
/* Repère « robot de test » : Clarity et les essais A/B du site ne comptent jamais ces visites */
const UA_TEL = devices['iPhone 13'].userAgent + ' PrinttexTestBot';
const UA_PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 PrinttexTestBot';
const BLOQUES = /googletagmanager|google-analytics|clarity\.ms|tiktok|klaviyo|facebook|doubleclick|monorail|otlp-http|cloudfront\.net/;

async function ouvrir({ appareil = 'telephone', dossier = '/tmp/claude-0/audit' } = {}){
  fs.mkdirSync(dossier, { recursive: true });
  const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY || process.env.https_proxy } });
  const ctx = await b.newContext(appareil === 'telephone'
    ? { ...devices['iPhone 13'], userAgent: UA_TEL, ignoreHTTPSErrors: true, locale: 'fr-FR' }
    : { viewport: { width: 1366, height: 820 }, userAgent: UA_PC, ignoreHTTPSErrors: true, locale: 'fr-FR' });
  await ctx.route('**/*', r => BLOQUES.test(r.request().url()) ? r.abort() : r.continue());
  const p = await ctx.newPage();
  const erreurs = [];
  p.on('pageerror', e => erreurs.push(e.message));
  let n = 0;
  const v = {
    page: p, erreurs,
    async aller(url){ await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); await p.waitForTimeout(3500); return p.url(); },
    async capture(nom, entiere = false){ const f = path.join(dossier, String(++n).padStart(2, '0') + '-' + nom + '.png'); await p.screenshot({ path: f, fullPage: entiere }); return f; },
    async texte(){ return (await p.evaluate(() => document.body.innerText)).replace(/\n{3,}/g, '\n\n').slice(0, 6000); },
    /* Clic par sélecteur CSS, ou par texte : d'abord dans la fenêtre ouverte (outil de personnalisation), boutons en priorité */
    async cliquer(cible){
      let el;
      if (/^[.#\[]|^[a-z]+[\[.#]/.test(cible)) el = p.locator(cible).filter({ visible: true }).first();
      else {
        const dlg = p.locator('[role=dialog][aria-modal=true]').filter({ visible: true });
        const zone = (await dlg.count()) ? dlg.last() : p.locator('body');
        const re = new RegExp(cible.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const candidats = [zone.getByRole('button', { name: re }), zone.getByRole('link', { name: re }), zone.getByText(cible, { exact: false })];
        for (const c of candidats) { const v = c.filter({ visible: true }); if (await v.count()) { el = v.first(); break; } }
        if (!el) throw new Error('Rien de visible ne correspond à « ' + cible + ' »');
      }
      await el.click({ timeout: 8000 }); await p.waitForTimeout(1500);
    },
    /* Liste des boutons et liens visibles (dans la fenêtre ouverte s'il y en a une) : pour savoir où cliquer */
    async boutons(){
      return p.evaluate(() => {
        const dlg = [...document.querySelectorAll('[role=dialog][aria-modal=true]')].filter(d => d.offsetParent || getComputedStyle(d).position === 'fixed').pop();
        const zone = dlg || document.body;
        return [...zone.querySelectorAll('button, a, [role=button], label')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.bottom > 0 && r.top < innerHeight; })
          .map(e => (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 60);
      });
    },
    async taper(selecteur, texte){ const el = p.locator(selecteur).filter({ visible: true }).first(); await el.fill(texte); await p.waitForTimeout(800); },
    async envoyer(selecteur, fichier){ await p.locator(selecteur).first().setInputFiles(fichier); await p.waitForTimeout(3000); },
    async defiler(px){ await p.mouse.wheel(0, px); await p.waitForTimeout(800); },
    async attendre(ms){ await p.waitForTimeout(ms); },
    async fermer(){ await b.close(); }
  };
  return v;
}
module.exports = { ouvrir, IMAGES };
