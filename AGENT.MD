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

## Workflow: Kompilieren & Deployen

Das Projekt nutzt Vite mit dem `vite-plugin-singlefile`, um eine einzelne HTML-Datei ohne externe Abhängigkeiten zu erzeugen.

1.  **Terminal öffnen** und in das Source-Verzeichnis wechseln:
    ```bash
    cd SOURCE
    ```

2.  **Build ausführen**:
    ```bash
    npm run build
    ```
    *   Dieser Befehl führt zuerst `tsc -b` (TypeScript Compiler) aus. Fehler hier (z.B. fehlende Übersetzungen) brechen den Build ab.
    *   Danach läuft `vite build`.

3.  **Deployment (Kopieren)**:
    Die generierte Datei liegt nun unter `SOURCE/dist/index.html`. Kopiere sie ins Root-Verzeichnis:
    *   PowerShell:
        ```powershell
        Copy-Item -Path "dist/index.html" -Destination "../divi-json-transformer.html" -Force
        ```

## Lessons Learned & Häufige Fehler

*   **TypeScript Build Errors**: Meistens fehlen Übersetzungsschlüssel in einer der Sprachen in `translations.ts`. Der Compiler ist hier sehr strikt (`TS2739`).
*   **Inline-Ressourcen**: CSS und JS werden in die HTML inlined. Bilder oder Assets müssen ggf. speziell behandelt werden, wenn sie nicht im Code importiert sind.
*   **DOM-Parser**: `transformer.ts` nutzt `DOMParser`. Das funktioniert im Browser-Kontext, ist aber keine volle Browser-Umgebung. Vorsicht bei komplexen Selektoren.
