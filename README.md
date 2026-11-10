<p align="center">
  <img src="public/brand/du-brut-au-net-logo-horizontal.svg" alt="Du Brut au Net" width="420">
</p>

# Du Brut au Net 🇫🇷

Convertisseur de salaire brut ↔ net pour la France, avec support des différents statuts (cadre, non-cadre, fonction publique, portage salarial, auto-entrepreneur, profession libérale).

## Fonctionnalités

- 💰 Conversion brut ↔ net instantanée
- 📅 3 bases temporelles (horaire, mensuel, annuel)
- 👥 Support des statuts courants
- 📊 Détail des charges et cotisations
- 📱 Responsive et accessible
- 🔄 Taux mis à jour automatiquement
- 🖨️ Export PDF du résultat (via html2canvas + jsPDF)
- ℹ️ Page d’informations (méthodologie et sources officielles)
- 🌓 Dark Mode par défaut avec option de bascule
- 🤖 CI/CD intégrée avec GitHub Actions (tests, build, déploiement)

## Installation

```bash
# Installation des dépendances
pnpm install

# Lancement en développement
pnpm dev

# Build production
pnpm build

# Tests
pnpm test
```

## Structure

```
/
├── app/                    # Next.js app router
├── components/            # Composants React
├── lib/                   # Logique métier
├── data/                  # Données statiques (taux)
└── scripts/              # Scripts utilitaires
```

## Export PDF

Un bouton **Exporter en PDF** se trouve dans la carte Résultat.  
Il génère un PDF haute résolution de votre simulation grâce à `html2canvas` et `jsPDF`.

## Page d’informations

La page **/info** détaille :

- La formule de calcul utilisée (cotisations sociales puis impôt)
- Les sources officielles (Urssaf, Insee, Service-Public)
- Les limites et les dates de validité des données

## Thèmes

- Le **Dark Mode** est activé par défaut.
- Utilisez l’icône en haut à droite pour basculer entre clair et sombre.

## CI/CD (GitHub Actions)

Les workflows GitHub Actions incluent :

- Installation des dépendances, lint et tests unitaires
- Build de l’application
- Déploiement automatique sur Vercel

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing`)
3. Commit les changements (`git commit -m 'feat: truc génial'`)
4. Push la branche (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

## Licence

MIT

## Avertissement

Les résultats sont fournis à titre indicatif. Malgré une veille régulière, des écarts peuvent exister selon votre situation personnelle. Aucune responsabilité n'est assumée.
