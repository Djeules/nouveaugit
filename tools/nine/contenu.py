# Contenu du business plan « Nine, un coin de neuf ».
#
# Source unique : build.py en tire le PDF (charte des « 100 prompts »), le HTML
# importé en Google Doc et les lignes du Google Sheet de suivi. On corrige ici,
# jamais dans les fichiers produits.

from datetime import date

TITRE = "Nine, un coin de neuf"
SOUS_TITRE = "Business plan et feuille de route jusqu'au lancement de janvier 2027."
EDITION = "30 octobre 2026"

# --- Hypothèses de calcul -----------------------------------------------------------------
# Toutes sont des hypothèses, sauf le taux de cotisation (sources en fin de document).

PRIX_HEURE = 50            # € facturés au client, décidé
COTISATIONS = 0.212        # micro-entreprise, prestations de services BIC, 2026
SEMAINES_PAR_MOIS = 4      # hypothèse : congés et creux compris
DUREE_MOYENNE = 3          # h par intervention, hypothèse (mélange Un coin / Une pièce)
DEPLACEMENT = 10           # € par intervention, hypothèse (carburant et usure, ~30 km)
FIXES_MOIS = 70            # € par mois, hypothèse (assurance, logiciel, téléphone, banque)
OBJECTIF_NET = 4000        # € par mois, objectif de Nine


def revenu(heures_semaine):
    ca = heures_semaine * SEMAINES_PAR_MOIS * PRIX_HEURE
    cotis = ca * COTISATIONS
    interventions = heures_semaine * SEMAINES_PAR_MOIS / DUREE_MOYENNE
    dep = interventions * DEPLACEMENT
    return {
        "h": heures_semaine,
        "ca": ca,
        "cotis": cotis,
        "dep": dep,
        "net": ca - cotis - dep - FIXES_MOIS,
        "interventions": interventions,
    }


SCENARIOS = [revenu(h) for h in (10, 15, 20, 25, 28, 30)]

# Heures facturées par semaine pour atteindre l'objectif.
_marge_par_heure = SEMAINES_PAR_MOIS * (PRIX_HEURE * (1 - COTISATIONS) - DEPLACEMENT / DUREE_MOYENNE)
HEURES_OBJECTIF = (OBJECTIF_NET + FIXES_MOIS) / _marge_par_heure

# Montée en charge de l'année 1 (heures facturées par semaine, hypothèse).
MONTEE = [
    ("Janvier", 6), ("Février", 8), ("Mars", 10), ("Avril", 12), ("Mai", 14), ("Juin", 16),
    ("Juillet", 14), ("Août", 10), ("Septembre", 18), ("Octobre", 20), ("Novembre", 22), ("Décembre", 22),
]
CA_ANNEE_1 = sum(h for _, h in MONTEE) * SEMAINES_PAR_MOIS * PRIX_HEURE
NET_ANNEE_1 = sum(revenu(h)["net"] for _, h in MONTEE)

SEUIL_TVA = 37500
SEUIL_TVA_MAJORE = 41250


def euros(x):
    return f"{round(x):,} €".replace(",", " ")


# --- En bref ------------------------------------------------------------------------------

EN_BREF = [
    "Nine peut lancer en janvier un service qu'aucun concurrent trouvé autour de Saint-Nazaire et de Nantes "
    "ne propose : un rangement qu'on réserve en trois clics, à prix affiché, sans devis ni diagnostic. Les home "
    "organisers de la région vendent l'inverse, une visite puis un devis, autour de 70 € de l'heure.",
    f"L'objectif de 4 000 € par mois demande environ {round(HEURES_OBJECTIF)} heures facturées par semaine. "
    "C'est un plein temps, trajets en plus. Avec une montée en charge réaliste, l'année 1 donne environ "
    f"{euros(round(NET_ANNEE_1 / 12, -2))} par mois en moyenne, et environ {euros(round(revenu(22)['net'], -2))} "
    "en décembre 2027. 4 000 € est donc l'objectif de l'année 2 : le plan est construit pour l'atteindre, "
    "pas pour le promettre dès janvier.",
    "Le calendrier administratif est le vrai point dur : entreprise, déclaration services à la personne et "
    "avance immédiate doivent être en place avant le 4 janvier, fêtes comprises. La micro-entreprise doit "
    "être créée avant le 13 novembre. Sans avance immédiate, le client paie 50 € de l'heure et récupère la "
    "moitié un an plus tard, et l'argument « deux heures pour 50 € » tombe.",
]

# --- Décisions encore ouvertes ------------------------------------------------------------

DECISIONS = [
    ("Prix affiché avec ou sans TVA",
     "Au rythme de l'objectif (environ 68 000 € par an), Nine dépasse le seuil de franchise de TVA (37 500 €). "
     "Les services à la personne passent alors à 10 %.",
     "Afficher 50 € TTC au lancement. L'année 1 reste sous le seuil (hypothèse : environ "
     f"{euros(CA_ANNEE_1)}). Décider du prix 2028 quand le chiffre d'affaires cumulé atteint 30 000 €."),
    ("Place de L'Allure et du Verbe",
     "Gardés, c'est décidé. Mais L'Allure n'est pas un service à la personne : pas de crédit d'impôt, "
     "plafond de 30 % du chiffre d'affaires, comptabilité séparée.",
     "Hors des trois clics au lancement. Une page « Nine fait aussi » sur le site, sur demande. "
     "Retirer le parcours complet à 950 € (475 € après crédit d'impôt) : il applique le crédit d'impôt à L'Allure, ce qui est faux."),
    ("Supplément pour l'express sous 48 h",
     "L'intervention sous 48 h est décidée. Reste à savoir si elle coûte plus cher.",
     "Pas de supplément au lancement. Nine garde deux créneaux express libres par semaine, rendus "
     "à la réservation normale 48 h avant s'ils ne sont pas pris."),
    ("Offre de lancement",
     "À 50 € de l'heure, soit 25 € après crédit d'impôt, une remise de plus ne change pas la décision du client.",
     "Pas de remise. Un parrainage : une heure offerte au client qui en amène un autre."),
    ("Intervention filmée",
     "Le site de septembre promet une intervention filmée, accessible au client. "
     "Elle contredit la discrétion promise et pose des questions de données personnelles.",
     "Abandonner. Les photos avant/après, avec accord écrit, suffisent."),
    ("Zone et jours",
     "Saint-Nazaire et Nantes sont à 60 km l'une de l'autre. Les trajets mangent les marges.",
     "Une zone par jour (par exemple Nantes le mardi et le jeudi), rayon de 25 km autour de chaque ville."),
    ("Rémunération de Julien",
     "« À terme, oui. » Julien ne peut pas facturer dans la micro-entreprise de Nine : le marketing n'est pas "
     "un service à la personne.",
     "Julien facture ses prestations à Nine depuis sa propre structure, à partir de trois mois "
     "consécutifs au-dessus de 2 500 € nets pour Nine."),
]

# --- Risques ------------------------------------------------------------------------------

RISQUES = [
    ("Le calendrier administratif",
     "SIRET, déclaration NOVA et avance immédiate en sept semaines, avec les fêtes. Chaque semaine de retard "
     "à la création décale tout. Parade : créer l'entreprise avant le 13 novembre."),
    ("L'objectif de revenu",
     f"4 000 € par mois, c'est {round(HEURES_OBJECTIF)} heures facturées par semaine, soit 35 à 40 heures de "
     "travail avec les trajets, l'administratif et les réseaux. Parade : viser les clients de L'habitude, "
     "qui remplissent le calendrier sans prospection."),
    ("Une seule personne sur le terrain",
     "Nine malade ou en vacances, c'est zéro chiffre d'affaires, et l'express sous 48 h ne tient plus. "
     "Parade : prévoir des CGV qui couvrent le report, et une réserve de trésorerie d'un mois."),
    ("La confusion ménage / rangement",
     "Le client compare avec une femme de ménage, entre 15 et 25 € de l'heure. Parade : une phrase claire "
     "partout, « on range, on ne nettoie pas », et la différence expliquée sur le site."),
    ("Les plateformes à bas prix",
     "Yoojo affiche de l'aide au rangement dès 12 € de l'heure. Parade : ne pas se battre sur le prix, "
     "mais sur le savoir-faire de Nine et la simplicité de la réservation."),
]

# --- Positionnement -----------------------------------------------------------------------

PROMESSE = "Vous réservez. Nine range."
SLOGANS = ["Vous n'aimez pas ranger. Nine, si.", "On range. Vous respirez.", "Rangez moins. Vivez plus.",
           "Ranger, ça se délègue."]

POSITIONNEMENT = [
    ("Pour qui",
     "Tous ceux qui n'ont pas envie de ranger, et qui l'assument. Pas seulement les désordonnés. "
     "Trois familles font vivre l'activité : les parents débordés (les clients réguliers), les "
     "changements de vie (déménagement, séparation, naissance : ponctuels, urgents, panier élevé) et "
     "les seniors, souvent avec leurs enfants qui paient pour eux."),
    ("Ce qu'on vend",
     "Du temps et un espace rangé. Pas une liste de tâches, pas une « transformation de vie ». "
     "Le client réserve un créneau comme il réserverait une femme de ménage, et Nine fait le travail. "
     "Elle ne vient pas lui apprendre à ranger : elle range."),
    ("Ce qui ne se copie pas",
     "Le regard de Nine. La méthode et la rigueur s'apprennent ; voir en deux minutes ce qui ne va pas dans "
     "un placard, et comment il servirait mieux, ne s'apprend pas. C'est le supplément d'âme de l'intervention."),
    ("L'histoire",
     "Un père et sa fille. Nine sur le terrain, Julien derrière : stratégie, marketing, prospection, "
     "administratif, site. Quand ils construisaient des LEGO, tout était carré et symétrique. "
     "C'est toujours le cas."),
    ("Le ton",
     "Simple, direct, pince-sans-rire, dans la veine de Jonas Jonasson : on constate les choses sans "
     "en faire un drame, et le client se reconnaît sans se sentir jugé. Jamais de moquerie, jamais de jargon."),
]

LEXIQUE = [
    ("On dit", "ranger, réserver, un créneau, un coin, une pièce, Nine"),
    ("On évite", "coach, home organiser, désencombrement, transformation, accompagnement, bien-être"),
    ("Exemples", "« Le placard ne va pas se ranger tout seul. On a vérifié. » · "
                 "« Deux heures. Un placard. De votre côté, il suffit d'ouvrir la porte. »"),
]

# --- Concurrence --------------------------------------------------------------------------
# Prix tels que publiés, relevés le 30 octobre 2026. Les pages ont des âges variables :
# vérifier avant toute comparaison publique. Ne jamais nommer un concurrent en public.

CONCURRENTS = [
    ("Bree Van de Cool", "Nantes, Loire-Atlantique, jusqu'à Angers et Cholet",
     "Dès 70 €/h · ½ journée 280 € · journée 490 € · coaching dès 90 €", "Devis après visite ou photos"),
    ("FREED'Home", "Nantes",
     "70 €/h (sessions de 4 à 6 h) · 60 €/h en accompagnement long · ½ journée 250 € · journée 420 €", "Sessions longues"),
    ("Home and Papers", "La Baule",
     "S 180 € (2 h de conseil et diagnostic) · M 240 € (½ journée de 3 h) · L 420 € (2 demi-journées)", "Forfaits, diagnostic d'abord"),
    ("Ozalée", "Saint-Nazaire",
     "Sur devis · atelier collectif 25 € par personne (prix ancien)", "Tri, feng shui, plans 3D"),
    ("Le Nid Bien Rangé", "Angers", "Non publiés", "Se dit certifiée"),
    ("Sophie Jolivet", "Angers, Cholet, Ancenis, Saumur", "Non publiés", "À contacter"),
    ("Les HOrganisées", "Le Mans (et Île-de-France, Tours, Orléans)",
     "Visite-conseil 160 € · tri sur devis", "Le client applique le plan lui-même"),
    ("Yoojo (plateforme)", "Toute la région",
     "Aide au rangement dès 12 €/h", "Particuliers non spécialisés"),
]

CONCURRENCE_LECTURE = [
    "Tous les home organisers trouvés vendent le même parcours : un appel ou une visite, un diagnostic, "
    "puis un devis. Leurs tarifs tournent autour de 60 à 70 € de l'heure.",
    "Aucun de ceux trouvés ne propose de réserver directement un créneau à prix fixe. C'est la place de Nine.",
    "À 50 € de l'heure, Nine est moins chère que les spécialistes et plus qualifiée que les plateformes. "
    "Avec l'avance immédiate, le client paie 25 € de l'heure.",
    "Non trouvés : Vendée, Sarthe hors Le Mans, presqu'île guérandaise au-delà de La Baule. "
    "À compléter, comme le statut services à la personne de chaque concurrent.",
]

# --- Offres -------------------------------------------------------------------------------

OFFRES = [
    {
        "nom": "Un coin", "vitrine": True,
        "duree": "2 heures",
        "prix": "100 €, soit 50 € après crédit d'impôt",
        "pour": "Un placard, une salle de bain, une entrée, un bureau, une penderie.",
        "inclus": "Tri avec ou sans le client, rangement, étiquetage, coup de chiffon sur ce qui a été vidé, "
                  "sacs « à donner » et « à jeter » préparés, photo avant/après si le client l'accepte.",
        "options": "Heure supplémentaire 50 €. Boîtes et paniers achetés sur demande, au prix d'achat. "
                   "Dépôt en déchetterie : forfait à fixer.",
        "limites": "Pas de ménage, pas de meubles lourds, pas de logement très encombré (les photos permettent de trier en amont).",
    },
    {
        "nom": "Une pièce", "vitrine": True,
        "duree": "Une demi-journée (4 heures)",
        "prix": "200 €, soit 100 € après crédit d'impôt",
        "pour": "Une cuisine, une chambre, une chambre d'enfant, un dressing, un cellier.",
        "inclus": "Tout ce que comprend Un coin, plus la fiche « Votre espace organisé » : où est quoi, "
                  "et comment le garder rangé.",
        "options": "Comme Un coin.",
        "limites": "Comme Un coin. Trois photos obligatoires avant l'intervention, pour vérifier que la pièce tient en 4 heures.",
    },
    {
        "nom": "Toute la maison", "vitrine": False,
        "duree": "Une à plusieurs journées",
        "prix": "Sur devis, à partir de 600 € (300 € après crédit d'impôt)",
        "pour": "Plusieurs pièces, un déménagement, un emménagement.",
        "inclus": "Appel vidéo de 20 minutes, devis sous 48 h, intervention planifiée en une ou plusieurs fois.",
        "options": "Comme Un coin.",
        "limites": "Comme Un coin. Les cartons du déménagement ne sont pas portés par Nine.",
    },
    {
        "nom": "L'habitude", "vitrine": False,
        "duree": "2 heures par mois, le même jour",
        "prix": "100 € par mois, soit 50 € après crédit d'impôt",
        "pour": "Les clients qui ont déjà essayé et ne veulent plus y penser.",
        "inclus": "Le même créneau chaque mois, réservé d'avance. Sans engagement.",
        "options": "Comme Un coin.",
        "limites": "Annulable jusqu'à 48 h avant, comme toutes les offres.",
    },
]

AUTRES_PILIERS = [
    ("Le Verbe", "Cours de français à domicile, oral et écrit. Service à la personne s'il s'agit de soutien "
                 "scolaire ou de cours à domicile : crédit d'impôt possible (TVA de 10 % ou 20 % selon le cas, "
                 "si Nine y est assujettie). Prix à fixer."),
    ("L'Allure", "Conseil vestimentaire, posture. Hors services à la personne : pas de crédit d'impôt, "
                 "30 % du chiffre d'affaires au maximum, comptabilité séparée, dispense à demander sur NOVA. "
                 "Prix à fixer, sans mention de crédit d'impôt."),
]

# --- Parcours -----------------------------------------------------------------------------

PARCOURS = [
    ("Je choisis", "Un coin ou Une pièce, sur la page d'accueil."),
    ("Je réserve", "Un créneau dans le calendrier de Nine, dès 48 h."),
    ("Je confirme", "Nom, adresse, téléphone, conditions acceptées. Rien à payer."),
]

APRES_RESERVATION = [
    ("Tout de suite", "SMS de confirmation, avec un lien pour envoyer trois photos de l'endroit à ranger."),
    ("La veille", "SMS de rappel, et l'heure d'arrivée de Nine."),
    ("Le jour même", "Nine range. Photo avant/après si le client l'a accepté."),
    ("Le lendemain", "Facture par l'avance immédiate : le client valide et paie la moitié."),
    ("Deux jours après", "Demande d'avis."),
    ("Un mois après", "« On revient ? » et la proposition de L'habitude."),
]

LIMITES = [
    ("Ménage", "On range, on ne nettoie pas. Un coup de chiffon sur ce qu'on vient de vider est inclus."),
    ("Urgence", "Réservation instantanée, intervention sous 48 h, sur les créneaux express."),
    ("Meubles lourds", "Hors prestation. Nine déplace ce qu'une personne seule déplace sans risque."),
    ("Déchetterie", "En option payante, forfait à fixer."),
    ("Logements très encombrés", "Refusés. Les photos envoyées à la réservation servent à les repérer."),
    ("Casse", "Couverte par l'assurance responsabilité civile professionnelle, à souscrire avant la première intervention."),
    ("Annulation", "Gratuite jusqu'à 48 h avant. Au-delà, à fixer dans les CGV."),
    ("Samedi", "À trancher avec le calendrier de Nine."),
    ("Durée minimale", "2 heures."),
]

# --- Budget de départ ---------------------------------------------------------------------

BUDGET = [
    ("Assurance RC pro, première année", 150, "Hypothèse : fourchette publiée de 100 à 200 € par an. Trois devis à demander."),
    ("Matériel", 250, "Étiqueteuse et rubans, boîtes et paniers de démonstration, sacs de tri, gants, microfibres, mètre, escabeau pliant, caisse de transport."),
    ("Tenue", 60, "Deux hauts aux couleurs de Nine."),
    ("Impression", 120, "500 cartes de visite, 500 flyers."),
    ("Nom de domaine et adresse e-mail", 20, "Une année."),
    ("Logiciels, trois premiers mois", 90, "Facturation avec avance immédiate et outil de réservation."),
    ("Prestations tests", 60, "Carburant."),
    ("Publicité locale test", 100, "Instagram et Facebook, ciblage 25 km."),
    ("Réserve", 150, "Médiateur de la consommation, imprévus."),
]

# --- Administratif ------------------------------------------------------------------------

ADMIN = [
    ("Statut", "Micro-entreprise au nom de Nine. Prestations de services BIC : cotisations de 21,2 % du "
               "chiffre d'affaires en 2026, plafond du régime 83 600 €."),
    ("ACRE", "Pour une création après le 1er juillet 2026, l'exonération est ramenée à 25 % et doit être "
             "demandée dans les 60 jours. Vérifier que Nine entre dans un des profils éligibles."),
    ("Services à la personne", "Éligibilité vérifiée par Julien (entretien de la maison et travaux ménagers). "
             "La déclaration se fait sur NOVA, une fois le SIRET obtenu."),
    ("Avance immédiate", "Elle s'active avec un logiciel de facturation habilité à l'API Tiers de prestation "
             "de l'Urssaf. Le client n'est prélevé que de la moitié."),
    ("TVA", "Franchise jusqu'à 37 500 € de chiffre d'affaires (seuil majoré 41 250 €). Au-delà, 10 % sur "
            "l'entretien de la maison pour une structure déclarée."),
    ("L'Allure", "Activité accessoire hors services à la personne : 30 % du chiffre d'affaires de l'année "
                 "précédente au maximum, comptabilité séparée, dispense demandée sur NOVA. Pour l'année de "
                 "création, faire confirmer le calcul par la DDETS."),
    ("Assurances", "RC pro avant la première intervention, et usage professionnel du véhicule à faire ajouter."),
    ("Médiateur", "Obligatoire pour vendre aux particuliers : son nom figure dans les CGV."),
    ("Le titre", "« Coach » n'est pas un titre protégé en France, contrairement à ce que disaient nos "
                 "commentaires d'octobre. On l'évite quand même : Nine ne coache pas, elle range."),
]

CGV = [
    "Ce que comprend chaque offre, et ce qu'elle ne comprend pas (ménage, meubles lourds, déchetterie).",
    "Annulation et report, des deux côtés, y compris si Nine est malade.",
    "Casse : déclaration à l'assurance, délai pour la signaler.",
    "Photos : autorisation de prise et autorisation de diffusion, séparées.",
    "Paiement par avance immédiate, et ce qui se passe si le client refuse l'inscription.",
    "Médiateur de la consommation.",
]

# --- Marque et réseaux --------------------------------------------------------------------

MARQUE = [
    ("Charte", "Celle du site de Nine : épurée au maximum. Une seule couleur vive, de la matière (kraft, carton, boîtes)."),
    ("Logo", "Un carré dont un coin change de couleur : le coin de neuf."),
    ("Photos", "Lumière naturelle, cadrage frontal, avant et après pris du même endroit."),
]

CONTENUS = [
    ("Avant / après", "Un tiroir, un placard, une entrée. Même cadrage, même lumière."),
    ("1 tiroir, 1 transformation", "Vidéo accélérée de 15 secondes."),
    ("Ce que Nine ne fera pas", "Les limites, avec humour : le ménage, l'armoire normande, le grenier de 1974."),
    ("Père et fille", "Les coulisses : le matériel, les trajets, les désaccords sur l'étiqueteuse."),
    ("Les avis", "Avec l'accord des clients, jamais inventés."),
]

RESEAUX = (
    "Instagram et TikTok d'abord, Facebook pour les groupes locaux. Trois publications par semaine et des "
    "stories les jours d'intervention. Douze contenus prêts avant le lancement, dont la salle de bain de Nine "
    "en guise d'entraînement. Julien mène la prospection : LinkedIn, agences immobilières, déménageurs, "
    "résidences seniors, conciergeries."
)

# --- Feuille de route ---------------------------------------------------------------------
# (phase, action, responsable, échéance, c'est fait quand…)

PHASES = [
    ("Décider", "2 → 8 novembre"),
    ("Créer l'entreprise", "9 novembre → 4 décembre"),
    ("Préparer", "30 novembre → 20 décembre"),
    ("Ouvrir les réservations", "21 décembre → 3 janvier"),
    ("Lancer", "4 → 31 janvier"),
]

D = date

ETAPES = [
    ("Décider", "Trancher les sept décisions ouvertes de ce document", "Les deux", D(2026, 11, 6),
     "La page Décisions n'a plus de ligne vide"),
    ("Décider", "Valider les quatre fiches d'offre", "Les deux", D(2026, 11, 6),
     "Nine a relu et validé contenu, durée, prix, options et limites"),
    ("Décider", "Fixer les jours et la zone de chaque ville", "Nine", D(2026, 11, 6),
     "Le calendrier type de la semaine est écrit"),
    ("Décider", "Décider du sort du site actuel (parcours à 950 €, intervention filmée)", "Julien", D(2026, 11, 6),
     "La liste des pages à modifier est écrite"),

    ("Créer l'entreprise", "Créer la micro-entreprise de Nine sur le guichet unique", "Julien", D(2026, 11, 13),
     "L'accusé de dépôt du guichet unique est reçu"),
    ("Créer l'entreprise", "Vérifier l'éligibilité de Nine à l'ACRE et la demander", "Julien", D(2026, 11, 20),
     "La demande est envoyée à l'Urssaf, ou l'inéligibilité est notée"),
    ("Créer l'entreprise", "Ouvrir un compte bancaire dédié", "Nine", D(2026, 11, 20),
     "Le RIB est disponible"),
    ("Créer l'entreprise", "Demander trois devis d'assurance RC pro", "Julien", D(2026, 11, 20),
     "Trois devis reçus, pour l'activité « organisation et rangement à domicile »"),
    ("Créer l'entreprise", "Faire ajouter l'usage professionnel à l'assurance du véhicule", "Nine", D(2026, 11, 27),
     "L'attestation ou l'avenant est reçu"),
    ("Créer l'entreprise", "Recevoir le SIRET", "Nine", D(2026, 11, 27),
     "L'avis de situation INSEE est téléchargé"),
    ("Créer l'entreprise", "Déclarer l'activité services à la personne sur NOVA (et la dispense pour L'Allure)",
     "Julien", D(2026, 12, 4), "Le récépissé de déclaration est reçu"),
    ("Créer l'entreprise", "Choisir le logiciel de facturation habilité à l'avance immédiate et demander l'habilitation",
     "Julien", D(2026, 12, 4), "Le compte est ouvert et l'habilitation demandée"),

    ("Préparer", "Créer le logo et la charte (carré, coin, une couleur)", "Les deux", D(2026, 12, 4),
     "Le logo est validé en couleur, en noir et en icône"),
    ("Préparer", "Ouvrir Instagram, TikTok et la page Facebook", "Nine", D(2026, 12, 4),
     "Les trois comptes ont bio, logo et lien de réservation"),
    ("Préparer", "Souscrire la RC pro", "Julien", D(2026, 12, 11),
     "L'attestation d'assurance est reçue, avant la première prestation test"),
    ("Préparer", "Désigner un médiateur de la consommation", "Julien", D(2026, 12, 11),
     "La convention est signée"),
    ("Préparer", "Rédiger les CGV", "Julien", D(2026, 12, 11),
     "Les CGV sont en ligne et couvrent les six points de ce document"),
    ("Préparer", "Préparer les modèles : confirmation, facture, fiche « Votre espace organisé », autorisation photos",
     "Julien", D(2026, 12, 11), "Les quatre modèles sont prêts à l'emploi"),
    ("Préparer", "Paramétrer la réservation : Un coin, Une pièce, L'habitude, créneaux express", "Julien", D(2026, 12, 11),
     "Un proche réserve un créneau test en moins d'une minute"),
    ("Préparer", "Mettre le site à jour : deux offres en vitrine, réservation en trois clics", "Julien", D(2026, 12, 18),
     "Le parcours à 950 € et l'intervention filmée ont disparu, la réservation fonctionne"),
    ("Préparer", "Acheter le matériel", "Nine", D(2026, 12, 11),
     "Le kit complet tient dans le coffre"),
    ("Préparer", "Faire cinq prestations tests chez des proches", "Nine", D(2026, 12, 18),
     "Cinq avant/après autorisés et cinq avis écrits"),
    ("Préparer", "Chronométrer les tests et ajuster les limites d'Un coin et d'Une pièce", "Nine", D(2026, 12, 18),
     "Les durées réelles sont notées et les fiches corrigées si besoin"),
    ("Préparer", "Créer la fiche Google Business Profile (zone desservie, sans adresse publique)", "Julien", D(2026, 12, 18),
     "La fiche est validée par Google"),
    ("Préparer", "Imprimer cartes de visite et flyers", "Julien", D(2026, 12, 18),
     "500 cartes et 500 flyers livrés"),
    ("Préparer", "Lister les partenaires à démarcher", "Julien", D(2026, 12, 18),
     "10 agences immobilières, 5 déménageurs, 5 résidences seniors, 3 conciergeries, avec contact"),
    ("Préparer", "Lister les groupes Facebook locaux", "Nine", D(2026, 12, 18),
     "10 groupes, avec leurs règles de publication"),
    ("Préparer", "Compléter l'étude de concurrence (Vendée, Sarthe, statut SAP de chacun)", "Julien", D(2026, 12, 18),
     "Le tableau n'a plus de case « non trouvé » sur les grandes villes"),
    ("Préparer", "Préparer douze contenus pour les réseaux", "Nine", D(2026, 12, 18),
     "Douze publications prêtes, dont trois avant/après"),

    ("Ouvrir les réservations", "Ouvrir le calendrier, premiers créneaux le 4 janvier", "Julien", D(2026, 12, 21),
     "Le lien de réservation est public"),
    ("Ouvrir les réservations", "Activer l'avance immédiate sur un premier client test", "Julien", D(2026, 12, 23),
     "Une facture test est passée par l'Urssaf"),
    ("Ouvrir les réservations", "Prévenir le réseau personnel et publier sur LinkedIn", "Julien", D(2026, 12, 28),
     "Annonce publiée, 30 messages personnels envoyés"),
    ("Ouvrir les réservations", "Programmer les publications de janvier", "Nine", D(2026, 12, 31),
     "Trois semaines de contenus programmés"),

    ("Lancer", "Annoncer l'ouverture sur les réseaux et dans les groupes locaux", "Nine", D(2027, 1, 4),
     "Publié sur les trois comptes et dans 10 groupes"),
    ("Lancer", "Distribuer les flyers (commerces de proximité, boîtes aux lettres)", "Nine", D(2027, 1, 15),
     "300 flyers distribués"),
    ("Lancer", "Démarcher les partenaires", "Julien", D(2027, 1, 15),
     "20 contacts faits, 3 rendez-vous obtenus"),
    ("Lancer", "Réaliser les premières interventions et demander les avis", "Nine", D(2027, 1, 29),
     "10 interventions, 8 avis publiés"),
    ("Lancer", "Faire le bilan de janvier", "Les deux", D(2027, 1, 31),
     "Heures facturées, clients revenus, durées réelles : offres et prix ajustés"),
]

INDICATEURS = [
    ("Heures facturées par semaine", "6 en janvier, 16 en juin, 22 en décembre (hypothèse de montée en charge)"),
    ("Clients de L'habitude", "10 fin juin, 25 fin décembre"),
    ("Avis publiés", "8 fin janvier, 40 fin décembre"),
    ("Clients revenus dans les 3 mois", "Un sur trois"),
]

# --- Sources ------------------------------------------------------------------------------

SOURCES = [
    ("Bree Van de Cool, tarifs", "https://breevandecool.com/tarif-home-organiser/"),
    ("Bree Van de Cool, organisation maison", "https://breevandecool.com/organisation-maison/"),
    ("FREED'Home, prestations", "https://freedhome-ho.com/prestations/"),
    ("Home and Papers, home organizer", "https://homeandpapers.fr/home-organizer/"),
    ("Ozalée, ateliers", "https://ozalee-verslasimplicite.fr/ateliers-initiations-a-lallegement/"),
    ("Le Nid Bien Rangé", "https://lenidbienrange.fr/"),
    ("Sophie Jolivet, home organising", "https://jolivetsophie.com/home-organising-angers/"),
    ("Les HOrganisées", "https://leshorganisees.fr/coach-en-rangement/"),
    ("Yoojo, aide au rangement", "https://yoojo.fr/menage/aide-au-rangement-de-la-maison"),
    ("Services à la personne, aménagement de la condition d'activité exclusive (2026)",
     "https://www.servicesalapersonne.gouv.fr/files/sap/files/documents/2026/fascicule-amenagement-CAE-micro-entrepreneurs-petites-entreprises.pdf"),
    ("Services à la personne, FAQ dispense CAE",
     "https://www.servicesalapersonne.gouv.fr/files/files/professionnels/metiers/faq-osp-amenagement-dispense-cae.pdf"),
    ("Legalplace, seuils micro-entreprise et TVA 2026", "https://www.legalplace.fr/guides/plafond-auto-entrepreneur/"),
    ("Dougs, ACRE 2026", "https://www.dougs.fr/blog/acre-micro-entreprise/"),
    ("Legifiscal, taux de TVA des services à la personne", "https://www.legifiscal.fr/actualites-fiscales/412-taux-de-tva-des-services-la-personne.html"),
    ("Abby, logiciels compatibles avance immédiate", "https://abby.fr/blog/logiciel-compatible-avance-immediate/"),
    ("Coover, tarifs RC pro auto-entrepreneur", "https://www.coover.fr/responsabilite-civile-pro/auto-entrepreneur"),
]

AVERTISSEMENT = (
    "Les taux et seuils viennent de sources secondaires, à confirmer sur urssaf.fr, impots.gouv.fr et "
    "servicesalapersonne.gouv.fr. Ce document ne remplace pas un expert-comptable : faire valider la "
    "déclaration services à la personne et les assurances avant le lancement."
)
