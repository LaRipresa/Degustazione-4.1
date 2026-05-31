# Dégustation Naturale 🍷

**Plateforme complète de dégustation à l'aveugle**  
Tenuta di Castellaro · Tenuta Massimo Lentsch · Collection Naturale

---

## Fonctionnalités

### Interface Administrateur
- **Authentification** : email + code sécurisé, session persistante
- **Configuration** : nom de la dégustation, date, code participant
- **Gestion des vins** : ajout, modification, suppression, réordonnancement par série
- **Minuterie** : compteur configurable avec affichage plein écran
- **Présentation** : QR code d'accès, liste participants en direct, contrôle des phases
- **Résultats** : agrégation des scores, export PDF

### Mode Présentation (fond blanc, projection)
- **Ouverture** : logos, nom, date, QR code, liste des participants en direct
- **Timer** : grande horloge de dégustation (décompte configurable)
- **Révélation** : fiche vin complète + résultats du groupe par vin
- **Clôture** : sélection finale + remerciements

### Interface Participant (téléphone)
- **Inscription** : nom, email, code de participation
- **Dégustation** : formulaire par vin (couleur/nez/bouche, mots-clés, échelle naturel, prix)
- **Classement** : ordre de préférence par série

---

## Déploiement Vercel

```bash
# 1. Cloner et installer
git clone https://github.com/<compte>/degustation-naturale.git
cd degustation-naturale
npm install

# 2. Développement local
npm run dev  →  http://localhost:5173

# 3. Déployer sur Vercel
# Option A – Interface web
# vercel.com → Add New Project → importer le repo → Deploy

# Option B – CLI
npx vercel --prod
```

> Vercel détecte Vite automatiquement. Aucune configuration supplémentaire requise.

---

## Première utilisation

1. Ouvrir l'URL déployée
2. La page de **configuration initiale** s'affiche automatiquement
3. Renseigner : nom de dégustation, date, email admin, code admin, code participant
4. → L'espace admin est accessible immédiatement

Les participants ouvrent la même URL et choisissent **"Rejoindre la dégustation"** avec le code communiqué.

---

## Stockage des données

| Données | Stockage | Visibilité |
|---------|----------|------------|
| Config dégustation | Partagé | Tous les appareils |
| Liste des vins | Partagé | Tous les appareils |
| Participants | Partagé | Tous les appareils |
| Résultats par participant | Partagé | Tous les appareils |
| Session admin | Personnel | Cet appareil uniquement |
| Session participant | Personnel | Cet appareil uniquement |

**Dans les artifacts Claude** : `window.storage` API (données persistantes cross-session)  
**Dans le déploiement Vercel** : `localStorage` (données locales par navigateur)

> Pour une synchronisation multi-appareils en production, il est recommandé d'intégrer Firebase Realtime Database ou Supabase (voir section ci-dessous).

---

## Architecture

```
src/
├── main.jsx          ← point d'entrée React
└── App.jsx           ← application complète (données + vues + logique)

public/
├── logo-castellaro.png
└── logo-lentsch.jpg
```

---

## Personnaliser les vins

Dans `src/App.jsx`, modifier le tableau `DEFAULT_SERIES` :

```js
{
  id: "S1",                    // identifiant unique de la série
  name: "Série I",             // nom court
  subtitle: "Vins Effervescents",
  icon: "✦",                   // icône d'affichage
  color: "#B8963E",            // couleur de la série
  intro: "...",                // texte de présentation
  wines: [
    {
      id: "w01",               // identifiant unique
      blind: "A",              // lettre aveugle
      name: "Producteur · Cuvée Millésime",
      producer: "...",
      appellation: "...",
      terroir: "...",
      cepages: "...",
      vinif: "...",            // vinification
      elevage: "...",
      prix: "18 – 22 €",
    },
  ],
}
```

---

## Calcul du score final

```
score = (note_normalisée × 0.6) + (rang_normalisé × 0.4)
```

- **Note** : moyenne (couleur + nez + bouche) / 3, normalisée sur 4
- **Rang** : position inverse dans le classement de préférence, normalisée

---

## Licence

Usage interne — Tenuta di Castellaro / Tenuta Massimo Lentsch
