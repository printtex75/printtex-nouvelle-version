# Règles Firebase à ajouter pour la version de test

Ces blocs **s'ajoutent** aux règles existantes : ne supprime rien de ce qui est déjà dans la console.

## Firestore (Console Firebase → Firestore Database → Règles)

Colle ce bloc **à l'intérieur** de `match /databases/{database}/documents { ... }`, à côté des règles existantes :

```
    // ----- Version de test (collections beta_) -----
    function betaAdmin() {
      return request.auth != null && request.auth.token.email == 'printtex75@gmail.com';
    }
    match /beta_orders/{id=**} { allow read, write: if betaAdmin(); }
    match /beta_adminNotes/{id} { allow read, write: if betaAdmin(); }
    // Essais A/B : chaque compte connecté ajoute ses compteurs, seul Printtex lit les chiffres
    // (déjà publiée dans la console le 06/11/2026)
    match /beta_abStats/{id} {
      allow read: if betaAdmin();
      allow create, update: if request.auth != null && request.resource.data.keys().hasOnly(['A', 'B']);
    }
    match /beta_brands/{brandId} {
      allow read, update, delete: if betaAdmin()
        || (request.auth != null && resource.data.ownerUid == request.auth.uid);
      allow create: if betaAdmin()
        || (request.auth != null && request.resource.data.ownerUid == request.auth.uid);
      match /{sub=**} {
        allow read, write: if betaAdmin()
          || (request.auth != null
              && get(/databases/$(database)/documents/beta_brands/$(brandId)).data.ownerUid == request.auth.uid);
      }
    }
```

## Storage (Console Firebase → Storage → Règles)

Colle ce bloc **à l'intérieur** de `match /b/{bucket}/o { ... }` :

```
    // ----- Version de test (dossier beta/) -----
    match /beta/orders/{all=**} {
      allow read, write: if request.auth != null && request.auth.token.email == 'printtex75@gmail.com';
    }
    match /beta/brands/{brandId}/{all=**} {
      allow read, write: if request.auth != null
        && (request.auth.token.email == 'printtex75@gmail.com'
            || firestore.get(/databases/(default)/documents/beta_brands/$(brandId)).data.ownerUid == request.auth.uid);
    }
```

Clique **Publier** après chaque collage.

## Essais A/B du site printtex.fr (à coller — 06/11/2026)

Firebase → Firestore Database → Règles : colle ce bloc **à l'intérieur** de `match /databases/{database}/documents { ... }`
(par exemple juste avant la ligne `// ----- Version de test (collections beta_) -----`), puis **Publier**.
Les visiteurs du site (non connectés) ne peuvent qu'ajouter +1 aux compteurs `vu`, `panier`, `paiement` d'un essai ; seul Printtex lit les chiffres.

```
    // ----- Essais A/B du site printtex.fr : compteurs envoyés par les visiteurs (avec consentement), lus par Printtex seulement -----
    function abSiteOk(v) {
      return v is map && v.keys().hasOnly(['vu', 'panier', 'paiement']);
    }
    match /siteAbStats/{essai} {
      allow read: if isAdmin();
      allow create, update: if essai.matches('^[a-z0-9_]{1,40}$')
        && request.resource.data.keys().hasOnly(['A', 'B'])
        && abSiteOk(request.resource.data.get('A', {}))
        && abSiteOk(request.resource.data.get('B', {}));
    }
```
