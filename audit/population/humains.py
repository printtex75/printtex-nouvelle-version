"""Population de Français « lambda » générée à partir de statistiques publiques (pas des clients Printtex).
Chaque humain a un âge, une situation, un métier (CSP), un salaire, un foyer, un lieu, des loisirs
et des événements de vie dans l'année. On en déduit s'il a besoin de personnaliser un textile, pourquoi,
avec quel budget, puis ce qui se passe s'il tombe sur printtex.fr (probabilités issues de l'audit par agents).
Personnes FICTIVES : aucune ne correspond à quelqu'un de réel.
Lancer : python3 audit/population/humains.py [nombre] (défaut 10 000)
"""
import random, math, sys, json, collections
random.seed(68_600_000)
N = int(sys.argv[1]) if len(sys.argv) > 1 else 10_000

# ---------- Sources publiques (arrondies) ----------
# Population : 68,6 M (INSEE, 1er janv. 2025) ; Île-de-France ~12,3 M (18 %).
# CSP des personnes en emploi 2024 (INSEE, Enquête Emploi) : cadres 23,0 %, prof. intermédiaires 25,2 %,
#   employés 24,8 %, ouvriers 18,0 %, artisans/commerçants/chefs d'entreprise 6,8 %, agriculteurs 1,3 %.
# Salaires nets mensuels EQTP privé 2023 (INSEE) : D1 ≈ 1 512 €, médiane ≈ 2 183 €, D9 ≈ 4 300 €.
# 2024 (INSEE) : 247 000 mariages, 660 787 naissances, 646 000 décès.
# Sport : ~2,6 M licences pour ~12 M d'habitants en IDF (INJEP 2024 via CCI) → ~21 % ; Paris : ~650-710 k bénévoles pour 2,1 M hab.
AGES = [((18,24),0.10),((25,34),0.15),((35,44),0.16),((45,54),0.16),((55,64),0.16),((65,79),0.19),((80,90),0.08)]  # ≈ pyramide INSEE adultes, arrondie
CSP = [("cadre",0.230,1.75),("profession intermédiaire",0.252,1.05),("employé",0.248,0.80),("ouvrier",0.180,0.82),
       ("artisan / commerçant / chef d'entreprise",0.068,1.10),("agriculteur",0.013,0.75)]
MED, D1, D9 = 2183, 1512, 4300
SIG = (math.log(D9) - math.log(D1)) / (2 * 1.2816)  # loi log-normale ajustée sur D1/D9
LIEUX = [("Paris",0.031),("petite couronne",0.068),("grande couronne",0.081),("grande ville de province",0.25),("ville moyenne",0.30),("village / rural",0.27)]
METIERS = {  # (masculin, féminin)
 "cadre": [("ingénieur informatique","ingénieure informatique"),("chef de projet marketing","cheffe de projet marketing"),("médecin","médecin"),("avocat","avocate"),("directeur d'agence","directrice d'agence"),("responsable RH","responsable RH")],
 "profession intermédiaire": [("infirmier","infirmière"),("professeur des écoles","professeure des écoles"),("technicien de maintenance","technicienne de maintenance"),("éducateur sportif","éducatrice sportive"),("assistant social","assistante sociale"),("commercial","commerciale")],
 "employé": [("vendeur","vendeuse"),("aide-soignant","aide-soignante"),("agent d'accueil","agente d'accueil"),("secrétaire médical","secrétaire médicale"),("caissier","caissière"),("agent de sécurité","agente de sécurité")],
 "ouvrier": [("chauffeur-livreur","chauffeuse-livreuse"),("maçon","maçonne"),("cariste","cariste"),("boulanger salarié","boulangère salariée"),("plombier salarié","plombière salariée"),("agent de propreté","agente de propreté")],
 "artisan / commerçant / chef d'entreprise": [("plombier à son compte","plombière à son compte"),("gérant de boulangerie","gérante de boulangerie"),("coiffeur","coiffeuse"),("patron de bar","patronne de bar"),("paysagiste","paysagiste"),("fleuriste","fleuriste"),("fondateur d'une start-up","fondatrice d'une start-up")],
 "agriculteur": [("maraîcher","maraîchère"),("éleveur","éleveuse")],
}
# Prénoms courants selon la génération (fichier des prénoms INSEE, choix illustratif)
PRENOMS = {
 "F": [(1940, ["Monique","Jacqueline","Françoise","Josiane","Fatima","Danielle"]), (1960, ["Isabelle","Nathalie","Sylvie","Catherine","Malika","Véronique"]),
       (1980, ["Julie","Aurélie","Sophie","Nadia","Céline","Aïcha","Stéphanie"]), (1995, ["Camille","Léa","Sarah","Inès","Manon","Chloé","Amina","Fatou"]),
       (2010, ["Emma","Jade","Lina","Yasmine","Louise","Maëlys"])],
 "H": [(1940, ["Michel","Jean","Bernard","Gérard","Mohamed","André"]), (1960, ["Philippe","Christophe","Pascal","Thierry","Rachid","Patrick"]),
       (1980, ["Julien","Nicolas","Karim","Sébastien","Mehdi","Kevin","Jérôme"]), (1995, ["Lucas","Thomas","Hugo","Yanis","Théo","Moussa","Ibrahima"]),
       (2010, ["Nathan","Adam","Rayan","Gabriel","Noah","Léo"])],
}
def prenom(femme, age):
    an = 2026 - age
    for limite, liste in reversed(PRENOMS["F" if femme else "H"]):
        if an >= limite: return random.choice(liste)
    return random.choice(PRENOMS["F" if femme else "H"][0][1])

def tirer(liste):
    r, a = random.random(), 0
    for x, p in liste:
        a += p
        if r < a: return x
    return liste[-1][0]

def humain(i):
    femme = random.random() < 0.52
    age = random.randint(*tirer(AGES))
    lieu = tirer([(l, p) for l, p in LIEUX])
    if age < 25 and random.random() < 0.55: statut = "étudiant"
    elif age >= 63 and random.random() < 0.85: statut = "retraité"
    elif age < 65 and random.random() < 0.075: statut = "sans emploi"
    elif age >= 63: statut = "retraité"
    else: statut = "en emploi"
    csp = metier = None; salaire = 0
    if statut == "en emploi":
        r, a = random.random() * sum(p for _, p, _ in CSP), 0
        for nom, p, m in CSP:
            a += p
            if r < a: csp, mult = nom, m; break
        metier = random.choice(METIERS[csp])[1 if femme else 0]
        salaire = round(math.exp(math.log(MED * mult) + random.gauss(0, SIG * 0.8)) / 10) * 10
        if lieu == "Paris": salaire = int(salaire * 1.25)
        elif lieu == "petite couronne": salaire = int(salaire * 1.10)
    elif statut == "retraité": salaire = round(random.gauss(1650, 600) / 10) * 10
    elif statut == "étudiant": salaire = random.choice([0, 0, 450, 700, 900])
    else: salaire = random.choice([600, 900, 1100])
    salaire = max(0, salaire)
    en_couple = age >= 25 and random.random() < 0.62
    enfants = 0 if age < 25 else random.choice([0, 0, 1, 1, 2, 2, 2, 3])
    # loisirs et engagements
    sport = random.random() < (0.30 if age < 35 else 0.20 if age < 60 else 0.12)
    parent_club = enfants > 0 and age < 58 and random.random() < 0.45
    benevole = random.random() < (0.30 if lieu == "Paris" else 0.22)
    bde = statut == "étudiant" and random.random() < 0.15
    # événements de vie dans l'année (taux INSEE 2024 convertis par adulte, amis et famille inclus)
    ev = []
    if 25 <= age <= 45 and random.random() < 0.010: ev.append("se marie")
    if 22 <= age <= 45 and random.random() < 0.05: ev.append("organise l'enterrement de vie de jeune fille ou de garçon d'un proche")
    if 25 <= age <= 45 and random.random() < 0.025: ev.append("attend un bébé")
    if random.random() < 0.06: ev.append("perd un proche")
    if age in (29, 39, 49, 59, 69) or random.random() < 0.04: ev.append("a un anniversaire important à fêter")
    if random.random() < 0.03: ev.append("organise une grande réunion de famille")
    if statut == "en emploi" and csp in ("cadre", "profession intermédiaire") and random.random() < 0.08: ev.append("organise un séminaire d'équipe")
    if csp == "artisan / commerçant / chef d'entreprise" and random.random() < 0.15: ev.append("veut habiller son équipe à son logo")
    if random.random() < 0.10: ev.append("cherche un cadeau original")
    return dict(id=i, femme=femme, prenom=prenom(femme, age), age=age, lieu=lieu, statut=statut,
                csp=csp, metier=metier, salaire_net=salaire, en_couple=en_couple, enfants=enfants, sport=sport,
                parent_club=parent_club, benevole=benevole, bde=bde, evenements=ev,
                telephone=random.random() < (0.80 if age < 35 else 0.65 if age < 55 else 0.45))

# Besoins de textile personnalisé (pièces, budget habituel du marché) déclenchés par la vie de la personne
def besoins(h):
    b = []
    e = h["evenements"]
    if "organise l'enterrement de vie de jeune fille ou de garçon d'un proche" in e: b.append(("EVJF/EVG", random.randint(5, 12), "particulier"))
    if "se marie" in e and random.random() < 0.25: b.append(("mariage (tote bags, t-shirts témoins)", random.randint(8, 40), "particulier"))
    if "attend un bébé" in e and random.random() < 0.20: b.append(("annonce de naissance / body", random.randint(1, 3), "particulier"))
    if "perd un proche" in e and random.random() < 0.04: b.append(("t-shirts hommage", random.randint(15, 80), "urgent"))
    if "a un anniversaire important à fêter" in e and random.random() < 0.15: b.append(("anniversaire", random.randint(1, 15), "particulier"))
    if "organise une grande réunion de famille" in e and random.random() < 0.30: b.append(("cousinade", random.randint(20, 80), "groupe"))
    if "cherche un cadeau original" in e and random.random() < 0.20: b.append(("cadeau personnalisé", 1, "particulier"))
    if "organise un séminaire d'équipe" in e and random.random() < 0.30: b.append(("séminaire d'entreprise", random.randint(20, 120), "entreprise"))
    if "veut habiller son équipe à son logo" in e: b.append(("tenues de travail à son logo", random.randint(3, 15), "pro"))
    if (h["sport"] or h["parent_club"]) and random.random() < 0.04: b.append(("tenues du club (bénévole qui s'en occupe)", random.randint(15, 60), "groupe"))
    if h["benevole"] and random.random() < 0.03: b.append(("t-shirts de l'association", random.randint(10, 100), "groupe"))
    if h["bde"] and random.random() < 0.30: b.append(("sweats de promo BDE", random.randint(50, 200), "groupe"))
    return b

# Ce qui se passe sur printtex.fr (estimations de l'audit par agents, docs/audit-clientele-simulee.md)
CONV = {"particulier": 0.45, "urgent": 0.45, "groupe": 0.10, "entreprise": 0.20, "pro": 0.10}
PRIX = {"particulier": 18, "urgent": 13, "groupe": 15, "entreprise": 38, "pro": 30}  # € par pièce, grille Printtex

def histoire(h, besoin=None):
    il = "elle" if h["femme"] else "il"
    ou = {"Paris": "à Paris", "petite couronne": "en proche banlieue parisienne", "grande couronne": "en grande banlieue parisienne", "grande ville de province": "dans une grande ville de province", "ville moyenne": "dans une ville moyenne", "village / rural": "à la campagne"}[h['lieu']]
    s = f"{h['prenom']}, {h['age']} ans, vit {ou}. "
    if h["statut"] == "en emploi": s += f"{il.capitalize()} est {h['metier']} et gagne environ {h['salaire_net']:,} € net par mois. ".replace(',', ' ')
    elif h["statut"] == "retraité": s += f"{il.capitalize()} est à la retraite ({h['salaire_net']:,} € par mois). ".replace(',', ' ')
    elif h["statut"] == "étudiant": s += f"{il.capitalize()} est étudiant{'e' if h['femme'] else ''}" + (f", avec un job à {h['salaire_net']} € par mois. " if h['salaire_net'] else ", sans revenu. ")
    else: s += f"{il.capitalize()} cherche du travail. "
    enf = {1: "un enfant", 2: "deux enfants", 3: "trois enfants"}.get(h["enfants"], "")
    if h["age"] >= 58:
        s += (f"{'En couple' if h['en_couple'] else 'Seul' + ('e' if h['femme'] else '')}, {enf.replace('un enfant','un enfant adulte').replace('enfants','enfants adultes')}. " if h["enfants"]
              else ("En couple. " if h["en_couple"] else ""))
    elif h["en_couple"]: s += f"En couple, avec {enf}. " if h["enfants"] else "En couple, sans enfant. "
    elif h["enfants"]: s += f"{il.capitalize()} élève seul{'e' if h['femme'] else ''} {enf}. "
    loisirs = [x for x, ok in (("fait du sport en club", h["sport"]), ("accompagne ses enfants au club", h["parent_club"]), ("est bénévole dans une association", h["benevole"]), ("est au BDE de son école", h["bde"])) if ok]
    if loisirs: s += f"{il.capitalize()} " + ", ".join(loisirs) + ". "
    if h["evenements"]: ev = h["evenements"]; s += "Cette année, " + il + " " + (", ".join(ev[:-1]) + " et " + ev[-1] if len(ev) > 1 else ev[0]) + ". "
    if besoin: s += f"Son besoin : {besoin[0]}, environ {besoin[1]} pièce{'s' if besoin[1] > 1 else ''}. "
    return s

if __name__ == "__main__":
    pop = [humain(i) for i in range(N)]
    avec = [(h, b) for h in pop for b in besoins(h)]
    print(f"Population générée : {N:,} Français adultes (fictifs, statistiques publiques)".replace(',', ' '))
    print(f"Ont un besoin de textile personnalisé dans l'année : {len({h['id'] for h, _ in avec}):,} ({len({h['id'] for h, _ in avec})/N:.1%}), {len(avec):,} besoins".replace(',', ' '))
    par = collections.Counter(b[0] for _, b in avec)
    print("\nBesoins (pour 10 000 adultes) :")
    for k, v in par.most_common(): print(f"  {k:45} {v/N*10000:6.0f}")
    # Budget vs salaire : un t-shirt à 20 € pèse plus lourd pour un petit salaire
    print("\nSalaire net médian de ceux qui ont un besoin : "
          f"{sorted(h['salaire_net'] for h, _ in avec)[len(avec)//2]:,} € ; sur téléphone : {sum(h['telephone'] for h, _ in avec)/len(avec):.0%}".replace(',', ' '))
    # Visite simulée : chacun tire au sort s'il commande sur printtex.fr (conversion de l'audit, freinée si petit budget)
    ventes = collections.Counter(); ca = collections.Counter()
    for h, (nom, pieces, typ) in avec:
        p = CONV[typ] * (0.7 if h["telephone"] else 1.0)
        if typ == "particulier" and h["salaire_net"] < 1200: p *= 0.7
        if random.random() < p:
            ventes[typ] += 1; ca[typ] += pieces * PRIX[typ]
    print("\nSi tous ces gens arrivaient sur printtex.fr aujourd'hui :")
    for t in CONV: print(f"  {t:12} commandes {ventes[t]:5}  CA {ca[t]:>9,} €".replace(',', ' '))
    print(f"  Taux de commande global : {sum(ventes.values())/len(avec):.0%}")
    # Exemples d'histoires
    print("\nExemples d'humains de la population :")
    random.seed(7)
    for h, b in random.sample(avec, 8): print(" - " + histoire(h, b))
    json.dump([dict(h, besoins=[list(x) for x in besoins(h)], histoire=histoire(h)) for h in pop[:500]],
              open("/tmp/claude-0/pop/humains-echantillon.json", "w"), ensure_ascii=False, indent=1)
