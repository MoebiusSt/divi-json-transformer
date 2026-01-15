# Build-Konfiguration & Wichtige Hinweise

## ⚠️ WICHTIG: Fehlende Konfigurationsdateien

Das Source-Code-Archiv enthält **NICHT** alle Konfigurationsdateien. Hier sind die fehlenden Dateien und wie du sie erstellst:

---

## 📋 Fehlende Dateien beim ersten Setup

### 1. **tailwind.config.ts** (FEHLT - muss erstellt werden!)

Erstelle diese Datei im Projektroot:

```typescript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 2. **src/index.css** (FEHLT oder unvollständig!)

Diese Datei muss Tailwind CSS Variablen enthalten:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 3. **vite.config.ts** (muss erweitert werden für Path Aliases!)

Ersetze die existierende Datei mit:

```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 4. **tsconfig.json** (muss Path Aliases haben!)

Stelle sicher, dass die Datei diese Einträge hat:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5. **tsconfig.node.json** (FEHLT - für Vite Config!)

Erstelle diese Datei:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 🔧 Setup-Prozess (Schritt für Schritt)

### Schritt 1: Source Code entpacken
```bash
tar -xzf divi-json-transformer-source.tar.gz
cd divi-json-transformer-integrated
```

### Schritt 2: Fehlende Config-Dateien erstellen
Erstelle die oben genannten Dateien:
- `tailwind.config.ts`
- `src/index.css` (erweitern)
- `vite.config.ts` (ersetzen)
- `tsconfig.json` (erweitern)
- `tsconfig.node.json` (neu)

### Schritt 3: Dependencies installieren
```bash
pnpm install
# oder
npm install
```

### Schritt 4: Development starten
```bash
pnpm dev
# oder
npm run dev
```

---

## 📦 Build-Optionen

### Option 1: Standard Vite Build (empfohlen für Development)
```bash
pnpm build
```
Output: `dist/` Ordner mit mehreren Dateien

### Option 2: Single HTML File (wie die veröffentlichte Version)
Hierfür wird der **artifacts-builder** Bundling-Prozess verwendet:

#### 2a. Mit dem artifacts-builder Script (wenn verfügbar):
```bash
bash /mnt/skills/examples/web-artifacts-builder/scripts/bundle-artifact.sh
```

#### 2b. Manueller Parcel Build (wenn Script nicht verfügbar):
```bash
# 1. Installiere Bundle-Dependencies (wenn noch nicht geschehen)
pnpm add -D @parcel/config-default html-inline parcel

# 2. Erstelle .parcelrc (falls nicht vorhanden)
echo '{"extends": "@parcel/config-default"}' > .parcelrc

# 3. Build mit Parcel
pnpm parcel build index.html --dist-dir dist --no-source-maps

# 4. Inline alles in eine HTML-Datei
npx html-inline dist/index.html > bundle.html
```

---

## ⚙️ Wichtige Abhängigkeiten

### Kritische Dependencies (müssen installiert sein):
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.562.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "postcss": "^8.5.6",
    "tailwindcss": "3.4.1",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "~5.9.3",
    "vite": "^7.2.4"
  }
}
```

### Für Single-HTML-Build zusätzlich:
```json
{
  "devDependencies": {
    "@parcel/config-default": "^2.16.3",
    "html-inline": "^1.2.0",
    "parcel": "^2.16.3"
  }
}
```

---

## 🐛 Häufige Probleme & Lösungen

### Problem 1: "Cannot find module '@/...'"
**Lösung**: Path Aliases fehlen in `vite.config.ts` und `tsconfig.json`
- Siehe Konfigurationen oben

### Problem 2: "Unknown at rule: @tailwind"
**Lösung**: `postcss.config.js` fehlt oder ist falsch konfiguriert
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Problem 3: Tailwind-Styles funktionieren nicht
**Lösung**: 
1. `tailwind.config.ts` fehlt oder unvollständig
2. CSS-Variablen in `src/index.css` fehlen
3. Content-Pfade in Tailwind Config prüfen

### Problem 4: "Failed to resolve 'react'"
**Lösung**: Dependencies nicht installiert
```bash
pnpm install
```

### Problem 5: TypeScript-Fehler bei Path Aliases
**Lösung**: `tsconfig.json` und `tsconfig.app.json` müssen beide Path Aliases haben
```json
"compilerOptions": {
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

---

## 🎨 Tailwind CSS Besonderheiten

### 1. Content Configuration
Tailwind muss wissen, wo es nach Klassen suchen soll:
```typescript
content: [
  './src/**/*.{ts,tsx}',
]
```

### 2. CSS Variables
Die App nutzt CSS-Variablen für das shadcn/ui Theme-System.
Ohne die Variablen in `src/index.css` funktionieren die UI-Komponenten nicht korrekt.

### 3. Animation Plugin
`tailwindcss-animate` wird für Radix UI Animationen benötigt:
```bash
pnpm add -D tailwindcss-animate
```

---

## 📝 Vollständige Setup-Checkliste

- [ ] Source Code entpackt
- [ ] `tailwind.config.ts` erstellt
- [ ] `src/index.css` mit CSS-Variablen ergänzt
- [ ] `vite.config.ts` mit Path Aliases aktualisiert
- [ ] `tsconfig.json` mit Path Aliases aktualisiert
- [ ] `tsconfig.node.json` erstellt
- [ ] `postcss.config.js` vorhanden
- [ ] `pnpm install` ausgeführt
- [ ] `pnpm dev` startet ohne Fehler
- [ ] Alle UI-Komponenten werden korrekt gerendert
- [ ] Tailwind-Styles funktionieren

---

## 🔍 Debugging-Tipps

### Development Server startet nicht:
```bash
# TypeScript Fehler prüfen
pnpm tsc --noEmit

# Vite Log mit Details
pnpm dev --debug
```

### Styles fehlen im Build:
```bash
# PostCSS manuell testen
npx postcss src/index.css -o test.css

# Tailwind Content prüfen
npx tailwindcss -i src/index.css -o test.css --watch
```

### Import-Fehler:
```bash
# Alle @/ Imports finden
grep -r "from '@/" src/

# Node modules neu installieren
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 🌍 Production Build Unterschiede

### Vite Build:
- Erstellt: `dist/index.html` + separate JS/CSS Dateien
- Benötigt: Webserver zum Hosten
- Vorteile: Schneller, Code-Splitting, besseres Caching

### Parcel + html-inline Build:
- Erstellt: Eine einzelne `bundle.html` Datei
- Benötigt: Nur Browser (kann offline verwendet werden)
- Vorteile: Portabel, keine Server-Konfiguration nötig
- **Das ist die Version, die veröffentlicht wurde!**

---

## 📚 Zusätzliche Ressourcen

- **Vite**: https://vite.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Radix UI**: https://radix-ui.com
- **Parcel**: https://parceljs.org

---

## ⚠️ Zusammenfassung der kritischsten Punkte

1. **`tailwind.config.ts` MUSS erstellt werden** - ohne diese funktioniert Tailwind nicht
2. **CSS-Variablen in `src/index.css` MÜSSEN vorhanden sein** - sonst keine UI-Komponenten-Styles
3. **Path Aliases (`@/*`) MÜSSEN in `vite.config.ts` UND `tsconfig.json` sein** - sonst Import-Fehler
4. **Alle Radix UI Dependencies MÜSSEN installiert sein** - siehe package.json
5. **`postcss.config.js` MUSS vorhanden sein** - für Tailwind-Processing

Wenn diese 5 Punkte erfüllt sind, sollte der Build problemlos funktionieren! 🎉
