# Essais A/B — notre façon de tester une amélioration

Avant : chaque essai était une copie complète de l'appli (`essai-design.html`, `essai-conf.html`…), qu'on regardait puis qu'on supprimait. Difficile à comparer, et rien n'était mesuré.

Maintenant : la nouvelle version (B) vit **dans** l'appli, à côté de la version actuelle (A). On les compare sur de vrais usages, puis on garde la meilleure.

## Les étapes

1. **Demander l'essai** à Claude : « fais un essai A/B de … ». Il le déclare dans `AB_TESTS` (section `Essais A/B` de `index.html`) et écrit la version B à côté de l'actuelle :
   ```js
   if(abVariant('fiche_rapide') === 'B'){ /* nouvelle version */ } else { /* version actuelle */ }
   ```
2. **Choisir ce qu'on mesure** (une commande envoyée, un bouton utilisé…) : `abTrack('fiche_rapide', 'commande_creee')`. Les affichages (« vu ») sont comptés tout seuls.
3. **Regarder la version B avant de lancer** : lien `?ab=fiche_rapide:B` (ou `?ab=B` pour tous les essais). Rien n'est compté avec ce lien.
4. **Lancer** (`actif:true`), relecture et PR comme d'habitude.
5. **Lire les chiffres** : Paramètres → Essais A/B. La version en vert fait mieux. En dessous de 30 affichages de chaque côté, c'est seulement indicatif.
6. **Décider** : on garde la gagnante, Claude retire l'autre version et l'essai (code plus simple, pas de bascule qui traîne).

## Qui voit quoi

- Essai `pour:'marques'` : chaque marque est mise une fois pour toutes en A ou en B (moitié-moitié), sur tous ses appareils.
- Essai `pour:'printtex'` (notre manière de travailler) : A une semaine, B la semaine suivante, en alternance.
- Dans Paramètres, les boutons **Auto / A / B** forcent une version sur l'appareil où l'on est (Printtex seulement).

## Où sont les chiffres

Collection Firestore `abStats` (`beta_abStats` dans la version de test) : un document par essai, avec un compteur par version et par mesure. Règle à coller : voir `regles-firebase-a-ajouter.md`.
