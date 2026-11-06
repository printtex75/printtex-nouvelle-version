# Audit de printtex.fr par clientèle simulée (06/11/2026)

## Méthode et limites

- 13 profils de `segmentation-clients.md`, plus une niche (étiquettes au nom). Chaque profil est joué par un agent.
- **Vague 1** (7 agents) : recherche Google réaliste, puis visite de 4 à 7 pages. Pour une partie, sans navigateur interactif. Les crédits Firecrawl ont manqué en cours de route : quelques pages n'ont pas été vues.
- **Vague 2** (4 agents) : un vrai navigateur (Chromium, iPhone 13 simulé ou ordinateur) manipule l'outil de personnalisation. Arrêt à l'aperçu : aucun panier, aucun paiement, aucun formulaire envoyé. Les visites sont marquées `PrinttexTestBot` et les traceurs sont bloqués.
- **Page d'accueil** : étudiée à part, sur téléphone et sur ordinateur.
- **Ce sont des simulations.** Les pourcentages sont des estimations raisonnées, pas des mesures. Ils servent à classer les problèmes. Seuls des tests A/B sur de vrais visiteurs pourront confirmer les gains.

## Décision de chaque profil

| Profil | Appareil | Trouve Printtex sur Google ? | Décision la plus probable | Raison principale |
|---|---|---|---|---|
| 1. Sarah, enterrement de vie de jeune fille | Téléphone | Non | **Achète, 40 à 55 %** | L'outil est clair. Doute sur la photo « trop faible » et sur le prix (25 € au lieu des 20 € annoncés) |
| 5. Inès, boulangerie | Téléphone | **Oui, 2e** (tablier) | **Achète, 45 à 55 %** | La page tabliers rassure (60 °C, logo refait 5 €) |
| 8. Moussa, hommage en 4 jours | Téléphone | Non | **Appelle, 45 à 70 %** | Le téléphone est visible, mais il n'y a ni page hommage, ni WhatsApp, et le délai est caché |
| 6. Claire, entreprise (60 hoodies) | Ordinateur | Non | **Devis, 35 à 55 %**, en parallèle de concurrents | Ni prix HT, ni prix de broderie, ni paiement à 30 jours pour les sociétés |
| 10. Fatou, centre de loisirs | Ordinateur | **Oui, 2e** | **Devis, 40 %** | Le mandat administratif est bien expliqué, mais aucun t-shirt enfant jaune ou orange |
| 3. Yanis, marque de vêtements | Ordinateur | 7e | Devis, 35 % | La liaison Shopify n'est jamais mentionnée, et les prix du hoodie se contredisent |
| 7. Lucas, BDE (150 sweats) | Téléphone | Non | **Part, 55 à 65 %** | Chaque étudiant ne peut pas payer sa part, broderie invisible, pas de prix au-delà de 100 pièces |
| 2. Nadia, club de handball | Téléphone | 4e (t-shirts) | **Part, 40 à 65 %** | Pas de boutique du club où chaque parent paie, pas de vrai maillot |
| 11. Julie, coach de pilates | Téléphone | Non | Part, 55 % | Pas de coupe femme sport, ses élèves ne peuvent pas commander elles-mêmes |
| 4. Mickaël, plombier | Téléphone | Non | **Part, 75 %** (30 % dans l'outil) | Aucun prix pour la broderie ou le dos, lavage à 60 °C et facture d'entreprise sans réponse |
| 13. Thomas, festival (300 pièces) | Ordinateur | Non | Part, 75 % | Aucune fourchette de prix au-delà de 100 pièces, aucune photo de sérigraphie |
| 9. Léa, streameuse | Téléphone | Non | **Part, 70 à 80 %** | Rien n'indique que Printtex expédie directement à ses fans |
| 12. Sébastien, pro du DTF | Ordinateur | 5e à 7e | Part, 90 % | Prix au m² 2 à 4 fois plus cher que la concurrence, pas de vente au mètre, pas de prix HT |
| Niche : étiquettes au nom | Téléphone | Non | Part, 98 % | Le produit n'existe pas sur le site |

**En résumé :** le site convertit bien le particulier qui commande 1 à 8 pièces et le commerce de quartier. Il perd presque tous ceux qui achètent en groupe ou en volume, c'est-à-dire la plus grosse part du marché possible.

## Les 4 grandes causes

### 1. Printtex est invisible sur Google pour la plupart des besoins
Printtex est absent sur « t-shirt evjf », « sweat de promo BDE », « maillot club nom numéro », « tenue de travail artisan », « hoodie brodé entreprise », « t-shirt hommage », « merch streamer » et « étiquette nom ». Il est présent sur « tablier boulangerie » (2e), « t-shirt centre de loisirs » (2e) et « t-shirt club association » (4e). Là où une page dédiée existe et est bien ciblée, ça marche.

### 2. Les achats de groupe ne sont pas servis
Sur le site, 79 % des commandes sont d'une seule pièce et aucune ne dépasse 5 pièces. Clubs, BDE, coachs et créateurs bloquent tous au même endroit : **la personne qui organise doit avancer tout l'argent.**
L'outil sait déjà récolter noms, numéros et tailles par lien (« Envoyer un lien à l'équipe »), mais pas le paiement de chacun. Les concurrents vus sur Google l'annoncent noir sur blanc : « nous récoltons les règlements et les tailles de chaque étudiant ».

### 3. Les prix se contredisent
- L'accueil annonce « dès 20 € », mais le bouton ouvre un t-shirt noir à 25 €.
- La grille annonce 13 € (6 à 50 pièces), mais le club paie 23 € en noir avec impression face et dos.
- Le hoodie apparaît à « dès 36 € » d'un côté, à 61,50 € et 38,50 € ailleurs.
- La collection oversize affiche 14 € de 2 à 5 pièces, la fiche 19 €.
- Les options changent le prix sans le dire : dos +7 à +8 €, « logo amélioré » +5 € absent du prix affiché.
- Les délais se contredisent : « 1 à 3 jours » dans le bandeau, « 4 à 7 jours » sur plusieurs fiches. La livraison est offerte « dès 100 € » sur certaines pages, « dès 150 € » sur d'autres.
- Aucun prix HT, alors que les entreprises et les professionnels raisonnent en HT.

### 4. Ce que les pros veulent savoir n'est écrit nulle part
Prix de la broderie (toujours « sur devis »), lavage à 60 °C, facture au nom d'une société, paiement à 30 jours pour une entreprise privée, échantillon, photos de vraies réalisations (sérigraphie, maillots, tenues d'artisan).

## Pourquoi le téléphone vend 2 fois moins

1. **Premier écran de l'accueil** : sur ordinateur, on voit les 3 entrées (particulier, pros, marque) et la note 5,0 sur 146 avis. Sur téléphone, les entrées arrivent au 2e écran et les avis bien plus bas. La page fait 10,5 écrans de haut.
2. **Dans l'outil, les panneaux cachent le vêtement.** Ils couvrent la moitié du t-shirt, et la totalité une fois agrandis. On règle à l'aveugle.
3. **Le délai et l'express sont cachés sur téléphone.** Ils sont dans le code de la page mais repliés sous « Une date à respecter ? ». Ils manquent aussi dans l'aperçu.
4. **Messages inquiétants sans solution.** La pastille rouge « Qualité : trop faible » s'affiche sur une photo de téléphone, avec des messages contradictoires (« moyenne » d'un côté, « risque de flou » de l'autre). L'alerte disparaît à l'aperçu.
5. **Beaucoup d'actions** : 23 à 25 actions pour 8 t-shirts. La grille des tailles s'ouvre au milieu, si bien que XS et S sont cachées.
6. **Beaucoup de défilement**, et des listes trop longues (55 polices).

## Défauts de l'outil de personnalisation (vus en vrai)

| Gravité | Défaut | Profils touchés |
|---|---|---|
| Bloquant | Ouvrir puis fermer « Commande d'équipe » **efface les quantités déjà saisies** (60 pièces → 0) | Claire, Léa |
| Bloquant | Après « Revenir aux tailles simples », la taille disparaît et « Aperçu avant panier » devient gris **sans message** | Léa |
| Bloquant | Page devis : « Coller une liste » partielle **remplace la quantité** (150 → 10) alors que le récapitulatif affiche toujours 150 | Lucas |
| Important | Un 2e élément (texte) se pose **par-dessus** le 1er (photo) | Sarah |
| Important | Logo invisible sur le tissu (blanc sur beige, foncé sur noir) **sans alerte**, et réglages perdus quand on change de produit | Inès, Mickaël, Léa |
| Important | Le prix change sans explication : dos, options +5 € | Mickaël, Léa, Inès |
| Important | Une taille choisie sur la fiche reste comptée : 5 pièces au lieu de 4 | Mickaël |
| Important | Au-delà de 100 pièces, le prix et l'aperçu disparaissent | Lucas |
| Important | Le bouton « Suivant » de l'équipe est illisible (texte et fond de la même couleur) | Claire |
| Important | Le format « Coller une liste » diffère entre l'outil et le devis : « XS ; 2 » devient un nom | Claire |
| Gênant | L'aperçu d'équipe n'affiche que 3 vignettes sur 25, et jamais le blason | Nadia |
| Gênant | Une fiche « noir » s'ouvre en blanc | Nadia |
| Gênant | Le panneau photo emploie un vocabulaire de logo (« fond gardé », « logo flou ? ») | Moussa, Sarah |
| Gênant | Phrase incohérente : « avant le lundi 9 : reçu le lundi 9 » | Moussa |

## Erreurs de contenu à corriger (rapide)

- Texte d'exemple Shopify visible : « Cette section ne contient actuellement aucun contenu… » (blog séminaire, blog colonie).
- `/pages/tarifs` : « Bonnet jersey coton » apparaît 2 fois, la 2e fois à 10 € / 3,50 €, probablement à la place du tote bag.
- `/collections/bags` : texte Halloween périmé (« commandez avant le 29/10 »).
- « 0 avis » (widget Klaviyo) affiché à côté de « 146 avis Google » sur plusieurs fiches.
- Les CGV (texte Shopify par défaut) interdisent la revente, alors que commerces, marques et créateurs revendent.
- Liens « article précédent / suivant » du blog colonie qui pointent tous les deux vers la même page.
- Tailles enfant différentes entre la collection (14/15) et le devis (12-14).
- **Fausse alerte vérifiée** : les « (épuisé) » relevés par plusieurs agents viennent du code du thème. Ils ne sont pas affichés, et Google lit « en stock » pour 99 variantes sur 99.

## Améliorations classées

### A. Rapides (quelques heures, gros effet)
1. Faire ouvrir le bouton « Personnaliser » de l'accueil sur le t-shirt **blanc** à 20 €, ou écrire « dès 20 € en blanc ».
2. Sur téléphone, placer la **note 5,0 sur 146 avis** et les **entrées par occasion** (cadeau, enterrement de vie, club, BDE, entreprise, hommage, marque) sur le premier écran.
3. Harmoniser délais, seuils de livraison offerte et grilles de prix sur toutes les pages.
4. Afficher le surcoût au moment où il apparaît : « +7 € pour le dos », « +5 € logo amélioré ».
5. Corriger les erreurs de contenu ci-dessus.
6. Afficher le délai et l'express dans l'outil et dans l'aperçu, sur téléphone.

### B. Corrections de l'outil (1 à 3 jours)
1. Ne plus jamais effacer une saisie : quantités en mode équipe, collage du devis.
2. Placer le 2e élément sous le 1er, et alerter quand le contraste avec le tissu est faible, à chaque changement de produit ou de couleur.
3. Pour une photo : un message rassurant (« taille conseillée 14 cm », avec un bouton qui l'applique), sans vocabulaire de logo, rappelé à l'aperçu.
4. Garder un prix indicatif et l'aperçu au-delà de 100 pièces.
5. Un choix « Broderie (prix indicatif) » dans l'outil.

### C. Nouvelles offres et pages (1 à 3 semaines)
1. **Commande de groupe avec paiement individuel.** Le lien d'équipe existe déjà : chaque réponse ouvrirait un panier Shopify prérempli au prix du palier. Cela sert les clubs, les BDE, les coachs, les familles et les colonies.
2. **Pages par besoin, faites pour Google** : enterrement de vie, sweat de promo BDE, maillot de club, tenue d'artisan (pack logo + téléphone avec prix affiché), entreprises (prix HT, paiement à 30 jours, échantillon, broderie), hommage (ton sobre, express, appel et WhatsApp), créateurs et streamers (fabrication et envoi aux fans, liaison Shopify déjà en place).
3. **Gamme** : t-shirts enfants jaune, orange et vert vif ; coupe femme sport ; planche d'étiquettes au nom (feuille DTF, environ 15 €, tenue à 60 °C à tester avant de la vendre).
4. **Pros du DTF** : vente au mètre (56 cm) avec prix HT, ou renoncer à ce segment. Aux prix actuels, il n'est pas compétitif.
5. **Preuves** : photos de vraies réalisations (maillots, sérigraphie, tenues d'artisan, sweats de promo) et cas clients.

## Audiences à viser en priorité

1. **Groupes : clubs, BDE, familles, colonies.** C'est le plus gros potentiel, aujourd'hui presque entièrement perdu. Levier : le paiement individuel, plus une page par besoin.
2. **Entreprises.** Panier élevé (1 500 à 8 000 €), et les logos de grands clients sont déjà là. Levier : prix HT, broderie chiffrée, paiement à 30 jours.
3. **Créateurs et marques.** Le service existe déjà (84 marques) mais n'est pas expliqué sur le site.
4. **Commerces de quartier et particuliers.** Ça marche déjà. Levier : cohérence des prix et faire revenir les clients (3 % reviennent aujourd'hui).
5. **Niches** : hommage (urgent et peu servi), étiquettes au nom (marché récurrent, produit facile à fabriquer).

## Ce qui marche bien (à garder)
- La note 5,0 sur 146 avis Google et les logos de clients connus.
- L'atelier à Paris 20e, le retrait gratuit, l'express expédié le jour même.
- L'outil : détection du fond blanc, position « Cœur », passage Face / Dos, aperçu avec vérification des tailles et du texte.
- La commande d'équipe : liste par personne, collage de liste, aperçu par joueur.
- Le devis : estimation chiffrée, mandat administratif et Chorus Pro, maquette téléchargeable.
- Les pages qui se classent bien sur Google : tabliers, colonie, flocage.

## Suite proposée
1. Corriger A et B, avec la session chef qui publie le site.
2. Mesurer avec les essais A/B (`site-ab/`), en commençant par le premier écran de l'accueil sur téléphone.
3. Lancer C1 (paiement individuel) et 2 ou 3 pages par besoin.
4. Refaire passer les mêmes agents après les corrections pour comparer.
