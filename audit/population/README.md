# Population simulée de Printtex (calibrée sur des données réelles)

`modele.py` simule tous les acheteurs potentiels d'Île-de-France sur un an, segment par segment.
Une simulation d'achat est tirée pour chaque visiteur simulé. Aucune donnée personnelle : uniquement des comptages agrégés.

## Ce qui est réel
- **Printtex (Shopify, depuis 07/2024)** : 712 clients, 801 commandes, 38 894 €. 8,8 % de clients qui reviennent, 48 % de retraits à l'atelier, 63 % de visites sur téléphone. Achat : 0,9 % sur téléphone, 1,9 % sur ordinateur.
- **12 derniers mois** : 449 commandes, environ 20 100 €, 79 % d'une seule pièce, aucune de plus de 5 pièces.
- **Marques** : 84 marques actives, environ 21 commandes par semaine (outil de gestion).
- **Taille des marchés (sources publiques)** :
  - Clubs sportifs en Île-de-France : 19 186 clubs, 2,6 M de licences (INJEP 2024, via la CCI Paris Île-de-France).
  - Associations à Paris : environ 75 000 actives (Ville de Paris, Recherches & Solidarités).
  - Entreprises artisanales en Île-de-France : 332 000, dont 116 200 dans le bâtiment et 23 240 dans l'alimentation (CRMA Île-de-France 2024).
  - Établissements d'enseignement supérieur à Paris : 960 (Apur / DRIEAT).
  - Population de l'Île-de-France : environ 12,3 M d'habitants (INSEE).

## Ce qui est une hypothèse (à affiner avec de vraies mesures)
- La part de chaque marché qui achète du textile personnalisé dans l'année (`p_an`).
- La part qui trouve Printtex (`atteignables`). Elle est calée pour retrouver les ventes réelles d'aujourd'hui.
- La probabilité d'acheter une fois sur le site, avant et après corrections. Elle vient de l'audit par agents (`docs/audit-clientele-simulee.md`).

## Contrôle
Modèle « aujourd'hui » : environ 407 commandes, contre 449 dans la réalité. Le chiffre d'affaires varie selon les grosses commandes de groupe tirées au hasard.

## Comment l'améliorer
1. Remplacer les hypothèses par des mesures : essais A/B (`site-ab/`), suivi des devis, Google Ads.
2. Ajouter les ventes hors Shopify (devis payés par virement, marques) pour avoir le vrai chiffre total.
3. Ajouter des segments avec des sources publiques : entreprises, écoles primaires et collèges, mariages (INSEE).
