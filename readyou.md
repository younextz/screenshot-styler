# Screenshot Styler

A focused web tool that lets you **paste or upload screenshots**, **apply preset styles**, pick **color palettes**, toggle **title bars**, choose **aspect ratios**, and **export as PNG** with copy-to-clipboard or download functionality.

## ✨ Features

- **📸 Easy Input**: Paste from clipboard (⌘/Ctrl+V) or upload PNG/JPG files (up to 10MB)
- **🎨 12 Style Presets**: From subtle gradients to device frames and browser windows
- **🌈 16+ Color Palettes**: Curated color schemes including JetBrains-inspired themes
- **💻 Title Bar Options**: macOS, Windows, or no title bar styling
- **📐 Aspect Ratios**: Auto, 1:1, 16:9, 4:3, 9:16, and social media optimized (1200×630)
- **📋 Smart Export**: Copy PNG to clipboard or download, with intelligent fallbacks
- **🔒 Privacy First**: No image storage, no authentication, no analytics - everything processed in-memory
- **⚡ Fast Performance**: Client-side SVG preview with server-side PNG rendering

## 🚀 Quick Start

### Prerequisites

- Node.js (18+ recommended) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Python 3.11+ (for backend)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd screenshot-styler
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Backend setup** (if running full-stack locally)
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to start styling screenshots!

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **SVG-based rendering** for crisp, scalable previews

### Backend (Optional for full features)
- **FastAPI** (Python 3.11)
- **Pillow** for image processing
- **cairosvg** for SVG to PNG rasterization
- **In-memory processing** (no file storage)

## 🎯 How It Works

1. **Upload/Paste**: Add your screenshot via clipboard or file picker
2. **Style**: Choose from 12 presets (gradients, device frames, cards, etc.)
3. **Customize**: Pick color palettes, toggle title bars, set aspect ratios
4. **Preview**: See real-time SVG preview with your changes
5. **Export**: Copy to clipboard or download PNG at highest quality

## 🔧 Key Design Principles

- **No Cropping**: Screenshots are never cropped, always contained with generous padding
- **Highest Resolution**: Export maintains original quality without upscaling
- **Privacy Focused**: Images never stored on servers or disk
- **Accessibility**: Keyboard navigation and WCAG AA compliance
- **Cross-Browser**: Works on Chromium and Safari with appropriate fallbacks

## 📚 Documentation

Detailed specifications and build instructions can be found in [`/docs/agent_instructions.md`](./docs/agent_instructions.md).

## 🎨 Style Presets

- **Gradient Soft/Bold**: Subtle to vibrant gradient backgrounds
- **Mesh Gradient**: Multi-stop mesh gradient effects  
- **Blob Duo/Trio**: Artistic blurred blob backgrounds
- **Dot Grid**: Subtle pattern backgrounds
- **Browser macOS/Windows**: Realistic browser frame styling
- **Device Laptop/Phone**: Generic device bezels
- **Card Elevated/Outlined**: Floating card and outline effects

## 🌈 Color Palettes

16+ curated color palettes including:
- JetBrains Dark
- Neutral tones
- Bold neons  
- Soft pastels
- Professional muted colors

## 📖 Usage Examples

1. **Social Media Posts**: Style screenshots for Twitter, LinkedIn, etc.
2. **Documentation**: Create polished images for READMEs and docs
3. **Presentations**: Professional screenshot styling for slides
4. **Portfolio**: Showcase app interfaces with beautiful backgrounds
5. **Bug Reports**: Frame screenshots for clear issue communication

## 🔒 Privacy & Security

- **No Data Retention**: Images are processed in-memory only
- **No Authentication**: Use immediately without accounts
- **No Analytics**: No tracking or usage monitoring  
- **Rate Limited**: 60 requests per minute per IP for fair usage
- **Secure Headers**: CSP, CORS, and other security measures implemented

## 🚀 Deployment

This project can be deployed to any modern hosting platform:

- **Frontend**: Deploy to Vercel, Netlify, or similar static hosting
- **Backend**: Deploy to Railway, Heroku, or containerized environments
- **Full-Stack**: Use Docker for complete deployment setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Important Notes

- **File Size Limit**: 10MB maximum per image
- **Supported Formats**: PNG and JPG only
- **Browser Compatibility**: Chromium and Safari supported
- **Clipboard Access**: May require permissions in some browsers

---

Made with ❤️ for beautiful screenshot styling