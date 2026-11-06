# Audit de printtex.fr par visiteurs simulés

- `../docs/segmentation-clients.md` : les 13 profils clients pondérés (base de l'audit).
- `kit/navigateur.js` : un vrai navigateur (Chromium) pour les agents : ouvrir une page sur téléphone ou ordinateur, cliquer, taper, envoyer une image de test, capturer l'écran. Voir l'en-tête du fichier.
- `kit/logo.png`, `kit/logo-fond-blanc.png`, `kit/photo.jpg` : images de test.

Les visites portent le repère `PrinttexTestBot` (jamais comptées par Clarity ni par les essais A/B) et bloquent les traceurs (Google, Clarity, TikTok, Klaviyo…), pour ne pas fausser les statistiques.
Règle : on s'arrête à l'aperçu ; jamais de panier final, de paiement, de formulaire envoyé ni de message.

Réseau : l'environnement des sessions autorise printtex.fr, cdn.shopify.com, extensions.shopifycdn.com, fonts.shopifycdn.com, productreviews.shopifycdn.com et cdnjs.cloudflare.com (outil de personnalisation, fabric.js).
