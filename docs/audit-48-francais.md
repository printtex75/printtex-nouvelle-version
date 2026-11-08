# 48 Français ordinaires sur printtex.fr (08/11/2026)

Ce sont des personnes **fictives**, tirées d'une population de 20 000 adultes générée à partir des statistiques publiques (`audit/population/humains.py`) : âge, métier, salaire INSEE, foyer, loisirs, événements de vie.
48 d'entre elles ont un besoin de textile personnalisé. Chacune a été jouée par un agent dans un vrai navigateur (30 sur téléphone, 18 sur ordinateur), sans aller jusqu'au panier.
Le détail visite par visite est dans `audit/population/visites-48.jsonl`. Ce sont des **simulations** : elles servent à classer les problèmes, pas à mesurer les ventes.

## Décisions
| Décision | Personnes |
|---|---|
| Commande en ligne | 18 |
| Devis | 15 |
| Appel | 5 |
| Abandon | 10 |

Probabilité moyenne de commander en ligne : 44 %.

## Le salaire change tout
| Salaire net | Personnes | Proba. de commander | Commandes | Abandons |
|---|---|---|---|---|
| Sans revenu (étudiants…) | 7 | 29 % | 0 | 4 |
| Moins de 1 500 € | 9 | 33 % | 1 | 3 |
| 1 500 à 2 500 € | 16 | 43 % | 7 | 2 |
| 2 500 à 4 000 € | 5 | 54 % | 5 | 0 |
| 4 000 € et plus | 11 | 57 % | 5 | 1 |

- **Sous 1 500 €** : on part ou on demande un devis. « 115 € pour 6 t-shirts, c'est presque une semaine de courses. »
- **Pour un groupe** : le salaire décide surtout **qui avance l'argent**. Le salarié à 1 030 € refuse d'avancer 992 € pour le club, il lui faut un devis payé par la structure.
- **Au-dessus de 3 000 €** : le prix ne compte presque plus. Ce qui compte, c'est la qualité, la date garantie et le temps passé.
- **Groupes (15 personnes)** : 11 sur 15 finissent en **devis**. Une seule commande en ligne.
- **65 ans et plus** : 3 sur 4 **appellent**. « Trop de boutons et de petits panneaux sur mon téléphone. »

## Frictions (nombre de mentions sur les 48 visites)
1. **Prix plus haut qu'annoncé (42)** : « dès 20 € » et « dès 12 € » ne valent que pour le blanc. L'outil s'ouvre en noir à 25 € (pour 8 pièces : 151 € en noir contre 111 € en blanc). Les pastilles de couleur n'affichent pas de prix.
2. **Commande d'équipe déroutante (environ 20)** : exemple de foot « MARTIN 10 » mis d'office au dos, prix qui passe en face + dos, quantités perdues, bouton « Ajouter l'équipe au panier » en noir sur fond noir.
3. **Alerte « Qualité : trop faible » (20)**, sans solution proposée. Les images de test étaient petites, l'alerte est donc peut-être en partie justifiée.
4. **Sur téléphone, les panneaux cachent le vêtement (15)**, et l'aperçu final ne montre ni le total ni les tailles.
5. **Pas de prix pour sa quantité (15)** : la page tarifs ne montre que 1 pièce et 51 à 100 pièces.
6. **Surcoût du dos ou du nom non annoncé (13)** : par exemple 18 € qui deviennent 22 €, ou 25 € qui deviennent 35 €.

## Défauts nouveaux, vus en vrai
- **50 t-shirts coûtent 657 €, 51 en coûtent 620 €** : un t-shirt de plus fait baisser la facture.
- **Body bébé** : pas de prix, le bouton mène à un devis où le body n'est pas proposé, et l'article sur les naissances dit « nous n'imprimons pas de bodies ». Les 2 jeunes parents abandonnent.
- Le modèle « Reine du jour » est écrit en noir sur un t-shirt noir.
- Les modèles restent bloqués sur « Chargement des modèles… » sur téléphone (plus de 15 secondes).
- La recherche « evjf » ne trouve aucun produit.
- En commande d'équipe sur ordinateur, un bouton noir s'affiche sans texte.
- Une couleur choisie revient au blanc quand on change de produit.
- Logo foncé invisible sur le noir, sans avertissement.

## Où partent ceux qui abandonnent
Plateformes à bas prix (Temu, Amazon, Vistaprint, Spreadshirt), Etsy (créatrices de bodies), loisirs créatifs (transfert à repasser), boutique photo près de chez soi.

## Ce que ça confirme et ajoute à l'audit
- **Ouvrir sur le blanc à 20 €** (déjà demandé) est la correction la plus citée, de loin.
- **Afficher le prix réel au moment du choix** : couleur, dos, nom et numéro.
- **Groupes** : un devis en PDF tout de suite, et la commande où chacun paie sa part.
- **Petits budgets** : mettre en avant le blanc, le retrait gratuit et le partage du prix entre participants.
- **Seniors** : un numéro d'appel bien visible et un mode simple.
