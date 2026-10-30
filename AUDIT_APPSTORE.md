# Audit de faisabilité App Store — « Du Brut au Net » (iOS)

*Audit réalisé le 30/10/2026 sur `main` (45fe0d4) + modifications locales non commitées du dossier `mobile/`. Aucun fichier modifié hormis celui-ci.*

**Contexte confirmé :** app gratuite, sans pub ni IAP, iOS uniquement, compte Apple Developer **individuel**, **aucun revenu** (même indirect), calcul v1 = **taux global mis à jour 2026**, site `dubrutaunet.fr` en ligne et sous contrôle.

---

## Verdict : 🟡 GO avec corrections

Il n'y a aucun point bloquant structurel : pas de compte, pas de tracking, pas de réseau, pas de paiement, et l'app est **déjà en React Native natif** (pas une WebView), ce qui écarte d'office le rejet « site emballé ». Avant la soumission, il faut corriger trois choses :

1. **Données obsolètes et incohérentes** (barème d'avril 2025, SMIC par défaut de janvier 2024, détail « Fonction publique » contradictoire). Sur une app financière, c'est le motif de rejet le plus probable, et le plus coûteux en réputation.
2. **Politique de confidentialité** inexistante, alors qu'elle est obligatoire même pour une app qui ne collecte rien.
3. **Fonctionnalité 4.2** encore un peu juste : un calculateur à 3 onglets passe souvent, mais pas toujours. Deux ou trois ajouts peu coûteux suffisent à supprimer le risque.

Estimation : **~9 à 12 jours-homme** jusqu'à la soumission (détail en §5).

---

## 1. Cartographie du code

### Stack

| | Web (racine) | Mobile (`mobile/`) |
|---|---|---|
| Framework | Next.js **16.1.6** (App Router, Turbopack), React 19 | Expo **SDK 54** (`expo ~54.0.0`), React Native **0.81.5**, React 19.1.0, expo-router 6 |
| État | `useState`/`useMemo` dans un hook (`lib/hooks/useCalculator.ts`), pas de store | Même hook (fork) + `React.Context` (`context/CalculatorContext.tsx`) |
| Persistance | aucune | AsyncStorage 2.2.0 (`lib/storage.ts`, clé `calculator_prefs`) |
| Styles | Tailwind 3.4.1 + shadcn/Radix, dark mode via `ThemeToggle` | `StyleSheet` + `constants/theme.ts`, `userInterfaceStyle: automatic` |
| Formulaires | react-hook-form + zod | `TextInput` contrôlés, `@react-native-community/slider` |
| Divers | MDX (blog), html2canvas + jsPDF (export PDF), puppeteer (scraper) | react-native-svg (pyramide), `Share` natif |

⚠️ Hygiène du dépôt : il y a **4 gestionnaires de lockfile** (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json` racine et mobile, plus un `pnpm-workspace.yaml` incomplet avec `allowBuilds: … set this to true or false`). `mobile/node_modules/` n'est pas ignoré par git, puisque `.gitignore` racine contient `/node_modules` (racine seulement). `mobile/.npmrc` force `legacy-peer-deps`. EAS Build choisit le gestionnaire d'après le lockfile : il faut en garder **un seul**.

### Logique de calcul

| Fichier | Pur ? | Utilisé ? | Remarque |
|---|---|---|---|
| `lib/convert.ts` | ✅ TS pur, aucune dépendance DOM/Next | ❌ **code mort** : aucun composant ne l'appelle | Seul fichier testé. Sa formule journalière (`/7`) diverge de celle du hook. Ses taux « détails » (`0.42`, `0.098`, `0.743`) sont codés en dur. |
| `lib/hooks/useCalculator.ts` (web) | ⚠️ pas de DOM, mais c'est un hook React | ✅ logique réelle du site | Import dynamique du JSON, `SMIC_2025 = 11.65` |
| `mobile/lib/hooks/useCalculator.ts` | ⚠️ hook React | ✅ logique réelle de l'app | **Fork divergent** du hook web (pas de période « journalière », types différents, persistance ajoutée) |
| `mobile/components/ChargeBreakdown.tsx`, `FreelanceComparator.tsx`, `SocialPyramid.tsx` | — | ✅ | Taux et repères **codés en dur dans les composants** (`GLOBAL_RATE`, `CHARGES_PATRONALES_RATE = 0.45`, `SMIC Net 1398`…) |

**Conclusion :** les formules sont simples et portables, mais il n'existe **pas de module de calcul unique**. La même logique est copiée en 3 à 4 endroits avec des constantes différentes. Il faut extraire un `salary.ts` pur (fonctions sans React), le partager entre web et mobile, et faire des hooks de simples adaptateurs.

### Taux : sources, dates, fraîcheur 2026

Source unique : `data/rates_fr_2025.json` (copié dans `mobile/data/`), `lastUpdate: 2025-04-29`.

| Donnée | Dans le code | Valeur en vigueur au 30/10/2026 | Statut |
|---|---|---|---|
| SMIC horaire brut | JSON `11.88` (nov. 2024) ; valeur par défaut du hook `11.65` (**janv. 2024**) | **12,31 €** depuis le 1/06/2026 (12,02 € du 1/01 au 31/05/2026) | ❌ obsolète |
| SMIC mensuel brut 35 h | `1801.8` | **1 867,02 €** | ❌ |
| Plafond SS (PASS/PMSS) | **absent**, pas de tranches | 48 060 €/an, **4 005 €/mois** (2026) | ⚠️ non modélisé (assumé avec le choix « taux global ») |
| PAS | curseur manuel 0–45 %, défaut 14 %, pas de grille | Grille de taux neutre 2026 non implémentée | ⚠️ acceptable si présenté comme « votre taux » |
| Taux salariaux globaux | NC 22 %, Cadre 24,5 %, FP 16,7 %, Portage 22 %, PL 35,67 %, AE 21,2 % | Ordres de grandeur plausibles pour le privé. **AE 21,2 % ne vaut que pour le BIC prestations de services** (le BNC est sensiblement plus élevé en 2026). À revérifier sur urssaf.fr. | ⚠️ |
| Repères pyramide (`SMIC Net 1398`, médian 2100…) | codés en dur | SMIC net ≈ 1 470–1 480 € depuis juin 2026 (à recalculer) | ❌ |

**Incohérences visibles par l'utilisateur :**
- Onglet *Détails*, statut **Fonction publique** : les lignes affichées (pension civile 11,1 % + RAFP 5 % + CSG/CRDS) totalisent **≈ 25,8 %**, alors que le net est calculé à **16,7 %**. Par ailleurs, la RAFP ne porte que sur les primes.
- Profession libérale : `0.3567` dans le JSON, mais `0.45` en valeur de repli dans le hook.
- Site web : le footer affiche « Taux mis à jour le : **[date du jour]** » (`app/footer.tsx`). C'est **trompeur**, car la date est générée à l'exécution. La page `/info` indique pour sa part « valables au 1er mai 2025 ».

**Mise à jour automatique cassée :** le script `pnpm scrape` pointe vers `scripts/scrape-rates.ts`, qui **n'existe pas**. Seul `scrape-smic.ts` existe, et il cible le sélecteur `#Cas-general-2025`. Le workflow mensuel `update-rates.yml` échoue donc ou ne fait rien. Pour l'app, de toute façon, les taux sont **embarqués dans le binaire** : toute mise à jour passe par une nouvelle version (ou par EAS Update, voir §5).

### Tests

- 14 tests Vitest (`lib/convert.test.ts`), tous verts. Ils testent **`convert.ts`, qui n'est pas utilisé**, et le font de façon tautologique : ils recalculent `brut × (1 − taux)` à partir du même JSON.
- **0 test** sur les hooks web et mobile, ni sur les composants.
- Couverture effective de la logique réellement exécutée : **≈ 0 %**.
- Détail : Vitest exécute aussi `.claude/worktrees/**` (tests en double), à exclure.

### Dépendances tierces / réseau

| | Web | Mobile |
|---|---|---|
| Analytics / tracking | aucun (pas de GA, Vercel Analytics, Sentry…) | **aucun** |
| Cookies | aucun | n/a |
| Appels réseau | aucun au runtime (`next/font/google` est auto-hébergé au build) | **aucun** (JSON embarqué → fonctionne hors ligne) |
| Liens externes | urssaf.fr, insee.fr, service-public.fr, apec.fr, hellowork… | aucun |
| Paiement / dons | aucun | aucun |

---

## 2. Confrontation aux App Review Guidelines

| # | Point | Statut | Justification / action |
|---|---|---|---|
| 1 | **4.2 Minimum Functionality** | ⚠️ | **Atouts :** UI 100 % native (pas de WebView), 3 onglets (Calculateur, Détails avec décomposition et pyramide SVG, Comparateur CDI vs AE), mémorisation des derniers paramètres, hors ligne complet, dark mode automatique, partage natif. **Manques :** historique ❌, favoris ❌, comparateur de plusieurs salaires/offres ❌ (le comparateur actuel oppose un seul salaire à l'AE), widget ❌, haptics ❌. Le risque est modéré : les calculateurs sont une catégorie saturée, et un reviewer peut juger l'app équivalente au site. Ajouter 2 à 3 fonctions du §6 le rend faible. |
| 2 | **2.1 App Completeness** | ⚠️ | Pas de placeholder, de « bientôt » ni de lien mort dans l'app ✅. Restent à corriger : valeurs obsolètes (SMIC par défaut 11,65 €, repères de la pyramide), incohérence FP du §1, `SafeAreaView` de `react-native` (déprécié en RN 0.81, à remplacer par `react-native-safe-area-context`), clé `splash` héritée sans image (à configurer via le plugin `expo-splash-screen`). Le message « comparateur indisponible » pour AE est acceptable. Il faut aussi tester sur appareil physique (clavier décimal, virgule, champ vidé). |
| 3 | **5.1.1 Privacy** | ⚠️ | **Aucune politique de confidentialité** n'existe, ni sur le site ni dans l'app. Elle est obligatoire (URL dans App Store Connect + lien accessible dans l'app). Contenu : aucune donnée collectée ni transmise, stockage local des préférences uniquement, effaçable via « Réinitialiser » ou la désinstallation, contact. **App Privacy labels : « Data Not Collected »** (aucune catégorie cochée, pas de tracking). À héberger sur `dubrutaunet.fr/confidentialite` + `/support`. |
| 4 | **Privacy Manifest** | ⚠️ | Aucun manifeste propre à l'app pour l'instant. Pods concernés : AsyncStorage (`FileTimestamp` C617.1), React Native core (`UserDefaults` CA92.1, `FileTimestamp`, `SystemBootTime` 35F9.1), `expo-file-system`, `expo-constants`. Expo agrège les manifestes des pods au prebuild. Le plus sûr est de déclarer explicitement dans `app.json → ios.privacyManifests` : `NSPrivacyTracking: false`, `NSPrivacyCollectedDataTypes: []`, `NSPrivacyAccessedAPITypes` = UserDefaults **CA92.1**, FileTimestamp **C617.1**, SystemBootTime **35F9.1**, DiskSpace **E174.1** (ce dernier, demandé par certains pods Expo, est à confirmer dans le rapport de l'archive). Vérifier ensuite avec le « Privacy Report » de Xcode sur l'archive EAS. |
| 5 | **App Tracking Transparency** | ✅ | Aucun SDK de tracking, donc **pas d'ATT** à demander. Le garder ainsi : ne pas ajouter d'analytics tiers. Si un jour il en faut, choisir un outil sans IDFA ni fingerprinting et mettre à jour les labels. |
| 6 | **Comptes utilisateurs** | ✅ | Aucun compte, aucune authentification. La règle 5.1.1(v) (suppression de compte) ne s'applique pas. |
| 7 | **Exactitude des infos financières** | ⚠️ (le plus sensible) | Dans l'app, **aucune mention d'estimation sur l'écran principal**. La seule mention se trouve dans le comparateur déplié (« Simulation indicative »). Il n'y a ni source ni date de validité des taux, et les taux sont obsolètes ou incohérents (§1). **À faire :** mention permanente sous le résultat (« Estimation indicative — ne remplace pas votre bulletin de paie »), écran « Méthode & sources » (formule, taux par statut, date de validité « barème 2026 — SMIC au 1/06/2026 », liens Urssaf / service-public / mon-entreprise.urssaf.fr), et noms des statuts sans ambiguïté. Aucune autorisation réglementaire n'est requise, car il n'y a ni conseil financier ni crédit. Ajouter dans l'app des mentions légales minimales (éditeur, contact). |
| 8 | **Liens externes / paiement** | ✅ | Aucun lien de paiement ou de don, ni dans l'app ni sur le site. Les futurs liens vers les sources officielles sont autorisés. **Ne pas ajouter de lien « Soutenir le projet » / Ko-fi / Tipeee** (3.1.1 / 3.1.3). |
| 9 | **Statut DSA** | ✅ | Gratuit, zéro revenu, compte individuel, aucune activité commerciale : déclaration **« non-trader »** cohérente dans App Store Connect (obligatoire pour la distribution dans l'UE). À réévaluer si l'app est un jour monétisée ou mise en avant comme vitrine d'une activité professionnelle. |
| 10 | **Assets** | ⚠️ | Icône `mobile/assets/icon.png` **1024×1024, RGB, sans alpha** ✅ (conforme ; visuel générique, une version soignée améliorerait la conversion). Splash : couleur seule `#16A34A`, sans image (OK, mais à passer par le plugin). Captures : **aucune**, il faut le format iPhone **6,9"** (1320×2868 ou 1290×2796), 3 minimum, 5–6 recommandées. **`supportsTablet: true` → passer à `false`**, sinon Apple exige des captures iPad 13". `orientation: portrait` ✅. |

**Autres points de soumission à ne pas oublier :**
- `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`, pour éviter la question d'export à chaque build.
- Questionnaire de classification d'âge (nouveau format) : réponses « aucun » partout → 4+.
- Catégorie : *Finance* (principale), *Utilitaires* (secondaire).
- Fournir l'URL de support et des notes pour le reviewer : « Aucune connexion requise, toutes les données sont locales. »
- Build avec le SDK iOS exigé par Apple au moment de la soumission (Xcode 26 / SDK iOS 26 depuis avril 2026). Vérifier que l'image EAS utilisée par SDK 54 le respecte, ou monter au dernier SDK Expo stable avant de figer la v1.
- Bundle ID `com.dubrutaunet.mobile` : OK. Vérifier sa disponibilité dans App Store Connect.

---

## 3. Questions posées (réponses intégrées)

| Question | Réponse | Effet sur le verdict |
|---|---|---|
| Revenu direct ou indirect ? | Aucun | DSA non-trader ✅ |
| Type de compte Apple ? | Individuel | Pas de D-U-N-S. Ton nom apparaît comme vendeur. |
| Ambition du calcul v1 ? | Taux global + MAJ 2026 | Pas de moteur PASS/tranches ; la mention « estimation » devient indispensable. |
| Site en ligne ? | Oui | Confidentialité et support hébergés sur `dubrutaunet.fr` |

Questions restantes, sans effet sur le verdict mais à trancher avant la v1.1 :
- Faut-il un widget dès la v1 ? Il impose un *development build* avec une cible native (voir §6).
- Le blog doit-il apparaître dans l'app ? Recommandation : non, ou seulement en lien.

---

## 4. Code réutilisable vs à réécrire

### Réutilisable tel quel (ou presque)
- `data/rates_fr_2025.json` : le **format** est réutilisable ; à renommer en `rates_fr_2026.json`, à mettre à jour et à enrichir (`validFrom`, `sources`).
- La formule `net = brut × (1 − taux)` et les conversions de période (horaire/mensuel/annuel, `52/12`, temps partiel).
- `mobile/lib/storage.ts` (AsyncStorage + validation).
- `mobile/app/**`, `mobile/components/**`, `constants/theme.ts` : UI native déjà écrite, à corriger plutôt qu'à réécrire.
- `lib/schema.ts` (zod) : bornes de validation réutilisables côté mobile.
- Contenu textuel de `app/info/page.tsx` (méthode et sources), à porter en écran RN.

### À extraire / refactorer
- **Créer `shared/salary.ts`** (TS pur) pour remplacer `lib/convert.ts`, qui est du code mort, ainsi que les deux hooks divergents. Les hooks web et mobile deviennent des adaptateurs fins.
- Sortir les constantes codées en dur des composants (`GLOBAL_RATE`, `CHARGE_ITEMS`, `CHARGES_PATRONALES_RATE`, `BENCHMARKS`, `SMIC_2025`) vers le JSON des taux.
- Réécrire les tests sur `salary.ts` avec des **cas de référence externes** (ex. SMIC 2026 → net attendu, comparé au simulateur Urssaf, avec une tolérance) au lieu de tests tautologiques.

### Non portable / à écarter
- `components/ui/*` (Radix/shadcn), Tailwind, `ThemeToggle` (DOM).
- `PdfExporter` (html2canvas + jsPDF) : si besoin, le remplacer par `expo-print` + `expo-sharing`.
- Blog MDX (`next-mdx-remote`, `gray-matter`).
- Scripts puppeteer (outillage web, à corriger séparément).

---

## 5. Plan d'action (Expo + EAS Build + TestFlight)

| # | Étape | Estimation |
|---|---|---|
| 0 | **Hygiène du dépôt** : un seul gestionnaire de paquets, `mobile/node_modules` ignoré, suppression de `legacy-peer-deps` si possible, commit du travail mobile en cours sur une branche. `npx expo-doctor` vert. | 0,5 j |
| 1 | **Moteur partagé** `salary.ts` + taux 2026 (SMIC 12,31 €, taux par statut revérifiés sur urssaf.fr, repères de la pyramide recalculés), correction de l'incohérence FP, tests de référence. | 2 j |
| 2 | **Conformité contenu** : mention d'estimation permanente, écran « Méthode & sources » avec date de validité, mentions légales, lien vers la politique de confidentialité ; page `/confidentialite` + `/support` sur le site ; correction du footer web (vraie date `lastUpdate`). | 1 j |
| 3 | **Fonctionnalités 4.2** (§6, niveaux 1 à 3). | 2–3 j |
| 4 | **Config iOS** : `supportsTablet: false`, `privacyManifests`, `ITSAppUsesNonExemptEncryption: false`, plugin `expo-splash-screen` avec image, `buildNumber`, remplacement de `SafeAreaView` ; éventuellement montée au dernier SDK Expo. | 0,5–1 j |
| 5 | **EAS** : `eas init`, `eas.json` (profils `development` / `preview` / `production`), `eas credentials` (certificat de distribution + profil, gérés par EAS), création de l'app dans App Store Connect. | 0,5 j |
| 6 | **TestFlight** : `eas build -p ios --profile production` puis `eas submit -p ios`, test interne sur 2–3 iPhone réels (petit et grand écran, dark mode, VoiceOver, Dynamic Type), corrections. | 1–2 j |
| 7 | **Fiche App Store** : 5–6 captures 6,9", sous-titre, description, mots-clés, privacy labels « Data Not Collected », DSA non-trader, classification d'âge, notes au reviewer. | 1 j |
| 8 | **Soumission + marge de rejet** (review en 24–48 h en général ; prévoir 1 aller-retour). | 0,5–1 j |
| | **Total** | **≈ 9 à 12 jours** |

**Après la v1 :** configurer **EAS Update** (OTA) pour publier les nouveaux barèmes (JSON) sans repasser par la review. C'est autorisé tant que le comportement de l'app ne change pas (4.7 / 2.5.2). Réparer aussi le scraper (`scrape-rates.ts` manquant) et lui faire alimenter le JSON partagé.

---

## 6. Fonctionnalités minimales pour passer la 4.2 sans risque

Classées du moins au plus coûteux. **Les niveaux 1 à 4 suffisent** ; le widget est un bonus.

| Niveau | Fonctionnalité | Coût | Pourquoi elle compte pour le reviewer |
|---|---|---|---|
| 1 | **Haptics** (`expo-haptics`) : changement de statut, crans des sliders, réinitialisation, partage | 0,25 j | Ressenti natif immédiat |
| 2 | **Écran « Méthode & sources »** + réglage du thème (auto/clair/sombre) | 0,5 j | Valeur informative propre à l'app, couvre aussi le point 7 |
| 3 | **Historique local** : les N dernières simulations (AsyncStorage), avec rappel en un tap et suppression par glissement | 0,75 j | Fonction « app » qu'un site n'a pas, réutilise `storage.ts` |
| 4 | **Favoris / comparateur multi-offres** : épingler 2–3 simulations (« Offre A / B / C ») et les comparer côte à côte en net après impôt | 1–1,5 j | Cas d'usage concret (négociation, choix d'offre), différenciant |
| 5 | Saisie rapide : clavier avec bouton « OK », raccourcis (SMIC, PMSS), conversion journalière restaurée | 0,5 j | Polish |
| 6 | **Widget iOS** (dernier net calculé / favori) | 2–3 j | Très différenciant, mais exige un development build + cible WidgetKit (ex. `@bacons/apple-targets`), du Swift, et le partage d'App Group. **À garder pour la v1.1.** |

Déjà acquis, à mettre en avant dans les captures et les notes au reviewer : **mode hors ligne complet**, **dark mode automatique**, **partage natif**, **mémorisation des paramètres**, **aucune donnée collectée**.

---

### Sources (taux 2026)
- SMIC au 1/01/2026 (12,02 €) : [info.gouv.fr](https://www.info.gouv.fr/actualite/le-smic-revalorise-au-1er-janvier-2026), [Tissot](https://www.editions-tissot.fr/actualite/droit-du-travail/smic-au-1er-janvier-2026-une-hausse-de-1-18)
- SMIC au 1/06/2026 (12,31 €, 1 867,02 €/mois, JO du 24/05/2026) : [Gazette du Palais](https://www.labase-lextenso.fr/gazette-du-palais/2026-n20/revalorisation-du-smic-au-1er-juin-2026-et-gel-du-bareme-des-allegements-generaux-GPL492b6), [JO 24/05/2026 (PDF)](https://www.ghr.fr/IMG/pdf/joe_20260524_0121_0012.pdf). À confirmer sur Légifrance avant la mise à jour du JSON.
- PASS 2026 (48 060 € / 4 005 €) : [Previssima](https://www.previssima.fr/actualite/cest-officiel-le-pass-setablira-bien-a-48-060-au-1er-janvier-2026.html), [Legisocial](https://www.legisocial.fr/reperes-sociaux/plafond-securite-sociale-2026.html)
