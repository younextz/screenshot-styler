# Screenshot Styler

Screenshot Styler is een op browser gebaseerde tool voor het omzetten van gewone screenshots in gepolijste visualisaties.
Sleep een afbeelding (of haal tweetinhoud op), pas een voorinstelling en palet toe, stel framebesturingselementen in en exporteer kant-en-klare assets.

## Highlights

- Lokale verwerking: afbeeldingen blijven in uw browser.
- Flexibele invoer: upload PNG/JPG, plak vanuit het klembord, of haal tweetinhoud op via oEmbed.
- Uitgebreide stijlopties: verlopen, mesh, effen kleuren, patronen, afbeeldingsachtergrondelementen, browser-/apparaatkaders en kaartlay-outs.
- Thema-bewuste UI: donkere/lichte modus met persistent voorkeur.
- Exportformaten: kopieër PNG naar klembord, download PNG, download 4K PNG, of exporteer SVG.
- Bewaard gebleven besturingselementen: voorinstelling, palet, titelbalkbewerkingsmodus, hoogte-breedteverhouding en animatieknop worden lokaal opgeslagen.

## Snel Starten

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

- `npm run dev` - Vite dev server starten
- `npm run build` - productiepakket bouwen
- `npm run preview` - productiebuild bekijken
- `npm run lint` - ESLint uitvoeren
- `npm run typecheck` - TypeScript-controles uitvoeren
- `npm run test -- --run` - Vitest-suite eenmaal uitvoeren

## Hoe het werkt

1. Importeer een afbeelding (upload/plak) of haal tweetinhoud op.
2. Kies een stijlvoorinstelling en kleurenpalet.
3. Pas de titelbalk, hoogte-breedteverhouding en animatieopties aan.
4. Exporteer PNG/SVG uit het live SVG-voorbeeld.

## Voorinstellingen en Paletten

- 25 voorinstellingen in achtergrond-, frame- en kaartcategorieën.
- 20+ samengestelde paletten voor donkere, lichte, levendige en minimale looks.

## Testnotities

- Voer lint + typecheck + tests uit voordat u commit:

```bash
npm run lint
npm run typecheck
TMPDIR=/tmp npm run test -- --run
```

## Licentie

MIT - zie [LICENSE](./LICENSE).
