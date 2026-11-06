/* Printtex : essais A/B du site (printtex.fr).
   - Seulement avec le consentement « statistiques » du bandeau cookies (sinon : version actuelle, rien n'est mesuré).
   - Chaque visiteur est placé une fois pour toutes en A (version actuelle) ou B (nouvelle), moitié-moitié.
   - Mesures (une fois par visite et par essai) : vu, ajout au panier, passage au paiement ; achats et chiffre d'affaires
     lus dans les commandes Shopify grâce à l'attribut de panier caché « _ab ».
   - Chiffres dans Firestore (projet printtex-commande, collection siteAbStats), lus par l'analyse du lundi.
   - Aperçu sans rien compter : ?ab=avis_mobile:B (ou ?ab=B pour tous les essais).
   Pour ajouter un essai : une entrée dans TESTS (actif, eligible, appliquerB). Pour l'arrêter : actif:false. */
(() => {
  /* robots et éditeur de thème : jamais compté (l'aperçu ?ab=… reste possible, il ne compte rien) */
  /* paramètre ?ab= lu tôt par snippets/printtex-ab.liquid (le thème réécrit l'adresse avec ?variant= avant ce script) */
  const lien = window.PTX_AB_LIEN || new URLSearchParams(location.search).get('ab');
  const robot = !!(navigator.webdriver || /PrinttexTestBot/.test(navigator.userAgent) || window.Shopify?.designMode);
  if (robot && !lien) return;

  const FIRESTORE = 'https://firestore.googleapis.com/v1/projects/printtex-commande/databases/(default)/documents';
  const CLE_API = 'AIzaSyBElBwDqwtR1jTIs_n2iyjM4juuwAJfTck';
  const mobile = () => window.matchMedia('(max-width: 767px)').matches;

  const TESTS = {
    /* Essai 1 (06/11/2026) : sur téléphone, 63 % des visites mais 2 fois moins d'achats que sur ordinateur.
       La note Google (5,0/5, 146 avis) n'apparaît que sous les couleurs et tailles : en B, elle est recopiée sous le prix. */
    avis_mobile: {
      actif: true,
      eligible: () => mobile() && /\/products\//.test(location.pathname) && !!document.querySelector('.pp-avis') && !!document.querySelector('.pf-prix'),
      appliquerB: () => {
        const avis = document.querySelector('.pp-avis'), prix = document.querySelector('.pf-prix');
        if (!avis || !prix || document.querySelector('.ptx-ab-avis')) return;
        const copie = avis.cloneNode(true);
        copie.classList.add('ptx-ab-avis');
        copie.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin:8px 0 2px;font-size:14px;text-decoration:none;color:inherit;';
        prix.insertAdjacentElement('afterend', copie);
      }
    }
  };

  const lire = (s, k) => { try { return JSON.parse(s.getItem(k) || '{}') || {}; } catch (e) { return {}; } };
  const ecrire = (s, k, v) => { try { s.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* Aperçu par lien : rien n'est enregistré ni compté */
  const apercu = (cle) => {
    if (!lien) return null;
    if (lien === 'A' || lien === 'B') return lien;
    const t = lien.split(',').map((x) => x.split(':')).find(([k]) => k === cle);
    return t && (t[1] === 'A' || t[1] === 'B') ? t[1] : null;
  };

  const compter = (cle, version, evt) => {
    const vus = lire(sessionStorage, 'ptx_ab_vus');
    const id = cle + ':' + evt;
    if (vus[id]) return;
    vus[id] = 1; ecrire(sessionStorage, 'ptx_ab_vus', vus);
    try {
      fetch(`${FIRESTORE}:commit?key=${CLE_API}`, {
        method: 'POST', keepalive: true, headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ writes: [{ transform: {
          document: `projects/printtex-commande/databases/(default)/documents/siteAbStats/${cle}`,
          fieldTransforms: [{ fieldPath: `${version}.${evt}`, increment: { integerValue: '1' } }]
        } }] })
      }).catch(() => {});
    } catch (e) {}
  };

  let actifs = []; // [{ cle, version }] essais vus pendant cette visite (avec consentement)

  const marquerPanier = () => {
    if (!actifs.length) return;
    const valeur = actifs.map((a) => a.cle + ':' + a.version).join(',');
    if (sessionStorage.getItem('ptx_ab_panier') === valeur) return;
    fetch((window.Shopify?.routes?.root || '/') + 'cart/update.js', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ attributes: { _ab: valeur } })
    }).then((r) => { if (r.ok) sessionStorage.setItem('ptx_ab_panier', valeur); }).catch(() => {});
  };

  const demarrer = (consenti) => {
    const choix = lire(localStorage, 'ptx_ab');
    let change = false;
    Object.entries(TESTS).forEach(([cle, t]) => {
      if (!t.actif) return;
      const force = apercu(cle);
      let version = force;
      if (!version) {
        if (!consenti || robot) return; // sans consentement (ou robot) : version actuelle, rien d'enregistré
        version = choix[cle];
        if (version !== 'A' && version !== 'B') { version = Math.random() < 0.5 ? 'A' : 'B'; choix[cle] = version; change = true; }
      }
      if (!t.eligible()) return;
      if (version === 'B') { try { t.appliquerB(); } catch (e) {} }
      document.documentElement.classList.add(`ab-${cle}-${version}`);
      if (force) return; // aperçu : rien n'est compté
      actifs.push({ cle, version });
      compter(cle, version, 'vu');
      try { window.clarity?.('set', 'ab_' + cle, version); } catch (e) {}
      try { window.Shopify?.analytics?.publish?.('ab_vu', { essai: cle, version }); } catch (e) {}
    });
    if (change) ecrire(localStorage, 'ptx_ab', choix);
    if (!actifs.length) return;
    marquerPanier();
    /* Ajout au panier : formulaire classique ou appel /cart/add (outil de personnalisation, ajout rapide) */
    const panier = () => { actifs.forEach((a) => compter(a.cle, a.version, 'panier')); setTimeout(marquerPanier, 800); };
    document.addEventListener('submit', (e) => { if (/\/cart\/add/.test(e.target?.action || '')) panier(); }, true);
    const fetchOrigine = window.fetch;
    window.fetch = function (entree, options) {
      const p = fetchOrigine.apply(this, arguments);
      try {
        const url = typeof entree === 'string' ? entree : entree?.url || '';
        if (/\/cart\/add(\.js)?(\?|$)/.test(url)) p.then((r) => { if (r.ok) panier(); }).catch(() => {});
      } catch (e) {}
      return p;
    };
    /* Passage au paiement */
    document.addEventListener('click', (e) => {
      if (e.target.closest?.('[name="checkout"], a[href*="/checkout"], button[form*="cart"][name="checkout"]')) actifs.forEach((a) => compter(a.cle, a.version, 'paiement'));
    }, true);
  };

  /* Consentement statistiques (même méthode que Clarity) */
  let lance = false;
  const lancer = (consenti) => { if (lance) return; lance = true; demarrer(consenti); };
  const lireConsentement = () => {
    try { lancer(!!window.Shopify.customerPrivacy.analyticsProcessingAllowed()); } catch (e) { lancer(false); }
  };
  document.addEventListener('visitorConsentCollected', (e) => {
    if (e.detail?.analyticsAllowed && lance && !actifs.length) { lance = false; lancer(true); }
  });
  const pret = () => {
    if (window.Shopify?.loadFeatures) window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], (err) => (err ? lancer(false) : lireConsentement()));
    else lancer(false);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pret); else pret();
})();
