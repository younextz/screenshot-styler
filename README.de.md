# Screenshot Styler

Ein fokussiertes Web-Tool, mit dem Sie **Screenshots einfügen oder hochladen**, **Vorlagen-Stile anwenden**, **Farbpaletten auswählen**, **Titelleisten umschalten**, **Seitenverhältnisse wählen** und **als PNG exportieren** können - mit Kopieren-in-Zwischenablage oder Download-Funktionalität.

## ✨ Funktionen

- **📸 Einfache Eingabe**: Aus Zwischenablage einfügen (⌘/Strg+V) oder PNG/JPG-Dateien hochladen (bis zu 10MB)
- **🎨 12 Stil-Vorlagen**: Von subtilen Verläufen bis hin zu Geräte-Rahmen und Browser-Fenstern
- **🌈 16+ Farbpaletten**: Kuratierte Farbschemata einschließlich JetBrains-inspirierter Themes
- **💻 Titelleisten-Optionen**: macOS, Windows oder keine Titelleisten-Gestaltung
- **📐 Seitenverhältnisse**: Auto, 1:1, 16:9, 4:3, 9:16 und für soziale Medien optimiert (1200×630)
- **📋 Intelligenter Export**: PNG in Zwischenablage kopieren oder herunterladen, mit intelligenten Fallback-Optionen
- **🔒 Datenschutz zuerst**: Keine Bildspeicherung, keine Authentifizierung, keine Analytik - alles wird im Arbeitsspeicher verarbeitet
- **⚡ Schnelle Performance**: Client-seitige SVG-Vorschau mit Server-seitiger PNG-Rendering
- **🌍 Mehrsprachig**: Verfügbar auf Deutsch und Englisch

## 🚀 Schnellstart

### Voraussetzungen

- Node.js (18+ empfohlen) - [mit nvm installieren](https://github.com/nvm-sh/nvm#installing-and-updating)
- Python 3.11+ (für Backend)

### Entwicklungsumgebung einrichten

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd screenshot-styler
   ```

2. **Frontend-Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

4. **Backend-Setup** (wenn vollständig lokal ausgeführt)
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

5. **Browser öffnen**
   Navigieren Sie zu `http://localhost:5173`, um mit dem Styling von Screenshots zu beginnen!

## 🛠️ Technologie-Stack

### Frontend
- **React 18** mit TypeScript
- **Vite** für schnelle Entwicklung und Build-Prozess
- **Tailwind CSS** für Styling
- **shadcn/ui** für UI-Komponenten
- **SVG-basiertes Rendering** für scharfe, skalierbare Vorschauen

### Backend (Optional für vollständige Funktionen)
- **FastAPI** (Python 3.11)
- **Pillow** für Bildverarbeitung
- **cairosvg** für SVG-zu-PNG-Rasterung
- **Arbeitsspeicher-Verarbeitung** (keine Dateispeicherung)

## 🎯 Funktionsweise

1. **Hochladen/Einfügen**: Screenshot über Zwischenablage oder Dateiauswahl hinzufügen
2. **Styling**: Aus 12 Vorlagen wählen (Verläufe, Geräte-Rahmen, Karten, etc.)
3. **Anpassen**: Farbpaletten auswählen, Titelleisten umschalten, Seitenverhältnisse festlegen
4. **Vorschau**: Echtzeit-SVG-Vorschau Ihrer Änderungen sehen
5. **Export**: In Zwischenablage kopieren oder PNG in höchster Qualität herunterladen

## 🔧 Zentrale Design-Prinzipien

- **Kein Zuschneiden**: Screenshots werden niemals zugeschnitten, immer mit großzügigem Abstand dargestellt
- **Höchste Auflösung**: Export behält ursprüngliche Qualität ohne Hochskalierung bei
- **Datenschutz-fokussiert**: Bilder werden niemals auf Servern oder Festplatten gespeichert
- **Barrierefreiheit**: Tastaturnavigation und WCAG AA-Konformität
- **Cross-Browser**: Funktioniert auf Chromium und Safari mit entsprechenden Fallbacks

## 📚 Dokumentation

Detaillierte Spezifikationen und Build-Anweisungen finden Sie in [`/docs/agent_instructions.md`](./docs/agent_instructions.md).

## 🎨 Stil-Vorlagen

- **Verlauf Weich/Kräftig**: Subtile bis lebendige Verlaufs-Hintergründe
- **Mesh-Verlauf**: Multi-Stop-Mesh-Verlaufseffekte  
- **Blob Duo/Trio**: Künstlerische, verschwommene Blob-Hintergründe
- **Punkt-Raster**: Subtile Muster-Hintergründe
- **Browser macOS/Windows**: Realistische Browser-Rahmen-Gestaltung
- **Gerät Laptop/Handy**: Generische Geräte-Umrandungen
- **Karte Erhöht/Umrandet**: Schwebende Karten- und Umrandungseffekte

## 🌈 Farbpaletten

16+ kuratierte Farbpaletten einschließlich:
- JetBrains Dark
- Neutrale Töne
- Kräftige Neons  
- Sanfte Pastelltöne
- Professionelle gedämpfte Farben

## 📖 Anwendungsbeispiele

1. **Social Media Posts**: Screenshots für Twitter, LinkedIn etc. stylen
2. **Dokumentation**: Polierte Bilder für READMEs und Docs erstellen
3. **Präsentationen**: Professionelles Screenshot-Styling für Folien
4. **Portfolio**: App-Interfaces mit schönen Hintergründen präsentieren
5. **Fehlerberichte**: Screenshots für klare Problem-Kommunikation rahmen

## 🔒 Datenschutz & Sicherheit

- **Keine Datenaufbewahrung**: Bilder werden nur im Arbeitsspeicher verarbeitet
- **Keine Authentifizierung**: Sofort ohne Konten nutzbar
- **Keine Analytik**: Kein Tracking oder Nutzungsüberwachung  
- **Ratenbegrenzung**: 60 Anfragen pro Minute pro IP für faire Nutzung
- **Sichere Header**: CSP, CORS und andere Sicherheitsmaßnahmen implementiert

## 🚀 Deployment

Dieses Projekt kann auf jeder modernen Hosting-Plattform deployed werden:

- **Frontend**: Deploy auf Vercel, Netlify oder ähnlichem Static Hosting
- **Backend**: Deploy auf Railway, Heroku oder containerisierten Umgebungen
- **Full-Stack**: Docker für komplettes Deployment-Setup verwenden

## 🤝 Mitwirken

1. Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Zum Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die LICENSE-Datei für Details.

## ⚠️ Wichtige Hinweise

- **Dateigrößenlimit**: Maximal 10MB pro Bild
- **Unterstützte Formate**: Nur PNG und JPG
- **Browser-Kompatibilität**: Chromium und Safari unterstützt
- **Zwischenablage-Zugriff**: Kann in einigen Browsern Berechtigungen erfordern

---

Mit ❤️ für schönes Screenshot-Styling erstellt

## 🌍 Verfügbare Sprachen

- [English](./README.md)
- [Deutsch](./README.de.md) (Diese Datei)