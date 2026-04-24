# AGENT.MD - Entwickler-Dokumentation & Workflow

Diese Datei dient als Schnelleinstieg und Gedächtnisstütze für die Weiterentwicklung des DIVI JSON Transformers.

## Projektstruktur

*   **Root**: `D:\Dropbox\Dev\Web Apps\Divi-JSON-transformer\`
    *   Enthält die fertige `divi-json-transformer.html` (das Produkt).
    *   Dokumentation (`README.md`, `Anleitung.md`).
*   **Source**: `SOURCE\`
    *   Dies ist das eigentliche Vite/React-Projekt.
    *   `src/`: Quellcode.
    *   `dist/`: Build-Output (wird nach dem Build hier erstellt).

## Workflow: Neues Feature hinzufügen

Um eine neue Funktion (z.B. eine neue Checkbox im Dev-Mode) hinzuzufügen, müssen folgende Dateien in dieser Reihenfolge bearbeitet werden:

### 1. Typ-Definitionen (`SOURCE/src/lib/types.ts`)
*   Erweitere das Interface `TransformSettings` um das neue Feld (z.B. `newFeature: boolean`).
*   Füge den Standardwert im Objekt `defaultSettings` hinzu.

### 2. Übersetzungen (`SOURCE/src/lib/translations.ts`)
*   **WICHTIG**: TypeScript erzwingt Vollständigkeit. Wenn du das Interface `Translations` erweiterst, **musst** du die neuen Keys sofort zu **allen** Sprachobjekten (`en`, `de`, `fr`, etc.) hinzufügen. Sonst schlägt der Build (`tsc`) fehl.
*   Erweitere das Interface `Translations`.
*   Füge die Texte zu `translations.en`, `translations.de` etc. hinzu.

### 3. UI / Settings (`SOURCE/src/components/Settings.tsx`)
*   Füge das Steuerelement (Checkbox, Input) an der passenden Stelle ein (z.B. im Dev-Mode Block).
*   Verbinde es mit dem State via `updateSettings`.

### 4. Logik (`SOURCE/src/lib/transformer.ts`)
*   Implementiere die eigentliche Logik.
*   Füge den Aufruf in `processHTML` (für DOM-Manipulationen) oder `processMarkup` (für Text-Manipulationen) ein.
*   Greife auf `settings.newFeature` zu, um die Logik bedingt auszuführen.

## Workflow: Build, Version Sync, and GitHub Pages Deploy

The project is hosted on GitHub Pages:
- Production URL: `https://moebiusst.github.io/divi-json-transformer/`
- Repository: `https://github.com/MoebiusSt/divi-json-transformer`

### Local Build Flow

1. Open terminal and switch to `SOURCE`:
   ```bash
   cd SOURCE
   ```
2. Run build:
   ```bash
   npm run build
   ```
3. Important:
   - `prebuild` runs `npm run sync-version` automatically.
   - `sync-version` reads `SOURCE/package.json` and updates:
     - `SOURCE/src/lib/version.ts` (`APP_VERSION`)
     - Root `README.md` version header and footer line
   - This keeps app subtitle/help text and README version in sync.

### GitHub Actions Deploy Flow

- Workflow file: `.github/workflows/deploy-pages.yml`
- Trigger:
  - Push to `main`
  - Manual run (`workflow_dispatch`) in GitHub Actions
- Build path: `SOURCE/`
- Deploy artifact: `SOURCE/dist`
- Pages source setting in GitHub must be `GitHub Actions`.

### Feature Release Rule (Agent)

For every user-requested feature change:
1. Bump version in `SOURCE/package.json` (semantic increment agreed with user).
2. Run `npm run build` (which also runs version sync).
3. Commit relevant files with a clear feature/release message.
4. Push to `origin/main` so GitHub Pages auto-deploy runs.
5. Confirm deployed version by checking the Pages site and/or Actions run.

## Lessons Learned & Häufige Fehler

*   **TypeScript Build Errors**: Meistens fehlen Übersetzungsschlüssel in einer der Sprachen in `translations.ts`. Der Compiler ist hier sehr strikt (`TS2739`).
*   **Inline-Ressourcen**: CSS und JS werden in die HTML inlined. Bilder oder Assets müssen ggf. speziell behandelt werden, wenn sie nicht im Code importiert sind.
*   **DOM-Parser**: `transformer.ts` nutzt `DOMParser`. Das funktioniert im Browser-Kontext, ist aber keine volle Browser-Umgebung. Vorsicht bei komplexen Selektoren.
