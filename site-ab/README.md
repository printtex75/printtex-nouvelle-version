# Essais A/B du site printtex.fr

Copie de référence des fichiers posés dans le thème Shopify **« Printtex - lot 37 + essais A/B »**
(copie du thème en ligne « Printtex - lot 37 », créée le 06/11/2026, non publiée).

| Fichier du thème | Rôle |
|---|---|
| `assets/printtex-ab.js` | Le script des essais (copie : `printtex-ab.js`) |
| `snippets/printtex-ab.liquid` | Charge le script (copie : `printtex-ab.liquid`) |
| `snippets/printtex-clarity.liquid` | 2 lignes ajoutées à la fin : `{%- render 'printtex-ab' -%}` |

## Comment ça marche

- Seulement avec le **consentement « statistiques »** du bandeau cookies, comme Clarity. Sans consentement : version actuelle, rien n'est enregistré.
- Chaque visiteur est placé une fois pour toutes en **A** (version actuelle) ou **B** (nouvelle), moitié-moitié.
- Compté une fois par visite : `vu`, `panier` (ajout au panier), `paiement` (clic vers le paiement) → Firestore `siteAbStats/<essai>`.
- Achats et chiffre d'affaires : le panier reçoit l'attribut caché `_ab` (ex. `avis_mobile:B`), visible dans les commandes Shopify.
- Clarity reçoit l'étiquette `ab_<essai>` : on peut filtrer les enregistrements de visites par version.
- Aperçu sans rien compter : `?ab=avis_mobile:B` (ou `?ab=B`). Robots et éditeur de thème : jamais comptés.

## Essai 1 : `avis_mobile` (lancé le 06/11/2026)

Constat (30 derniers jours) : 63 % des visites sur téléphone, mais 0,9 % d'achat contre 1,9 % sur ordinateur, et 5 % d'ajout au panier contre 9 %.
La note Google (5,0/5, 146 avis) n'apparaît sur téléphone que sous les couleurs et les tailles.
**Version B** : la note est recopiée juste sous le prix, sur les fiches produit, sur téléphone uniquement.

Mesure principale : ajout au panier par visite (plus fréquent que l'achat, donc réponse plus rapide). Achats et chiffre d'affaires en contrôle.

## Mise en ligne (à faire par Karim)

1. Firebase → Firestore → Règles : coller le bloc `siteAbStats` (voir `../regles-firebase-a-ajouter.md`), Publier.
2. Shopify → Boutique en ligne → Thèmes → « Printtex - lot 37 + essais A/B » → **Publier**.
   À faire rapidement : une modification faite entre-temps dans le thème en ligne ne serait pas dans la copie.

## Ajouter / arrêter un essai

Dans `assets/printtex-ab.js`, objet `TESTS` : une entrée par essai (`actif`, `eligible`, `appliquerB`). `actif:false` arrête l'essai.
Une fois la gagnante choisie : garder la version gagnante dans le thème, retirer l'essai.
