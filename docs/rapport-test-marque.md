# Rapport de test : point de vue d'une marque cliente

Test fait en mode démo uniquement (`?demo=marque` et `?demo=1`), sur ordinateur puis téléphone (375 px).

Protection des données : `beta_brands/test_mail` et `beta_adminNotes/toOrder` répondent 403 sans connexion (protégés). La vue marque ne montre ni facturation, ni autres marques, ni boutons Fait / Prêtes / Rupture (les blocs de facturation et de prix existent dans la page mais sont masqués).

Aucun problème « Bloquant » trouvé : tous les parcours aboutissent.

## Problèmes

| Gravité | Étape du parcours | Ce que la marque voit | Pourquoi ça bloque ou gêne | Amélioration proposée |
|---|---|---|---|---|
| Important | 2. Boutique Shopify | Mode d'emploi en 3 étapes (Développer des applications, droits read_orders / read_products, révéler le jeton shpat_), puis un champ « Jeton d'accès » | Une marque non technique n'y arrivera pas seule ; un jeton secret est à copier-coller dans le navigateur (erreur ou fuite possible) | Faire l'installation avec Printtex, ou prévoir un lien d'installation en un clic ; au minimum des captures d'écran et un message clair si le jeton est refusé |
| Important | 2. Shopify, liaison | On relie un produit Shopify à un produit Printtex entier, sans voir les variantes (couleur, taille) | La marque ne sait pas si un « Noir M » Shopify arrivera bien en Noir M ; une couleur absente chez Printtex n'est pas signalée | Afficher la correspondance variante par variante et prévenir quand une variante n'a pas d'équivalent |
| Important | 1. Nouvelle commande | La confirmation dit seulement « 15 pièce(s) réparties sur 2 ligne(s) ? » | Aucun détail (produit, couleur, tailles), ni prix ni délai : on confirme à l'aveugle | Résumé par produit / couleur / taille dans la confirmation, avec délai indicatif |
| Important | 1. Nouvelle commande, téléphone | Chaque produit affiche une grande photo, puis 9 tailles par couleur : environ 1900 px de défilement, bouton « Créer la commande » tout en bas | Long et pénible sur iPhone ; pas de total de pièces visible pendant la saisie | Photo réduite en vignette, total et bouton fixés en bas de l'écran |
| Important | 3. Visuels | Image à fond blanc sur textile noir : rien n'est retiré ni signalé | Un rectangle blanc sera imprimé (surtout en DTF) sans que la marque le sache | Avertir « le fond blanc sera imprimé » et proposer de le retirer |
| Important | 3. Visuels, plusieurs couleurs | Produit « Noir, Blanc » : seule la première couleur sert à décider du retrait du fond | Un logo à fond blanc sur textile blanc garde son fond si « Noir » est cité en premier | Analyser chaque couleur du produit |
| Important | 5. Suivi | Quatre libellés : « Reçue, en attente de production », « En production (x/y prêtes) », « Prête », « En attente de réassort » | Pas de date de fin prévue, pas de mode de remise (retrait ou envoi) ; « Prête » ne dit pas quoi faire ; pas de « Livrée » | Ajouter « Prête : à venir chercher » (ou « Expédiée »), « Livrée » et une date prévisionnelle |
| Important | 5. Suivi | Chaque taille est une carte distincte : 5 tailles = 5 cartes « Commandé le 19 oct. », sans numéro de commande | Impossible de retrouver « ma commande du 19 » ; une commande Shopify #1042 donne aussi des cartes séparées | Regrouper par commande avec un numéro (cartes dépliables) |
| Gênant | 5. Suivi | « Annuler cette ligne » ouvre une confirmation avec les boutons « Annuler / Confirmer » | « Annuler » veut dire ne pas annuler la ligne : très ambigu | Boutons « Garder la ligne » / « Oui, annuler la ligne » |
| Gênant | 3. Visuels, DTF | Question « Le retirer automatiquement ? (Sinon il sera imprimé tel quel) » avec « Annuler / Confirmer » | « Annuler » peut se lire comme abandonner l'envoi du visuel ; « fond proche de la couleur du textile » est technique | Boutons « Retirer le fond » / « Garder le fond » avec aperçu avant / après |
| Gênant | 4. Rupture | Sans saisie de Printtex : « Printtex vous préviendra dès réception ». Ensuite : « textile commandé le …, réception prévue le … · suivi : 6A1… » | Le suivi est un texte brut, sans transporteur ni lien ; on ne sait pas si la date est celle du textile ou de la commande finie | Lien de suivi cliquable, nom du transporteur, « textile attendu chez Printtex le … » |
| Gênant | 4. Rupture (côté Printtex) | Un mail automatique part vers la marque dès qu'un champ est validé (« Textile commandé », « Textile expédié », « Nouveau délai ») | Une faute de frappe dans le suivi ou la date envoie un faux mail sans relecture | Délai d'annulation de quelques minutes, ou bouton explicite « Prévenir la marque » |
| Gênant | 1. Nouveau produit | Couleurs choisies par pastilles et par un champ texte « Couleurs » rempli automatiquement | Double saisie ; on ne sait pas si le texte libre (« Noir et blanc ») est pris en compte | Garder les pastilles, avec une option « autre couleur » |
| Gênant | 1. Nouveau produit | La liste affiche « Chargement des vêtements de printtex.fr… » pendant plusieurs secondes | Sur un réseau mobile on croit le choix vide ; en cas d'échec seul un bref message apparaît | Charger le catalogue dès l'arrivée dans l'espace marque, avec bouton « Réessayer » |
| Gênant | 1. Nouveau produit puis commande | Après « Enregistrer le produit », le formulaire reste ouvert ; le produit n'est pas proposé à la commande tant qu'on ne ferme pas | On ne sait pas s'il faut enchaîner ; risque de saisir deux fois | Après l'enregistrement : « Produit créé, le commander maintenant ? » |
| Gênant | 1. Nouveau produit | Le texte « Seuls les modèles déjà réalisés chez Printtex peuvent être commandés ici » côtoie le bouton « + Nouveau produit » | Contradictoire : on crée un produit mais on ne sait pas s'il est commandable | Expliquer : produit créé = en attente de validation Printtex (statut visible) + lien de rendez-vous |
| Gênant | 3. Visuels | « Taille d'impression » : emplacement + largeur en cm ; la hauteur est calculée ; la largeur vide est refusée | Une marque ne sait pas quelle largeur choisir ; pas de repère ni d'aperçu sur le vêtement | Tailles types (cœur 8 cm, A4, A3) et aperçu sur le vêtement |
| Gênant | 6. Téléphone | Boutons « + » d'ajout de visuel de 20 px, case « Afficher les commandes déjà faites » de 13 px, « Déconnexion » de 31 px | Difficile à toucher au doigt (44 px recommandés) | Agrandir les zones de toucher |
| Gênant | 5. Suivi | Commandes terminées masquées par défaut ; les nouvelles commandes arrivent en bas de la liste | On perd de vue ce qui est prêt à récupérer ; pas de tri | « Prêtes » en haut, tri du plus récent au plus ancien |
| Détail | 1. Commande | Pas de champ « Date souhaitée » ni « Remarque » à la commande | La marque ne peut pas dire « urgent pour le 30 » | Ajouter ces deux champs |
| Détail | 3. Visuels | Une carte sans image affiche seulement « Visuel » en petit | Pas clair que Printtex attend un fichier | Libellé « Ajouter votre visuel » |
| Détail | 2. Shopify | La case « Fabriqué chez Printtex » est répétée par produit, sans recherche ni « tout cocher » | Fastidieux avec une grande boutique | Recherche et sélection multiple |
| Détail | 4. Rupture (côté Printtex) | Le texte « Seuls les modèles déjà réalisés… » apparaît aussi en vue Printtex | Message pour les marques, sans objet pour l'admin | Le masquer en vue admin |

## Ce qui marche bien

- Protection des données correcte (403 sans connexion) et vue marque bien limitée (ni facturation, ni autres marques, ni boutons d'avancement).
- Choix du vêtement en photos et pastilles de couleurs : simple et visuel ; ajout de produit puis commande aboutissent.
- Visuels : retrait du fond blanc sur textile blanc, rognage au plus près, question DTF, demande d'emplacement et de largeur en cm.
- Shopify de démonstration : le Mug non coché n'arrive pas, les commandes arrivent avec l'emplacement et le numéro #, une 2e récupération ne crée pas de doublon.
- Téléphone : pas de défilement horizontal ; barre de progression et statut clair par carte.
