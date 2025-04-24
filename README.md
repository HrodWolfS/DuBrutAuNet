# Du Brut au Net 🇫🇷

Convertisseur de salaire brut ↔ net pour la France, avec support des différents statuts (CDI, CDD, fonction publique, alternance, auto-entrepreneur).

## Fonctionnalités

- 💰 Conversion brut ↔ net instantanée
- 📅 4 bases temporelles (horaire, journalier, mensuel, annuel)
- 👥 Support des statuts courants
- 📊 Détail des charges et cotisations
- 📱 Responsive et accessible
- 🔄 Taux mis à jour automatiquement

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
