# Identité visuelle — Du Brut au Net

## Idée

**Passage net** matérialise la transformation au cœur du service : le « N » du net apparaît en réserve dans une forme pleine qui représente le brut. Le coin coupé introduit une notion de passage sans recourir aux clichés de la finance (pièce, flèche, balance ou bouclier).

## Versions

- **Signature horizontale** : version principale pour le site, les documents et les en-têtes.
- **Signature empilée** : pour les formats carrés ou verticaux.
- **Symbole** : pour les favicons, avatars, icônes d’application et espaces très contraints.
- **Mot-symbole** : lorsque le symbole est déjà présent dans le contexte.
- **Version blanche optique** : sur fond sombre ou vert. Elle compense l’effet d’irradiation des formes claires.
- **Version petits formats** : dessin renforcé pour les usages entre 16 et 24 px.

## Zone de protection

Conserver autour du logo une marge au moins égale à la largeur d’un montant vertical du « N » (32 unités dans le fichier maître). Aucun texte, bord ou élément graphique ne doit entrer dans cette zone.

## Tailles minimales

- Signature horizontale : **120 px** à l’écran ou **32 mm** en impression.
- Symbole standard : **24 px** à l’écran ou **7 mm** en impression.
- Entre 16 et 23 px : utiliser exclusivement `du-brut-au-net-symbol-small.svg` ou les favicons fournis.

## Couleurs

| Usage | Hex | RGB | CMJN approximatif |
| --- | --- | --- | --- |
| Vert Passage | `#16A34A` | 22, 163, 74 | 87, 0, 55, 36 |
| Vert écran sombre | `#22C55E` | 34, 197, 94 | 83, 0, 52, 23 |
| Encre | `#0F172A` | 15, 23, 42 | 64, 45, 0, 84 |
| Blanc | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 |

Le Vert Passage est la couleur principale sur fond clair. Sur fond très sombre, préférer le vert écran sombre ou la version blanche. Les équivalences CMJN sont des points de départ : faire valider une épreuve avant une production imprimée. Une correspondance Pantone doit être confirmée sur nuancier physique.

## Typographie

Le mot-symbole utilise **Geist** en graisse semi-bold, converti en tracés dans les fichiers finaux. Geist est distribué sous licence SIL Open Font License 1.1. Le site continue d’utiliser Geist via `next/font` pour préserver la cohérence typographique.

## Fonds autorisés

- Logo couleur sur blanc ou gris très clair.
- Logo blanc optique sur Vert Passage ou Encre.
- Logo noir monochrome pour les contraintes d’impression à une couleur.

Éviter les photographies chargées, les couleurs proches du vert principal et tout fond qui réduit le contraste.

## Usages interdits

- Ne pas étirer, incliner, retourner ou réorganiser les éléments.
- Ne pas modifier les couleurs hors des variantes fournies.
- Ne pas ajouter d’ombre, contour, dégradé ou effet 3D.
- Ne pas recomposer le mot-symbole avec une autre police.
- Ne pas utiliser la version standard sous 24 px.

## Fichiers

- `source/` : fichiers maîtres SVG en couleur et sur fond sombre.
- `digital/` : variantes SVG et PNG prêtes à l’emploi.
- `presentation/` : planche de présentation et mises en situation.
- `renders/` : aperçus raster de contrôle.

## Vérifications juridiques

La conception évite volontairement les symboles financiers génériques, mais elle ne constitue pas une recherche d’antériorité. Avant un dépôt de marque, effectuer une recherche de similarité visuelle et verbale auprès de l’INPI et, si nécessaire, de l’EUIPO.
