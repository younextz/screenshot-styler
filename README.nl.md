# Screenshot Styler

Screenshot Styler is een browsergebaseerde tool om gewone screenshots om te zetten naar verzorgde visuals.
Voeg een afbeelding toe (of haal een tweet op), pas een preset en kleurenpalet toe, stel de kaders in en exporteer direct deelbare bestanden.

## Hoogtepunten

- Lokale verwerking: afbeeldingen blijven in je browser.
- Flexibele invoer: upload PNG/JPG, plak vanuit klembord, of haal tweetinhoud op via oEmbed.
- Uitgebreide stijlopties: kleurovergangen, mesh, effen kleuren, patronen, foto-achtergronden, browser-/apparaatkaders en kaartlay-outs.
- Thema-bewuste UI: donkere/lichte modus met opgeslagen voorkeur.
- Exportformaten: kopieer PNG naar klembord, download PNG, download 4K PNG, of exporteer SVG.
- Opgeslagen instellingen: preset, palet, titelbalkstijl, beeldverhouding en animatieknop worden lokaal opgeslagen.

## Snel starten

### Vereisten

- Node.js 18+
- npm

### Lokaal uitvoeren

```bash
npm install
npm run dev
```

De app draait op [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` - start Vite-ontwikkelserver
- `npm run build` - bouw productiebundel
- `npm run preview` - bekijk de productiebuild
- `npm run lint` - voer ESLint uit
- `npm run typecheck` - voer TypeScript-controles uit
- `npm run test -- --run` - voer Vitest-suite eenmalig uit

## Hoe het werkt

1. Importeer een afbeelding (upload/plak) of haal tweetinhoud op.
2. Kies een stijlpreset en kleurenpalet.
3. Pas de titelbalk, beeldverhouding en animatie-opties aan.
4. Exporteer PNG/SVG vanuit de live SVG-preview.

## Presets en paletten

- 25 presets verdeeld over achtergrond-, kader- en kaartcategorieën.
- 20+ samengestelde paletten voor donkere, lichte, levendige en minimalistische uitstraling.

## Testnotities

- Voer lint, typecheck en tests uit vóór het committen:

```bash
npm run lint
npm run typecheck
TMPDIR=/tmp npm run test -- --run
```

## Licentie

MIT - zie [LICENSE](./LICENSE).
