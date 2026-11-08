# Populations simulées pour l'audit de printtex.fr

## 1. `humains.py` : des Français ordinaires (le cœur de la méthode)
Le script génère des milliers d'adultes **fictifs mais réalistes**, tirés des statistiques publiques et pas des clients Printtex. Chacun a un prénom adapté à sa génération, un âge, un lieu de vie, une situation (en emploi, étudiant, retraité, sans emploi), un métier, un salaire, un foyer, des loisirs (club, bénévolat, BDE) et des événements dans l'année (mariage, naissance, deuil, anniversaire, réunion de famille, séminaire…). Ses besoins de textile personnalisé en découlent, et on simule son passage sur printtex.fr.

Lancer : `python3 audit/population/humains.py 20000`

Sources :
- **Population** : 68,6 M d'habitants (INSEE, 2025).
- **Catégories socioprofessionnelles** : INSEE, Enquête Emploi 2024.
- **Salaires nets** : INSEE, secteur privé 2023. 10 % gagnent moins de 1 512 €, la moitié moins de 2 183 €, 10 % plus de 4 300 €.
- **Événements de 2024** : 247 000 mariages, 660 787 naissances, 646 000 décès (INSEE).
- **Sport et associations** : INJEP 2024, Ville de Paris.

Hypothèses à affiner :
- l'écart de salaire selon le métier et le lieu de vie ;
- la fréquence de certains événements (enterrement de vie, cadeau, séminaire) ;
- la part de ces événements qui donne lieu à du textile personnalisé ;
- la probabilité de commander une fois sur le site, issue de l'audit par agents.

Les personnes sont **fictives** : aucune ne correspond à quelqu'un de réel.

## 2. `modele.py` : contrôle par marché (Île-de-France)
Ce modèle sert de garde-fou. Il vérifie, marché par marché, que les ordres de grandeur restent compatibles avec les ventes réelles du site (449 commandes, environ 20 100 € sur 12 mois).

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
