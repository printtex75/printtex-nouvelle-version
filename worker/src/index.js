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
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
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
        const orders = (data.orders||[]).filter(o=>!o.cancelled_at).map(o=>({
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
