// Printtex — liaison Shopify des marques (version de test).
// La marque enregistre l'adresse de sa boutique et un jeton d'accès en lecture (commandes, produits).
// L'outil Printtex demande ensuite au service les produits et les nouvelles commandes de la boutique.
// Le jeton reste ici (stockage KV) : il n'est jamais renvoyé au navigateur ni enregistré dans Firestore.
// Contrôle d'accès : l'appelant envoie son jeton Firebase ; on lit la fiche de la marque dans Firestore
// avec ce jeton, donc seuls la marque propriétaire et l'admin Printtex passent (règles Firestore).

const API_VERSION = '2025-01';

function cors(env, req){
  const origin = req.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim());
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] || '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Printtex-Key',
    'Vary': 'Origin'
  };
}
function json(env, req, data, status){
  return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type':'application/json; charset=utf-8', ...cors(env, req) } });
}

async function checkBrandAccess(env, req, brandId){
  if(!/^[A-Za-z0-9_-]{3,80}$/.test(brandId || '')) return 'Marque invalide';
  const auth = req.headers.get('Authorization') || '';
  if(!auth.startsWith('Bearer ')) return 'Connexion requise';
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT}/databases/(default)/documents/${env.BRANDS_COLLECTION}/${brandId}`;
  const r = await fetch(url, { headers: { Authorization: auth } });
  if(r.status === 200) return null;
  if(r.status === 404) return 'Marque introuvable';
  return 'Accès refusé à cette marque';
}

// Admin Printtex : seul l'admin peut lire adminNotes (règles Firestore). 200 = document lu, 404 = absent mais lecture autorisée.
async function checkAdmin(env, req){
  const auth = req.headers.get('Authorization') || '';
  if(!auth.startsWith('Bearer ')) return false;
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT}/databases/(default)/documents/${env.ADMIN_COLLECTION}/toOrder`, { headers: { Authorization: auth } });
  return r.status === 200 || r.status === 404;
}
// Email de la marque, lu dans sa fiche Firestore (jamais fourni par le navigateur).
async function brandEmail(env, req, brandId){
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT}/databases/(default)/documents/${env.BRANDS_COLLECTION}/${brandId}`, { headers: { Authorization: req.headers.get('Authorization') } });
  if(!r.ok) return { error:'Marque introuvable' };
  const f = (await r.json()).fields || {};
  const owner = f.ownerEmail && f.ownerEmail.stringValue;
  const contact = f.contact && f.contact.stringValue;
  const email = owner || (String(contact || '').match(/[^\s<>]+@[^\s<>]+\.[a-z]{2,}/i) || [])[0] || '';
  const name = (f.name && f.name.stringValue) || '';
  return email ? { email, name } : { error:'Aucun email pour cette marque' };
}

async function shopify(conf, path){
  const r = await fetch(`https://${conf.shop}/admin/api/${API_VERSION}/${path}`, { headers: { 'X-Shopify-Access-Token': conf.token, 'Accept':'application/json' } });
  if(!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'Jeton Shopify refusé (vérifiez les autorisations read_orders et read_products)' : 'Shopify a répondu ' + r.status);
  return r.json();
}

// Boutique de démonstration : permet de tester tout le parcours sans vraie boutique ni vraies commandes.
const DEMO_PRODUCTS = [
  { id:'9001', title:'T-shirt Tigre (impression dos ou devant)', image:'https://cdn.shopify.com/s/files/1/0833/8459/8874/files/am018_black_ft.jpg' },
  { id:'9002', title:'Hoodie Logo cœur', image:'https://cdn.shopify.com/s/files/1/0833/8459/8874/files/jh501_airforceblue_ft.jpg' },
  { id:'9003', title:'Mug (fabriqué ailleurs)', image:'' }
];
function demoOrders(){
  const d = n => new Date(Date.now() - n*3600*1000).toISOString();
  return [
    { id:'5001', name:'#1041', created_at:d(30), lines:[
      { id:'7001', product_id:'9001', title:'T-shirt Tigre', variant_title:'Noir / M', quantity:2, properties:[{ name:'Emplacement', value:'Dos' }] },
      { id:'7002', product_id:'9003', title:'Mug', variant_title:'', quantity:1, properties:[] } ]},
    { id:'5002', name:'#1042', created_at:d(20), lines:[
      { id:'7003', product_id:'9001', title:'T-shirt Tigre', variant_title:'Noir / L', quantity:1, properties:[{ name:'Emplacement', value:'Devant' }] },
      { id:'7004', product_id:'9002', title:'Hoodie Logo cœur', variant_title:'Marine / XL', quantity:1, properties:[] } ]},
    { id:'5003', name:'#1043', created_at:d(2), lines:[
      { id:'7005', product_id:'9002', title:'Hoodie Logo cœur', variant_title:'Marine / M', quantity:3, properties:[] } ]}
  ];
}

export default {
  async fetch(req, env){
    if(req.method === 'OPTIONS') return new Response(null, { headers: cors(env, req) });
    const url = new URL(req.url);
    try{
      if(url.pathname === '/connect' && req.method === 'POST'){
        const body = await req.json();
        const denied = await checkBrandAccess(env, req, body.brandId);
        if(denied) return json(env, req, { error: denied }, 403);
        const shop = String(body.shop || '').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'');
        if(shop === 'demo'){
          await env.SHOPS.put('brand:' + body.brandId, JSON.stringify({ shop:'demo', connectedAt: new Date().toISOString() }));
          return json(env, req, { ok:true, shop:'demo', shopName:'Boutique de démonstration' });
        }
        if(!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) return json(env, req, { error:'Adresse attendue : votre-boutique.myshopify.com' }, 400);
        const token = String(body.token || '').trim();
        if(!/^shpat_[A-Za-z0-9]{20,}$/.test(token)) return json(env, req, { error:'Le jeton commence par shpat_ (Shopify → Développer des applications)' }, 400);
        const info = await shopify({ shop, token }, 'shop.json');
        await env.SHOPS.put('brand:' + body.brandId, JSON.stringify({ shop, token, connectedAt: new Date().toISOString() }));
        return json(env, req, { ok:true, shop, shopName: info.shop && info.shop.name });
      }
      // Ruptures et réassort : l'outil publie les lignes en rupture ; la tâche quotidienne (Claude, Gmail) renvoie
      // les dates de commande et numéros de suivi trouvés dans les mails fournisseurs ; l'outil les applique.
      const routineOk = () => env.ROUTINE_KEY && req.headers.get('X-Printtex-Key') === env.ROUTINE_KEY;
      if(url.pathname === '/ruptures' && req.method === 'POST'){
        if(!(await checkAdmin(env, req))) return json(env, req, { error:'Réservé à Printtex' }, 403);
        const body = await req.json();
        const list = Array.isArray(body.ruptures) ? body.ruptures.slice(0, 500) : [];
        await env.SHOPS.put('ruptures', JSON.stringify({ updatedAt: new Date().toISOString(), ruptures: list }));
        return json(env, req, { ok:true, count: list.length });
      }
      if(url.pathname === '/routine/ruptures' && req.method === 'GET'){
        if(!routineOk()) return json(env, req, { error:'Clé invalide' }, 403);
        const r = JSON.parse(await env.SHOPS.get('ruptures') || '{"ruptures":[]}');
        r.lastRun = await env.SHOPS.get('routine:lastRun') || '';
        return json(env, req, r);
      }
      if(url.pathname === '/routine/updates' && req.method === 'POST'){
        if(!routineOk()) return json(env, req, { error:'Clé invalide' }, 403);
        const body = await req.json();
        const pending = JSON.parse(await env.SHOPS.get('updates') || '[]');
        const keys = ['restockOrderedAt', 'restockEta', 'restockTracking'];
        let added = 0;
        for(const u of (Array.isArray(body.updates) ? body.updates : []).slice(0, 200)){
          if(!u || !u.brandId || !u.taskId || !keys.some(k=>u[k])) continue;
          const clean = { id: 'u' + Date.now() + Math.random().toString(36).slice(2,6), brandId: String(u.brandId), taskId: String(u.taskId),
            supplier: String(u.supplier || '').slice(0,60), ref: String(u.ref || '').slice(0,80), note: String(u.note || '').slice(0,300), at: new Date().toISOString() };
          keys.forEach(k=>{ if(u[k]) clean[k] = String(u[k]).slice(0,120); });
          if(pending.some(p=> p.taskId === clean.taskId && keys.every(k=> (p[k]||'') === (clean[k]||'')))) continue;
          pending.push(clean); added++;
        }
        await env.SHOPS.put('updates', JSON.stringify(pending.slice(-500)));
        if(body.lastRun) await env.SHOPS.put('routine:lastRun', String(body.lastRun));
        return json(env, req, { ok:true, added });
      }
      if(url.pathname === '/updates' && req.method === 'GET'){
        if(!(await checkAdmin(env, req))) return json(env, req, { error:'Réservé à Printtex' }, 403);
        return json(env, req, { updates: JSON.parse(await env.SHOPS.get('updates') || '[]') });
      }
      if(url.pathname === '/updates/ack' && req.method === 'POST'){
        if(!(await checkAdmin(env, req))) return json(env, req, { error:'Réservé à Printtex' }, 403);
        const body = await req.json();
        const ids = new Set(Array.isArray(body.ids) ? body.ids : []);
        const pending = JSON.parse(await env.SHOPS.get('updates') || '[]').filter(p=> !ids.has(p.id));
        await env.SHOPS.put('updates', JSON.stringify(pending));
        return json(env, req, { ok:true, left: pending.length });
      }
      // Mails aux marques (rupture, commande du textile, suivi, réception, commande prête), envoyés par Brevo.
      if(url.pathname === '/mail/status' && req.method === 'GET'){
        if(!(await checkAdmin(env, req))) return json(env, req, { error:'Réservé à Printtex' }, 403);
        return json(env, req, { configured: !!env.BREVO_API_KEY, from: env.MAIL_FROM || '' });
      }
      if(url.pathname === '/mail' && req.method === 'POST'){
        if(!(await checkAdmin(env, req))) return json(env, req, { error:'Réservé à Printtex' }, 403);
        if(!env.BREVO_API_KEY) return json(env, req, { error:'Brevo n\'est pas encore configuré' }, 503);
        const body = await req.json();
        const subject = String(body.subject || '').slice(0, 200);
        const text = String(body.text || '').slice(0, 5000);
        if(!subject || !text) return json(env, req, { error:'Mail vide' }, 400);
        const to = await brandEmail(env, req, body.brandId);
        if(to.error) return json(env, req, { error: to.error }, 400);
        const r = await fetch('https://api.brevo.com/v3/smtp/email', {
          method:'POST',
          headers:{ 'api-key': env.BREVO_API_KEY, 'Content-Type':'application/json', 'Accept':'application/json' },
          body: JSON.stringify({
            sender:{ name: env.MAIL_FROM_NAME || 'Printtex', email: env.MAIL_FROM },
            to:[{ email: to.email, name: to.name || undefined }],
            replyTo:{ email: env.MAIL_REPLY_TO || env.MAIL_FROM },
            subject, textContent: text
          })
        });
        const data = await r.json().catch(()=>({}));
        if(!r.ok) return json(env, req, { error: 'Brevo : ' + (data.message || r.status) }, 502);
        return json(env, req, { ok:true, to: to.email, messageId: data.messageId || '' });
      }
      const brandId = url.searchParams.get('brandId');
      if(url.pathname === '/disconnect' && req.method === 'POST'){
        const denied = await checkBrandAccess(env, req, brandId);
        if(denied) return json(env, req, { error: denied }, 403);
        await env.SHOPS.delete('brand:' + brandId);
        return json(env, req, { ok:true });
      }
      if(req.method === 'GET' && ['/status','/products','/orders'].includes(url.pathname)){
        const denied = await checkBrandAccess(env, req, brandId);
        if(denied) return json(env, req, { error: denied }, 403);
        const raw = await env.SHOPS.get('brand:' + brandId);
        if(!raw) return json(env, req, { connected:false });
        const conf = JSON.parse(raw);
        if(url.pathname === '/status') return json(env, req, { connected:true, shop: conf.shop, connectedAt: conf.connectedAt });
        if(url.pathname === '/products'){
          if(conf.shop === 'demo') return json(env, req, { products: DEMO_PRODUCTS });
          const data = await shopify(conf, 'products.json?limit=250&fields=id,title,image,status');
          return json(env, req, { products: (data.products||[]).filter(p=>p.status !== 'archived').map(p=>({ id:String(p.id), title:p.title, image: p.image ? p.image.src : '' })) });
        }
        // Commandes : seulement les infos utiles à la fabrication (aucune adresse ni coordonnée client).
        const since = url.searchParams.get('since') || conf.connectedAt;
        if(conf.shop === 'demo') return json(env, req, { orders: demoOrders() });
        const data = await shopify(conf, `orders.json?status=any&limit=250&created_at_min=${encodeURIComponent(since)}&fields=id,name,created_at,cancelled_at,line_items`);
        const orders = (data.orders||[]).map(o=> o.cancelled_at ? { id:String(o.id), name:o.name, cancelled:true, lines:[] } : ({
          id:String(o.id), name:o.name, created_at:o.created_at,
          lines:(o.line_items||[]).map(l=>({ id:String(l.id), product_id: l.product_id ? String(l.product_id) : '', title:l.title, variant_title:l.variant_title || '', quantity:l.quantity, properties:(l.properties||[]).filter(p=>p && p.name && !String(p.name).startsWith('_')).map(p=>({ name:p.name, value:String(p.value) })) }))
        }));
        return json(env, req, { orders });
      }
      return json(env, req, { error:'Introuvable' }, 404);
    }catch(e){
      return json(env, req, { error: e && e.message ? e.message : 'Erreur' }, 500);
    }
  }
};
