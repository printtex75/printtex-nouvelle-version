> **06/11/2026 : les essais A/B servent au site printtex.fr** (voir `site-ab/README.md`). Dans l'outil de gestion, les 4 essais ci-dessous sont arrêtés (`actif:false`).

# Essais A/B — notre façon de tester une amélioration

Avant : chaque essai était une copie complète de l'appli (`essai-design.html`, `essai-conf.html`…), qu'on regardait puis qu'on supprimait. Difficile à comparer, et rien n'était mesuré.

Maintenant : la nouvelle version (B) vit **dans** l'appli, à côté de la version actuelle (A). On les compare sur de vrais usages, puis on garde la meilleure.

## Les étapes

1. **Demander l'essai** à Claude : « fais un essai A/B de … ». Il le déclare dans `AB_TESTS` (section `Essais A/B` de `index.html`) et écrit la version B à côté de l'actuelle :
   ```js
   if(abVariant('fiche_rapide') === 'B'){ /* nouvelle version */ } else { /* version actuelle */ }
   ```
2. **Les mesures sont automatiques, sur tout le site** : chaque essai en cours reçoit les visites, commandes créées et modifiées, statuts avancés, commandes passées par les marques, produits créés, erreurs affichées, temps moyen pour créer ou passer une commande, et le détail de chaque clic (bouton, onglet, carte). Une mesure propre à un essai s'ajoute avec `abTrack('cle', 'evenement')`.
3. **Regarder la version B avant de lancer** : lien `?ab=fiche_rapide:B` (ou `?ab=B` pour tous les essais). Rien n'est compté avec ce lien.
4. **Lancer** (`actif:true`), relecture et PR comme d'habitude.
5. **Lire les chiffres** : Paramètres → Essais A/B. La version en vert fait mieux. En dessous de 30 affichages de chaque côté, c'est seulement indicatif.
6. **Décider** : on garde la gagnante, Claude retire l'autre version et l'essai (code plus simple, pas de bascule qui traîne).

## Qui voit quoi

- Essai `pour:'marques'` : chaque marque est mise une fois pour toutes en A ou en B (moitié-moitié), sur tous ses appareils.
- Essai `pour:'printtex'` (notre manière de travailler) : alternance par semaines. Le 1er essai change chaque semaine, le 2e toutes les deux semaines, etc. : toutes les combinaisons sont vécues, on ne confond pas deux essais lancés en même temps.
- Dans Paramètres, les boutons **Auto / A / B** forcent une version sur l'appareil où l'on est (Printtex seulement).

## Où sont les chiffres

Collection Firestore `abStats` (`beta_abStats` dans la version de test) : un document par essai, avec un compteur par version et par mesure. Règle à coller : voir `regles-firebase-a-ajouter.md`.

## Essais en cours (lancés le 06/11/2026)

| Essai | Pour | Version B |
|---|---|---|
| `design` | Printtex | Palette sobre, cartes arrondies, barre d'outils sur une ligne, boutons des fenêtres toujours visibles, Échap ferme les fenêtres |
| `fiche_rapide` | Printtex | Clients connus proposés (contact repris), date limite en un clic, dernier produit et impression retenus |
| `espace_marque` | Marques | En-tête plus grand, bouton « Nouvelle commande » en cuir, ruptures en ambre, meilleur contraste, grandes zones tactiles |
| `confirmations` | Marques | Bandeau vert qui reste affiché, messages d'erreur qui disent quoi faire |

Ces versions B reprennent les anciens essais `essai-design.html`, `essai-a11y.html`, `essai-conf.html` et `essai-fiche.html`.
Les corrections de fond de ces copies (enregistrement protégé contre deux appareils, numéro de commande unique, bandeau d'erreur de chargement) ne sont pas des essais : elles se font à part, comme des corrections.
