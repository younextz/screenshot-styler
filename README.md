# Screenshot Styler

Screenshot Styler is a focused web tool for turning raw screenshots into polished visuals. Paste or upload an image, try curated presets, tweak colors, and export a share-ready frame without leaving your browser.

## ✨ Highlights

- **Effortless input** – Drop files, use the uploader, or paste directly with ⌘/Ctrl + V. Images up to 10 MB are processed entirely in-browser.
- **Updated styling presets** – Twelve modern backgrounds, device frames, and card treatments refreshed with softer gradients and cleaner spacing.
- **Palette refresh** – Sixteen+ curated color palettes with automatic light/dark defaults that react to the theme.
- **Granular layout control** – Toggle macOS/Windows chrome, lock aspect ratios (auto, square, 16:9, 4:3), and persist your go-to setup between sessions.
- **Expanded export options** – Copy PNGs to the clipboard, download at original resolution, upscale to 4K, or grab the raw SVG for vector workflows.
- **Theme-aware UI** – New light theme, system preference detection, and a header toggle with local persistence.

### What’s new this month

- Rebuilt workspace layout keeps the live preview visible alongside the control panel for faster iteration.
- Added SVG + 4K PNG export buttons with resilient fallbacks when clipboard permissions are denied.
- Introduced the theme system, including accessible toggle tests and saved preferences.
- Brought in tweet visualization building blocks for future social post workflows, backed by a Vitest suite.

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or newer (use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for painless installs)
- npm (bundled with Node) or an equivalent package manager

### Develop locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd screenshot-styler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Vite in dev mode**
   ```bash
   npm run dev
   ```

4. **Open the app** at [http://localhost:5173](http://localhost:5173) and begin styling.

### Run the dev server anytime

Once dependencies are installed you can jump straight back into development:

```bash
npm run dev
```

This launches Vite’s hot-reloading server (default port `5173`) so you can preview live changes as you tweak components or styles.

### Useful scripts

- `npm run build` – production bundle
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint on the project
- `npm run test` – execute the Vitest suite (Tweet loader/theme toggle coverage)

## 🛠️ Technology Stack

- **React 18 + TypeScript** for the interactive UI
- **Vite** for lightning-fast dev tooling
- **Tailwind CSS & shadcn/ui** for accessible, composable components
- **lucide-react & sonner** for icons and non-blocking toasts
- **Vitest + Testing Library** for fast component-level tests

## 🎯 How it works

1. **Import** – Paste or upload your screenshot (PNG/JPG, ≤10 MB)
2. **Style** – Pick a preset, refine color palettes, and adjust chrome/aspect ratio controls
3. **Preview** – Real-time SVG rendering keeps edits crisp at any size
4. **Export** – Copy to clipboard, download PNG (original or 4K), or export the SVG

## 🔧 Design principles

- **Client-only processing** – Images never leave the browser, ensuring privacy by default
- **Resolution aware** – Smart padding avoids cropping while maintaining aspect ratio
- **Accessible defaults** – Keyboard-friendly controls, WCAG-conscious color choices, and theme toggle support
- **Consistent spacing** – Updated layout keeps preview gutters and padding balanced across presets

## 🎨 Presets & palettes

- **Backgrounds** – Soft/Bold gradient, mesh gradient, blob duo/trio, dot grid
- **Frames** – macOS/Windows browsers, laptop and phone shells
- **Cards** – Elevated and outlined presentations for UI snippets
- **Palettes** – From JetBrains Dark and Minimal Gray to Ocean Blue, Retro Wave, Candy Pop, and Soft Pastel (16+ total)

## 📚 Additional documentation

More detailed specifications live in [`docs/agent_instructions.md`](./docs/agent_instructions.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Released under the MIT License. See [LICENSE](./LICENSE) for details.

---

Made with ❤️ for beautiful screenshot styling
