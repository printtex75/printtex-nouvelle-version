"""Population simulée de Printtex, calibrée sur des données réelles (08/11/2026).
Aucune donnée personnelle : seulement des comptages agrégés.
- RÉEL (Shopify, Firestore) : clients, commandes, panier, appareils, retrait, saisonnalité.
- RÉEL (sources publiques) : taille des marchés en Île-de-France.
- HYPOTHÈSE (à affiner) : part qui achète du textile personnalisé dans l'année, part que Printtex peut capter,
  et probabilité d'achat après visite (tirée de l'audit par agents, docs/audit-clientele-simulee.md).
Lancer : python3 audit/population/modele.py
"""
import random, statistics as st
random.seed(2026)

# ---------- Données réelles Printtex ----------
REEL = dict(clients_depuis_07_2024=712, commandes=801, ventes_eur=38894, taux_retour=0.088,
            part_retrait_atelier=388/801, part_mobile=0.63, conv_mobile=0.009, conv_ordi=0.019,
            marques_actives=84, commandes_marques_sem=21.5)
SAISON = {1:35,2:42,3:32,4:24,5:13,6:29,7:23,8:24,9:30,10:90,11:52,12:77}  # commandes/mois (2026, déc. = 2025)

# ---------- Segments : taille réelle du marché (source) + hypothèses ----------
# acheteurs = pool × p_an (part qui achète du textile perso dans l'année, HYPOTHÈSE)
# atteignables = part qui peut trouver Printtex (Google, bouche-à-oreille, proximité) — HYPOTHÈSE
# conv_actuelle / conv_corrigee = proba d'acheter une fois sur le site, avant / après corrections (AUDIT)
SEG = [
 # nom, pool, source, p_an, atteignables, panier_moyen, conv_actuelle, conv_corrigee
 # Calibrage (08/11/2026) : sur les 12 derniers mois réels, le site a fait 449 commandes pour ~20 100 €,
 # presque toutes de particuliers (79 % d'une seule pièce, aucune > 5 pièces) : les groupes n'achètent
 # quasiment pas en ligne aujourd'hui (conv_actuelle très basse), ils passent par le devis ou ailleurs.
 ("Particuliers IDF (cadeau, EVJF, fête)", 9_500_000, "INSEE : ~12,3 M hab. IDF, ~9,5 M adultes", 0.03, 0.0031, 42, 0.45, 0.60),
 ("Clubs sportifs IDF",                    19_186,  "INJEP 2024 via CCI Paris IDF : 19 186 clubs",  0.40, 0.03, 600, 0.02, 0.25),
 ("Associations Paris",                    75_000,  "Ville de Paris : ~75 000 associations actives",  0.05, 0.03, 400, 0.05, 0.30),
 ("Artisans du bâtiment IDF",              116_200, "CRMA IDF 2024 : 116 200 entreprises",           0.10, 0.01, 300, 0.03, 0.25),
 ("Commerces alimentaires IDF",            23_240,  "CRMA IDF 2024 : 23 240 entreprises",            0.08, 0.02, 250, 0.30, 0.45),
 ("Établissements sup. Paris (BDE)",       960,     "Apur/DRIEAT : 960 établissements à Paris",      0.60, 0.05, 3000, 0.02, 0.30),
]

def simuler(n_annees=1, corrige=False):
    lignes = []
    for nom, pool, src, p_an, att, panier, c0, c1 in SEG:
        conv = c1 if corrige else c0
        acheteurs = pool * p_an * n_annees
        visiteurs = acheteurs * att
        # tirage individuel : chaque visiteur simulé achète ou non (population réelle de taille "visiteurs")
        n = int(visiteurs)
        ventes = sum(1 for _ in range(n) if random.random() < conv)
        paniers = [max(10, random.gauss(panier, panier * 0.5)) for _ in range(ventes)]
        lignes.append((nom, int(acheteurs), n, ventes, sum(paniers)))
    return lignes

def table(titre, lignes):
    print(f"\n{titre}")
    print(f"{'Segment':40} {'Acheteurs/an':>13} {'Visitent':>9} {'Achètent':>9} {'CA (€)':>10}")
    for nom, a, v, s, ca in lignes:
        print(f"{nom:40} {a:>13,} {v:>9,} {s:>9,} {ca:>10,.0f}".replace(',', ' '))
    print(f"{'TOTAL':40} {sum(l[1] for l in lignes):>13,} {sum(l[2] for l in lignes):>9,} {sum(l[3] for l in lignes):>9,} {sum(l[4] for l in lignes):>10,.0f}".replace(',', ' '))

if __name__ == '__main__':
    print("Population simulée calibrée sur données réelles — hypothèses à affiner")
    a = simuler(corrige=False); table("AUJOURD'HUI (site actuel)", a)
    b = simuler(corrige=True);  table("APRÈS CORRECTIONS (audit A+B+C1)", b)
    print("\nContrôle (réel, 12 derniers mois Shopify) : 449 commandes, ~20 100 €. "
          f"Modèle « aujourd'hui » : {sum(l[3] for l in a)} commandes, {sum(l[4] for l in a):,.0f} €.".replace(',', ' '))
