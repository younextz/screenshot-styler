# Screenshot Styler

[English](README.md) · Español

Una herramienta web enfocada que te permite **pegar o subir capturas de pantalla**, **aplicar estilos predefinidos**, elegir **paletas de colores**, alternar **barras de título**, seleccionar **relaciones de aspecto** y **exportar como PNG** con opción de copiar al portapapeles o descargar.

## ✨ Características

- **📸 Entrada sencilla**: Pega desde el portapapeles (⌘/Ctrl+V) o sube archivos PNG/JPG (hasta 10 MB)
- **🎨 12 estilos predefinidos**: Desde degradados sutiles hasta marcos de dispositivos y ventanas de navegador
- **🌈 16+ paletas de color**: Esquemas curados, incluyendo temas inspirados en JetBrains
- **💻 Barras de título**: Estilo macOS, Windows o sin barra
- **📐 Relaciones de aspecto**: Automática, 1:1, 16:9, 4:3, 9:16 y optimizado para redes sociales (1200×630)
- **📋 Exportación inteligente**: Copia PNG al portapapeles o descarga, con alternativas automáticas
- **🔒 Privacidad primero**: Sin almacenamiento de imágenes, sin autenticación, sin analíticas; todo se procesa en memoria
- **⚡ Alto rendimiento**: Vista previa en SVG del lado del cliente y renderizado a PNG en el servidor

## 🚀 Inicio rápido

### Requisitos previos

- Node.js (18+ recomendado) — instala con `nvm` ([guía](https://github.com/nvm-sh/nvm#installing-and-updating))
- Python 3.11+ (para el backend)

### Entorno de desarrollo

1. **Clona el repositorio**
   ```bash
   git clone <repository-url>
   cd screenshot-styler
   ```

2. **Instala las dependencias del frontend**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Configura el backend** (si quieres ejecutar el stack completo localmente)
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

5. **Abre el navegador**
   Ve a `http://localhost:5173` para empezar a estilizar tus capturas.

## 🛠️ Tecnologías

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo y build rápidos
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes de interfaz
- **Renderizado basado en SVG** para vistas previas nítidas y escalables

### Backend (opcional para características completas)
- **FastAPI** (Python 3.11)
- **Pillow** para procesamiento de imágenes
- **cairosvg** para rasterizar de SVG a PNG
- **Procesamiento en memoria** (sin almacenamiento de archivos)

## 🎯 Cómo funciona

1. **Sube/Pega**: Añade tu captura desde el portapapeles o el selector de archivos
2. **Aplica estilo**: Elige entre 12 presets (degradados, marcos de dispositivos, tarjetas, etc.)
3. **Personaliza**: Paletas de colores, barras de título, relación de aspecto
4. **Previsualiza**: Cambios en tiempo real con una vista previa SVG
5. **Exporta**: Copia al portapapeles o descarga el PNG con máxima calidad

## 🔧 Principios de diseño clave

- **Sin recortes**: Las capturas nunca se recortan; siempre se contienen con un padding generoso
- **Máxima resolución**: La exportación mantiene la calidad original sin reescalado
- **Enfoque en privacidad**: Las imágenes nunca se almacenan en servidores ni en disco
- **Accesibilidad**: Navegación por teclado y cumplimiento WCAG AA
- **Multinavegador**: Funciona en Chromium y Safari con alternativas adecuadas

## 📚 Documentación

Las especificaciones detalladas e instrucciones de compilación están en [`/docs/agent_instructions.md`](./docs/agent_instructions.md).

## 🎨 Estilos predefinidos

- **Gradient Soft/Bold**: Degradados sutiles a vibrantes
- **Mesh Gradient**: Efectos de degradado en malla de múltiples paradas
- **Blob Duo/Trio**: Fondos artísticos con blobs difuminados
- **Dot Grid**: Patrones sutiles de puntos
- **Browser macOS/Windows**: Marcos de navegador realistas
- **Device Laptop/Phone**: Biseles genéricos de dispositivos
- **Card Elevated/Outlined**: Tarjeta flotante y estilo con borde

## 🌈 Paletas de colores

Más de 16 paletas curadas, incluyendo:
- JetBrains Dark
- Tonos neutros
- Neones llamativos
- Pasteles suaves
- Colores profesionales y sobrios

## 📖 Casos de uso

1. **Redes sociales**: Prepara capturas para Twitter, LinkedIn, etc.
2. **Documentación**: Imágenes pulidas para READMEs y docs
3. **Presentaciones**: Capturas con estilo profesional para diapositivas
4. **Portafolio**: Muestra interfaces con fondos atractivos
5. **Reportes de bugs**: Enmarca capturas para comunicar issues con claridad

## 🔒 Privacidad y seguridad

- **Sin retención de datos**: Las imágenes se procesan solo en memoria
- **Sin autenticación**: Úsalo inmediatamente, sin cuentas
- **Sin analíticas**: Sin tracking ni monitoreo de uso
- **Limitación de tasa**: 60 solicitudes por minuto por IP para uso justo
- **Encabezados seguros**: CSP, CORS y otras medidas de seguridad implementadas

## 🚀 Despliegue

Este proyecto se puede desplegar en cualquier plataforma moderna:

- **Frontend**: Vercel, Netlify u hosting estático similar
- **Backend**: Railway, Heroku o entornos contenedorizados
- **Full‑Stack**: Usa Docker para un despliegue completo

## 🤝 Contribuir

1. Haz un fork del repositorio
2. Crea una rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Sube tu rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## ⚠️ Notas importantes

- **Tamaño máximo de archivo**: 10 MB por imagen
- **Formatos soportados**: PNG y JPG
- **Compatibilidad de navegador**: Chromium y Safari soportados
- **Acceso al portapapeles**: Puede requerir permisos en algunos navegadores

---

Hecho con ❤️ para estilizar capturas de pantalla con belleza.