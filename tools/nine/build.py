# Fabrique les livrables du business plan de Nine à partir de contenu.py.
#
#   python3 tools/nine/build.py && node tools/nine/pdf.cjs
#
# Produit dans tools/nine/sortie/ :
#   business-plan-nine.html   pages 16:9, même charte que les « 100 prompts » (relu puis imprimé par pdf.cjs)
#   business-plan-nine-doc.html   version simple, importée telle quelle en Google Doc
#   suivi.json   lignes du Google Sheet de suivi

import html
import json
import re
from pathlib import Path

import contenu as c

ICI = Path(__file__).parent
SORTIE = ICI / "sortie"
MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]


def typo(s):
    """Échappe, apostrophes courbes, espaces insécables avant ; : ! ? » et après «."""
    s = html.escape(s, quote=False).replace("'", "’")
    s = re.sub(r" ([;:!?»])", " \\1", s)
    return s.replace("« ", "« ")


def jour(d):
    return f"{d.day} {MOIS[d.month - 1]}"


num = lambda n: f"{n:02d}"

# --- PDF ----------------------------------------------------------------------------------

CSS = """
@font-face { font-family: Poppins; font-weight: 300; src: url(../fonts/Poppins-Light.ttf); }
@font-face { font-family: Poppins; font-weight: 400; src: url(../fonts/Poppins-Regular.ttf); }
@font-face { font-family: Poppins; font-weight: 500; src: url(../fonts/Poppins-Medium.ttf); }
@font-face { font-family: Poppins; font-weight: 600; src: url(../fonts/Poppins-SemiBold.ttf); }
@page { size: 1280px 720px; margin: 0; }
:root { --fond: #f6f5f1; --carte: #ecebe5; --jaune: #e8b723; --encre: #22201c; --gris: #6b675f; --filet: #dedbd2; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Poppins, sans-serif; font-weight: 300; color: var(--encre); background: #ccc; }
.page { width: 1280px; height: 720px; background: var(--fond); padding: 36px 56px 40px; position: relative; overflow: hidden; break-after: page; display: flex; flex-direction: column; }
@media screen { .page { margin: 0 auto 24px; } }
b, h3 { font-weight: 600; }
h2 { font-weight: 300; font-size: 34px; letter-spacing: -0.01em; line-height: 1.15; }
.entete { display: flex; justify-content: space-between; font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gris); padding-bottom: 10px; border-bottom: 1.5px solid var(--jaune); margin-bottom: 26px; flex: none; }
.badge { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 18px; padding: 0 4px; background: var(--jaune); color: var(--encre); font-weight: 600; font-size: 9.5px; border-radius: 2px; flex: none; }
.surtitre { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gris); margin-bottom: 10px; }
.chapeau { font-size: 13px; color: var(--gris); margin-top: 8px; line-height: 1.55; }
hr { width: 56px; border: 0; border-top: 2px solid var(--encre); margin: 22px 0; }
.corps { flex: 1; min-height: 0; display: flex; flex-direction: column; }

/* couverture et fin */
.meta-haut { display: flex; gap: 48px; font-size: 11px; margin-bottom: 22px; align-items: flex-start; }
.meta-haut b, .meta-bas b { display: block; font-size: 11px; margin-bottom: 2px; }
.pastille { margin-left: auto; width: 22px; height: 22px; border-radius: 50%; background: var(--jaune); }
.bloc-jaune { flex: 1; background: var(--jaune); padding: 56px 64px 48px; display: flex; flex-direction: column; }
.bloc-jaune h1 { font-weight: 400; font-size: 64px; line-height: 1.02; text-transform: uppercase; letter-spacing: -0.01em; }
.bloc-jaune h1.fin { text-transform: none; font-size: 72px; font-weight: 300; }
.bloc-jaune hr { margin: 26px 0 20px; }
.sous-titre { font-size: 18px; font-weight: 400; }
.themes { font-size: 11.5px; margin-top: 10px; opacity: 0.8; }
.meta-bas { margin-top: auto; display: flex; gap: 56px; font-size: 11px; }

/* mises en page */
.deux-colonnes { display: grid; grid-template-columns: 340px 1fr; gap: 56px; flex: 1; min-height: 0; }
.sommaire { list-style: none; font-size: 13px; }
.sommaire li { display: flex; align-items: center; gap: 16px; padding: 6px 0; border-bottom: 1px solid var(--filet); }
.sommaire .intitule { flex: 1; font-weight: 400; }
.sommaire .no { font-size: 11px; color: var(--gris); }
.page.jaune { background: var(--jaune); }
.page.jaune .entete { color: var(--encre); border-color: var(--encre); }
.page.jaune .surtitre, .page.jaune .chapeau { color: var(--encre); }
.centre { margin: auto 0; max-width: 900px; }
.centre p.grand { font-size: 17px; line-height: 1.6; margin-bottom: 14px; font-weight: 400; }
.titre-xl { font-size: 46px; }

.cartes { display: grid; gap: 14px; flex: 1; min-height: 0; }
.carte { background: var(--carte); border-radius: 6px; padding: 18px 20px; overflow: hidden; }
.carte h3 { font-size: 14px; line-height: 1.3; margin: 10px 0 8px; }
.carte p { font-size: 12.5px; line-height: 1.55; font-weight: 400; }
.carte p + p { margin-top: 6px; }
.carte.jaune { background: var(--jaune); }
.carte.cadre { background: none; border: 1.5px solid var(--jaune); }
.carte .etiquette { font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gris); margin-top: 8px; }
.carte.jaune .etiquette { color: var(--encre); }
.carte.jaune .badge { background: var(--encre); color: var(--jaune); }

table { width: 100%; border-collapse: collapse; font-size: 11.5px; line-height: 1.45; }
th { text-align: left; font-weight: 600; font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gris); padding: 0 12px 8px 0; border-bottom: 1.5px solid var(--encre); }
td { padding: 8px 12px 8px 0; border-bottom: 1px solid var(--filet); vertical-align: top; font-weight: 400; }
td:first-child { font-weight: 600; }
td.chiffre, th.chiffre { text-align: right; font-variant-numeric: tabular-nums; }
tr.objectif td { background: var(--jaune); }
td.vide { border-bottom: 1px dashed var(--gris); min-width: 150px; }

.etapes { list-style: none; }
.etapes li { display: grid; grid-template-columns: 22px 1fr 90px 70px 330px; gap: 14px; align-items: start; padding: 9px 0; border-bottom: 1px solid var(--filet); font-size: 12px; line-height: 1.45; }
.etapes .case { width: 15px; height: 15px; border: 1.5px solid var(--encre); border-radius: 2px; margin-top: 2px; }
.etapes .action { font-weight: 500; }
.etapes .qui, .etapes .quand { font-weight: 400; }
.etapes .fait { color: var(--gris); }
.etapes li.titres { font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gris); border-bottom: 1.5px solid var(--encre); padding-top: 0; }

.trois { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.grand-num { font-size: 52px; font-weight: 300; line-height: 1; }
.frise { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-top: 22px; }
.frise div { border-top: 2px solid var(--jaune); padding-top: 10px; font-size: 11.5px; line-height: 1.5; font-weight: 400; }
.frise b { display: block; margin-bottom: 4px; }
.barres { display: flex; align-items: flex-end; gap: 10px; height: 170px; margin-top: 8px; }
.barres div { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; font-size: 10px; color: var(--gris); }
.barres span.b { width: 100%; background: var(--jaune); border-radius: 2px 2px 0 0; }
.barres span.v { font-weight: 500; color: var(--encre); margin-bottom: 4px; }
.barres span.m { margin-top: 6px; }
.filet { border-left: 3px solid var(--jaune); padding-left: 14px; font-size: 11.5px; color: var(--gris); line-height: 1.5; }
.liste { list-style: none; font-size: 12.5px; line-height: 1.5; font-weight: 400; }
.liste li { padding: 6px 0 6px 18px; border-bottom: 1px solid var(--filet); position: relative; }
.liste li::before { content: ""; position: absolute; left: 0; top: 13px; width: 8px; height: 8px; background: var(--jaune); }
.sources { columns: 2; column-gap: 48px; font-size: 11px; line-height: 1.5; list-style: none; }
.sources li { break-inside: avoid; margin-bottom: 7px; font-weight: 400; }
.sources span { display: block; color: var(--gris); font-weight: 300; font-size: 10px; word-break: break-all; }
"""

pages = []
sections = []  # (numéro, titre, page) pour le sommaire


def entete(no):
    return f'<header class="entete"><span>{typo(c.TITRE)}</span><span>{num(no)}</span></header>'


def page(contenu, classe=""):
    no = len(pages) + 1
    pages.append(f'<section class="page {classe}">{entete(no)}<div class="corps">{contenu}</div></section>')
    return no


def section(titre, chapeau, corps, classe=""):
    n = len(sections) + 1
    no = page(f'<div class="surtitre">Partie {num(n)}</div><h2>{typo(titre)}</h2>'
              f'<p class="chapeau">{typo(chapeau)}</p><div style="height:22px"></div>{corps}', classe)
    sections.append((n, titre, no))
    return no


def suite(titre, corps):
    return page(f'<div class="surtitre">Suite</div><h2>{typo(titre)}</h2><div style="height:22px"></div>{corps}')


def couverture():
    pages.append(f"""<section class="page">
  <div class="meta-haut">
    <div><b>Auteurs</b>Nine et Julien Marquer</div>
    <div><b>Lancement</b>Janvier 2027</div>
    <div><b>Zone</b>Saint-Nazaire · Nantes</div>
    <span class="pastille"></span>
  </div>
  <div class="bloc-jaune">
    <h1>Nine,<br>un coin de neuf</h1>
    <hr>
    <p class="sous-titre">{typo(c.SOUS_TITRE)}</p>
    <p class="themes">Décisions · Risques · Positionnement · Concurrence · Offres · Parcours · Rentabilité · Administratif · Marque · Feuille de route</p>
    <div class="meta-bas">
      <div><b>Promesse</b>{typo(c.PROMESSE)}</div>
      <div><b>Édition</b>{typo(c.EDITION)}</div>
      <div><b>Statut</b>Document de travail. Les hypothèses sont signalées comme telles.</div>
    </div>
  </div>
</section>""")


def table(entetes, lignes, classes=None):
    classes = classes or [""] * len(entetes)
    th = "".join(f'<th class="{k}">{typo(e)}</th>' for e, k in zip(entetes, classes))
    corps = ""
    for ligne in lignes:
        attr = ' class="objectif"' if isinstance(ligne, tuple) and ligne and ligne[0] == "__objectif__" else ""
        cellules = ligne[1:] if attr else ligne
        corps += f"<tr{attr}>" + "".join(
            f'<td class="{k}">{v}</td>' for v, k in zip(cellules, classes)) + "</tr>"
    return f"<table><thead><tr>{th}</tr></thead><tbody>{corps}</tbody></table>"


def cartes(items, colonnes, badge=True, etirer=True):
    hauteur = "" if etirer else "; flex: none"
    out = f'<div class="cartes" style="grid-template-columns: repeat({colonnes}, 1fr){hauteur}">'
    for i, (titre, texte) in enumerate(items, 1):
        b = f'<span class="badge">{num(i)}</span>' if badge else ""
        out += f'<div class="carte">{b}<h3>{typo(titre)}</h3><p>{typo(texte)}</p></div>'
    return out + "</div>"


def construire_pdf():
    couverture()
    pages.append(None)  # sommaire, rempli à la fin

    # En bref
    corps = '<div class="centre">' + "".join(f'<p class="grand">{typo(p)}</p>' for p in c.EN_BREF) + "</div>"
    no = page(f'<div class="surtitre">L\'essentiel</div><h2 class="titre-xl">En bref.</h2>{corps}', "jaune")
    sections.append((0, "En bref", no))

    # Décisions
    lignes = [(f"{typo(s)}", typo(e), typo(r), "") for s, e, r in c.DECISIONS]
    entetes = ["Sujet", "Où on en est", "Recommandation", "Décision"]
    cl = ["", "", "", "vide"]
    section("Les décisions encore ouvertes.",
            "Sept points à trancher avant le 6 novembre. La recommandation est la nôtre ; la dernière colonne est la vôtre.",
            table(entetes, lignes[:4], cl))
    suite("Les décisions encore ouvertes.", table(entetes, lignes[4:], cl))

    # Risques
    section("Ce qui peut mal tourner.", "Cinq risques, et ce qu'on fait pour chacun.",
            cartes(c.RISQUES, 5))

    # Positionnement
    slogans = "".join(f"<p>{typo(s)}</p>" for s in c.SLOGANS)
    corps = (f'<div class="cartes" style="grid-template-columns: 1.3fr 1fr 1fr">'
             f'<div class="carte jaune"><div class="etiquette">La promesse</div>'
             f'<p style="font-size:40px;line-height:1.1;font-weight:300;margin-top:18px">{typo(c.PROMESSE)}</p></div>'
             f'<div class="carte cadre"><div class="etiquette">Les phrases qu\'on garde</div><div style="height:12px"></div>{slogans}</div>'
             f'<div class="carte"><div class="etiquette">Le vocabulaire</div><div style="height:4px"></div>'
             + "".join(f"<h3>{typo(t)}</h3><p>{typo(x)}</p>" for t, x in c.LEXIQUE) + "</div></div>")
    section("Vous réservez. Nine range.",
            "Un rangement aussi simple à réserver qu'une femme de ménage, sans jugement, assumé.", corps)
    suite("Positionnement et singularité.", cartes(c.POSITIONNEMENT, 5))

    # Concurrence
    lignes = [(typo(n), typo(z), typo(p), typo(m)) for n, z, p, m in c.CONCURRENTS]
    section("Le marché local.",
            "Prix publiés, relevés le 30 octobre 2026. Les pages n'ont pas toutes le même âge : à vérifier avant de s'en servir.",
            table(["Qui", "Où", "Prix publiés", "Méthode"], lignes)
            + '<div style="height:22px"></div><ul class="liste">'
            + "".join(f"<li>{typo(x)}</li>" for x in c.CONCURRENCE_LECTURE) + "</ul>")

    # Offres
    def fiche(o, n):
        champs = [("Durée", o["duree"]), ("Prix", o["prix"]), ("Pour", o["pour"]), ("Inclus", o["inclus"]),
                  ("Options", o["options"]), ("Limites", o["limites"])]
        corps = "".join(f'<div class="etiquette">{k}</div><p>{typo(v)}</p>' for k, v in champs)
        cl = "jaune" if o["vitrine"] else ""
        return f'<div class="carte {cl}"><span class="badge">{num(n)}</span><h3 style="font-size:20px;font-weight:400">{typo(o["nom"])}</h3>{corps}</div>'
    section("Les offres.", "Deux en vitrine, réservables en trois clics. Deux au second plan.",
            '<div class="cartes" style="grid-template-columns: 1fr 1fr">' + fiche(c.OFFRES[0], 1) + fiche(c.OFFRES[1], 2) + "</div>")
    suite("Au second plan.", '<div class="cartes" style="grid-template-columns: 1fr 1fr 0.9fr">'
          + fiche(c.OFFRES[2], 3) + fiche(c.OFFRES[3], 4)
          + '<div class="carte cadre"><div class="etiquette">Nine fait aussi</div>'
          + "".join(f"<h3>{typo(t)}</h3><p>{typo(x)}</p>" for t, x in c.AUTRES_PILIERS) + "</div></div>")

    # Parcours
    etapes = "".join(f'<div class="carte jaune"><div class="grand-num">{i}</div><h3 style="font-size:20px;font-weight:400;margin-top:18px">{typo(t)}</h3><p>{typo(x)}</p></div>'
                     for i, (t, x) in enumerate(c.PARCOURS, 1))
    frise = "".join(f"<div><b>{typo(t)}</b>{typo(x)}</div>" for t, x in c.APRES_RESERVATION)
    section("Trois clics.", "Pas de devis, pas de diagnostic, rien à payer à la réservation. Le devis ne reste que pour Toute la maison.",
            f'<div class="trois">{etapes}</div><div class="surtitre" style="margin-top:26px">Ensuite, sans que le client ait rien à faire</div><div class="frise" style="margin-top:6px">{frise}</div>')

    # Limites
    section("Ce qu'on fait, ce qu'on ne fait pas.", "Écrit noir sur blanc, dans les CGV et sur le site.",
            cartes(c.LIMITES, 3, badge=False))

    # Rentabilité
    lignes = []
    for s in c.SCENARIOS:
        ligne = (f"{s['h']} h", c.euros(s["ca"]), c.euros(s["cotis"]), c.euros(s["dep"]),
                 c.euros(c.FIXES_MOIS), f"<b>{c.euros(s['net'])}</b>")
        lignes.append(("__objectif__",) + ligne if s["h"] == 28 else ligne)
    hyp = (f"Hypothèses : {c.PRIX_HEURE} € de l'heure, cotisations de {str(c.COTISATIONS * 100).replace('.', ',')} %, "
           f"{c.SEMAINES_PAR_MOIS} semaines travaillées par mois, interventions de {c.DUREE_MOYENNE} h en moyenne, "
           f"{c.DEPLACEMENT} € de trajet par intervention, {c.FIXES_MOIS} € de frais fixes par mois. "
           "Revenu avant impôt sur le revenu, ACRE non comptée. Le crédit d'impôt ne change rien au revenu de Nine : il change ce que paie le client.")
    section("Ce que ça rapporte.",
            f"L'objectif de 4 000 € demande environ {round(c.HEURES_OBJECTIF)} heures facturées par semaine.",
            table(["Heures facturées / semaine", "Chiffre d'affaires / mois", "Cotisations", "Trajets", "Frais fixes", "Revenu de Nine / mois"],
                  lignes, ["", "chiffre", "chiffre", "chiffre", "chiffre", "chiffre"])
            + f'<div style="margin-top:auto" class="filet">{typo(hyp)}</div>')
    hmax = max(h for _, h in c.MONTEE)
    barres = "".join(f'<div><span class="v">{h} h</span><span class="b" style="height:{h / hmax * 120}px"></span><span class="m">{m[:4]}.</span></div>'
                     for m, h in c.MONTEE)
    tva = (f"Chiffre d'affaires de l'année 1 : environ {c.euros(c.CA_ANNEE_1)}, sous le seuil de TVA de {c.euros(c.SEUIL_TVA)}. "
           f"Revenu moyen : environ {c.euros(round(c.NET_ANNEE_1 / 12, -2))} par mois. Au rythme de l'objectif, le chiffre d'affaires "
           f"annuel passe à environ {c.euros(c.HEURES_OBJECTIF * 48 * c.PRIX_HEURE)} : la TVA à 10 % s'applique, et 50 € TTC ne font plus que 45,45 € pour Nine.")
    point_mort = (f"Point mort : deux « Un coin » par mois couvrent les frais fixes. Le budget de départ de 1 000 € est remboursé "
                  f"après une quinzaine d'interventions.")
    suite("L'année 1, mois par mois (hypothèse).",
          f'<div class="barres">{barres}</div><div style="height:26px"></div>'
          f'<div class="trois"><div class="carte"><h3>Le chiffre d\'affaires</h3><p>{typo(tva)}</p></div>'
          f'<div class="carte"><h3>Le point mort</h3><p>{typo(point_mort)}</p></div>'
          f'<div class="carte jaune"><h3>Le levier</h3><p>{typo("25 clients de L’habitude, c’est 50 heures par mois réservées d’avance, sans prospection. C’est l’offre à pousser après chaque première intervention.")}</p></div></div>')

    # Budget
    lignes = [(typo(p), c.euros(m), typo(d)) for p, m, d in c.BUDGET]
    lignes.append(("__objectif__", "Total", c.euros(sum(m for _, m, _ in c.BUDGET)), "Budget de départ décidé"))
    section("Le budget de départ.", "1 000 €. Montants hypothétiques, à remplacer par les devis.",
            table(["Poste", "Montant", "Détail"], lignes, ["", "chiffre", ""]))

    # Administratif
    section("L'administratif.", "Ce qu'il faut savoir avant de créer l'entreprise.", cartes(c.ADMIN[:6], 3, badge=False))
    suite("Assurances, titre et CGV.",
          f'<div class="cartes" style="grid-template-columns: 1fr 1fr 1fr 1.4fr">'
          + "".join(f'<div class="carte"><h3>{typo(t)}</h3><p>{typo(x)}</p></div>' for t, x in c.ADMIN[6:])
          + '<div class="carte cadre"><div class="etiquette">Ce que les CGV doivent couvrir</div><ul class="liste" style="margin-top:10px">'
          + "".join(f"<li>{typo(x)}</li>" for x in c.CGV) + "</ul></div></div>")

    # Marque
    marque = "".join(f'<div class="carte"><h3>{typo(t)}</h3><p>{typo(x)}</p></div>' for t, x in c.MARQUE)
    section("La marque et les réseaux.", "Nine gère les réseaux, Julien la prospection.",
            f'<div class="trois">{marque}</div><div style="height:14px"></div>'
            + cartes(c.CONTENUS, 5) + f'<div style="height:14px"></div><div class="filet">{typo(c.RESEAUX)}</div>')

    # Feuille de route
    phases = "".join(
        f'<div class="carte {"jaune" if i == 5 else ""}"><span class="badge">{num(i)}</span><h3 style="font-size:18px;font-weight:400">{typo(p)}</h3>'
        f'<p>{typo(dates)}</p><p class="etiquette">{sum(1 for e in c.ETAPES if e[0] == p)} étapes</p></div>'
        for i, (p, dates) in enumerate(c.PHASES, 1))
    section("La feuille de route.", f"{len(c.ETAPES)} étapes, du 2 novembre au 31 janvier. Chacune a un responsable, une échéance et un critère : c'est fait quand on peut le vérifier.",
            f'<div class="cartes" style="grid-template-columns: repeat(5, 1fr); flex: none">{phases}</div>'
            '<div style="height:22px"></div><div class="filet">Le même suivi existe en Google Sheet : on y coche, et l\'avancement se calcule tout seul.</div>')
    for i, (p, dates) in enumerate(c.PHASES, 1):
        etapes = sorted((e for e in c.ETAPES if e[0] == p), key=lambda e: e[3])
        for k in range(0, len(etapes), 9):
            lot = etapes[k:k + 9]
            titre = p + (" (suite)" if k else "")
            lis = '<li class="titres"><span></span><span>Action</span><span>Qui</span><span>Quand</span><span>C\'est fait quand…</span></li>'
            lis += "".join(f'<li><span class="case"></span><span class="action">{typo(a)}</span><span class="qui">{typo(q)}</span>'
                           f'<span class="quand">{jour(d)}</span><span class="fait">{typo(f)}</span></li>' for _, a, q, d, f in lot)
            page(f'<div class="surtitre">Phase {num(i)} · {typo(dates)}</div><h2>{typo(titre)}.</h2><div style="height:18px"></div><ul class="etapes">{lis}</ul>')

    # Indicateurs
    section("Comment on saura que ça marche.", "Quatre chiffres, relevés à la fin de chaque mois.",
            cartes(c.INDICATEURS, 4, etirer=False))

    # Sources
    lis = "".join(f"<li>{typo(t)}<span>{html.escape(u)}</span></li>" for t, u in c.SOURCES)
    section("Sources.", c.AVERTISSEMENT, f'<ul class="sources">{lis}</ul>')

    # Fin
    pages.append(f"""<section class="page">
  <div class="meta-haut"><div><b>Nine</b>nine.marquer@gmail.com</div><div><b>En ligne</b>nine-services.netlify.app</div><span class="pastille"></span></div>
  <div class="bloc-jaune"><h1 class="fin">Vous n’aimez pas ranger.<br>Nine, si.</h1><hr><p class="sous-titre">{typo(c.PROMESSE)}</p></div>
</section>""")

    # Sommaire
    lis = "".join(f'<li><span class="badge">{num(n) if n else "·"}</span><span class="intitule">{typo(t)}</span><span class="no">{num(p)}</span></li>'
                  for n, t, p in sections)
    pages[1] = (f'<section class="page">{entete(2)}<div class="corps"><div class="deux-colonnes"><div><h2>Sommaire.</h2>'
                f'<p class="chapeau">Un business plan pour décider, puis une feuille de route pour cocher.</p></div>'
                f'<ul class="sommaire">{lis}</ul></div></div></section>')

    SORTIE.mkdir(exist_ok=True)
    (SORTIE / "business-plan-nine.html").write_text(
        f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>{typo(c.TITRE)}</title><style>{CSS}</style></head><body>'
        + "\n".join(pages) + "</body></html>", encoding="utf-8")


# --- Google Doc ---------------------------------------------------------------------------
# HTML simple : Drive le convertit en titres, listes et tableaux natifs. Les étapes de la
# feuille de route sont des listes que build_doc transforme ensuite en cases à cocher.

def construire_doc():
    t = typo
    h = [f"<h1>{t(c.TITRE)}</h1><p><i>{t(c.SOUS_TITRE)} Édition du {t(c.EDITION)}.</i></p>"]

    def tableau(entetes, lignes):
        th = "".join(f"<th>{t(e)}</th>" for e in entetes)
        tr = "".join("<tr>" + "".join(f"<td>{v}</td>" for v in l) + "</tr>" for l in lignes)
        return f'<table border="1" cellpadding="6"><tr>{th}</tr>{tr}</table>'

    h.append("<h2>En bref</h2>" + "".join(f"<p>{t(p)}</p>" for p in c.EN_BREF))
    h.append("<h2>Décisions encore ouvertes</h2><p>La recommandation est la nôtre ; la dernière colonne est à remplir.</p>"
             + tableau(["Sujet", "Où on en est", "Recommandation", "Décision"],
                       [(f"<b>{t(s)}</b>", t(e), t(r), "") for s, e, r in c.DECISIONS]))
    h.append("<h2>Risques principaux</h2>" + "".join(f"<p><b>{t(a)}.</b> {t(b)}</p>" for a, b in c.RISQUES))
    h.append(f"<h2>Positionnement et singularité</h2><p><b>La promesse : {t(c.PROMESSE)}</b></p>"
             + "".join(f"<h3>{t(a)}</h3><p>{t(b)}</p>" for a, b in c.POSITIONNEMENT)
             + "<h3>Les phrases qu’on garde</h3><ul>" + "".join(f"<li>{t(s)}</li>" for s in c.SLOGANS) + "</ul>"
             + "<h3>Le vocabulaire</h3>" + "".join(f"<p><b>{t(a)} :</b> {t(b)}</p>" for a, b in c.LEXIQUE))
    h.append("<h2>Le marché local</h2><p>Prix publiés, relevés le 30 octobre 2026, à vérifier avant de s’en servir.</p>"
             + tableau(["Qui", "Où", "Prix publiés", "Méthode"], [(f"<b>{t(a)}</b>", t(b), t(x), t(d)) for a, b, x, d in c.CONCURRENTS])
             + "<ul>" + "".join(f"<li>{t(x)}</li>" for x in c.CONCURRENCE_LECTURE) + "</ul>")
    h.append("<h2>Les offres</h2>")
    for o in c.OFFRES:
        h.append(f"<h3>{t(o['nom'])}{' (en vitrine)' if o['vitrine'] else ' (second plan)'}</h3>"
                 + tableau(["Durée", "Prix", "Pour", "Inclus", "Options", "Limites"],
                           [tuple(t(o[k]) for k in ("duree", "prix", "pour", "inclus", "options", "limites"))]))
    h.append("<h3>Nine fait aussi</h3>" + "".join(f"<p><b>{t(a)}.</b> {t(b)}</p>" for a, b in c.AUTRES_PILIERS))
    h.append("<h2>La réservation en trois clics</h2><ol>" + "".join(f"<li><b>{t(a)}.</b> {t(b)}</li>" for a, b in c.PARCOURS) + "</ol>"
             + "<h3>Ensuite</h3>" + tableau(["Quand", "Quoi"], [(f"<b>{t(a)}</b>", t(b)) for a, b in c.APRES_RESERVATION]))
    h.append("<h2>Ce qu’on fait, ce qu’on ne fait pas</h2>" + tableau(["Sujet", "Règle"], [(f"<b>{t(a)}</b>", t(b)) for a, b in c.LIMITES]))
    lignes = [(f"{s['h']} h", c.euros(s["ca"]), c.euros(s["cotis"]), c.euros(s["dep"]), c.euros(c.FIXES_MOIS), f"<b>{c.euros(s['net'])}</b>")
              for s in c.SCENARIOS]
    h.append(f"<h2>Ce que ça rapporte</h2><p>L’objectif de 4 000 € par mois demande environ {round(c.HEURES_OBJECTIF)} heures facturées par semaine.</p>"
             + tableau(["Heures facturées / semaine", "Chiffre d’affaires / mois", "Cotisations", "Trajets", "Frais fixes", "Revenu de Nine / mois"], lignes)
             + f"<p><i>Hypothèses : {c.PRIX_HEURE} € de l’heure, cotisations de 21,2 %, {c.SEMAINES_PAR_MOIS} semaines travaillées par mois, "
               f"interventions de {c.DUREE_MOYENNE} h en moyenne, {c.DEPLACEMENT} € de trajet par intervention, {c.FIXES_MOIS} € de frais fixes par mois. "
               "Revenu avant impôt sur le revenu, ACRE non comptée.</i></p>"
             + "<h3>L’année 1 (hypothèse de montée en charge)</h3>"
             + tableau(["Mois", "Heures / semaine", "Revenu de Nine"], [(t(m), f"{x} h", c.euros(c.revenu(x)["net"])) for m, x in c.MONTEE])
             + f"<p>Chiffre d’affaires de l’année 1 : environ {c.euros(c.CA_ANNEE_1)}, sous le seuil de TVA. Revenu moyen : environ "
               f"{c.euros(round(c.NET_ANNEE_1 / 12, -2))} par mois. Au rythme de l’objectif, la TVA à 10 % s’applique : 50 € TTC ne font plus que 45,45 € pour Nine.</p>"
             + "<p>Point mort : deux « Un coin » par mois couvrent les frais fixes. Le levier : 25 clients de L’habitude, c’est 50 heures par mois réservées d’avance.</p>")
    h.append("<h2>Le budget de départ</h2>" + tableau(["Poste", "Montant", "Détail"],
             [(f"<b>{t(p)}</b>", c.euros(m), t(d)) for p, m, d in c.BUDGET] + [("<b>Total</b>", f"<b>{c.euros(1000)}</b>", "")]))
    h.append("<h2>L’administratif</h2>" + "".join(f"<p><b>{t(a)}.</b> {t(b)}</p>" for a, b in c.ADMIN)
             + "<h3>Ce que les CGV doivent couvrir</h3><ul>" + "".join(f"<li>{t(x)}</li>" for x in c.CGV) + "</ul>")
    h.append("<h2>La marque et les réseaux</h2>" + "".join(f"<p><b>{t(a)}.</b> {t(b)}</p>" for a, b in c.MARQUE)
             + "<h3>Les contenus</h3><ul>" + "".join(f"<li><b>{t(a)}.</b> {t(b)}</li>" for a, b in c.CONTENUS) + "</ul>"
             + f"<p>{t(c.RESEAUX)}</p>")
    h.append("<h2>La feuille de route</h2><p>Chaque étape a un responsable, une échéance et un critère : c’est fait quand on peut le vérifier. "
             "Le même suivi existe en Google Sheet.</p>")
    for i, (p, dates) in enumerate(c.PHASES, 1):
        h.append(f"<h3>Phase {i} : {t(p)} ({t(dates)})</h3><ul>")
        minuscule = lambda f: f if f.split()[0] in ("Nine", "Julien") else f[0].lower() + f[1:]
        h.extend(f"<li><b>{t(a)}</b> · {t(q)} · {jour(d)} · C’est fait quand : {t(minuscule(f))}.</li>"
                 for ph, a, q, d, f in sorted(c.ETAPES, key=lambda e: e[3]) if ph == p)
        h.append("</ul>")
    h.append("<h2>Comment on saura que ça marche</h2>" + tableau(["Indicateur", "Cible"], [(f"<b>{t(a)}</b>", t(b)) for a, b in c.INDICATEURS]))
    h.append("<h2>Sources</h2><ul>" + "".join(f'<li><a href="{html.escape(u)}">{t(a)}</a></li>' for a, u in c.SOURCES) + "</ul>"
             + f"<p><i>{t(c.AVERTISSEMENT)}</i></p>")
    (SORTIE / "business-plan-nine-doc.html").write_text(
        '<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body>' + "".join(h) + "</body></html>", encoding="utf-8")


def construire_suivi():
    ordre = [p for p, _ in c.PHASES]
    etapes = sorted(c.ETAPES, key=lambda e: (ordre.index(e[0]), e[3]))
    lignes = [[i, p, a, q, d.isoformat(), f] for i, (p, a, q, d, f) in enumerate(etapes, 1)]
    decisions = [[s, e, r] for s, e, r in c.DECISIONS]
    (SORTIE / "suivi.json").write_text(json.dumps({"etapes": lignes, "decisions": decisions}, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    construire_pdf()
    construire_doc()
    construire_suivi()
    print(f"{len(pages)} pages, {len(c.ETAPES)} étapes")
