# DIVI JSON Transformer – Anleitung

## Kurzerklärung

Der **DIVI JSON Transformer** ist ein Browser-Werkzeug, das DIVI-Layout-Exporte (JSON-Dateien) automatisch umstrukturiert. Lange Text-Module, die aus dem InDesign-Export stammen und viele Absätze sowie Zwischenüberschriften enthalten, werden dabei intelligent in mehrere kleinere Text-Module aufgeteilt.

**Das Ergebnis:** Statt eines riesigen, unhandlichen Textblocks im DIVI-Builder erhält man sauber getrennte Module, die sich einzeln verschieben, formatieren und bearbeiten lassen.

**Wichtig:** Das Tool läuft zu 100% im Browser – es werden keine Daten an Server gesendet.

---

## Ausführliche Erklärung

### Warum dieses Tool?

Wenn Artikel aus InDesign als HTML exportiert und in WordPress/DIVI importiert werden, landet der gesamte Artikeltext oft in einem einzigen großen Text-Modul. Das macht die weitere Bearbeitung im DIVI-Builder umständlich, da man keine einzelnen Abschnitte verschieben oder unterschiedlich gestalten kann.

Der DIVI JSON Transformer löst dieses Problem, indem er **vor** der Arbeit im DIVI-Builder das Layout automatisch aufteilt.

### Der Workflow

```
1. DIVI-Seite als JSON exportieren
2. JSON-Datei mit dem Transformer verarbeiten
3. Die erzeugte *_output.json zurück in DIVI importieren
4. Im DIVI-Builder mit dem vorbereiteten Layout weiterarbeiten
```

---

## Die zwei Hauptmodi

### Normaler Modus

Der Normale Modus führt eine einfache Aufteilung durch:

- Text wird an den gewählten HTML-Elementen (Überschriften, Blockquotes, Listen) aufgetrennt
- Jeder Abschnitt wird zu einem eigenen Text-Modul
- **Keine neuen Zeilen-Module** werden eingefügt – alle neuen Text-Module landen in der bestehenden Zeile

**Geeignet für:** Einfache Artikel, bei denen nur die Blöcke mit Zwischenüberschriften in Text-Module getrennt werden sollen.

### Erweiterter Modus (Advanced)

Der Erweiterte Modus bietet zusätzliche Kontrolle:

- Alle Funktionen des Normalen Modus
- **Max. Module pro Zeile:** Fügt automatisch neue DIVI-Zeilen(!) ein, nachdem X Text-Module erstellt wurden
- **Max. Absätze pro Text-Modul:** Teilt Text-Module zusätzlich nach X Absatzen auf. (Für laaaaange Textwüsten)

**Geeignet für:** Komplexere Layouts, bei denen auch die Zeilenstruktur (ggfs Spalten) organisiert werden soll und mehr Einfügepunkte für Bilder erhalten soll.

#### Einstellung „Max. Module pro Zeile"

| Wert | Verhalten |
|------|-----------|
| 0 | Keine Zeilentrennung (wie Normaler Modus) |
| 1 | Nach jedem Text-Modul eine neue Zeile |
| 2 | Nach je zwei Text-Modulen eine neue Zeile |
| 3+ | Entsprechend mehr Module pro Zeile |

**Beispiel:** Bei einem Artikel mit 6 Textabschnitten und „Max. Module pro Zeile = 2" entstehen 3 Zeilen mit je 2 Text-Modulen.

---

## Trennstellen (Split Points)

Die Checkboxen für Trennstellen bestimmen, **an welchen HTML-Elementen** der Text aufgeteilt wird:

| Element | Typische Verwendung |
|---------|---------------------|
| **H1** | (sehr selten im Fließtext) |
| **H2** | (sehr selten im Fließtext) |
| **H3** | (Vielleicht mal bei Kästen |
| **H4** | **⚠️ Besonders wichtig!** Zwischenüberschriften |
| **H5** | Untergeordnete Überschriften |
| **H6** | Die meisten Infozeilen und Linkzeilen |
| **Blockquote** | Zitate |
| **OL/UL** | Nummerierte/Aufzählungslisten |

### ⚠️ Warum H4 fast immer aktiviert sein sollte

Der InDesign-Export erzeugt für die meisten **Zwischenüberschriften im Artikel H4-Tags**. Wenn H4 als Trennstelle deaktiviert ist, werden diese Überschriften nicht erkannt und der Text wird nicht an diesen Stellen getrennt.

**Empfehlung:** H4 standardmäßig aktiviert lassen, da es die häufigste Überschriftenebene aus InDesign-Exporten ist.

### Wann Trennstellen deaktivieren?

- **H6 deaktivieren:** Meist sollen diese im Textfluss bleiben
- **Listen deaktivieren:** Wenn Aufzählungen Teil des Fließtexts bleiben sollen
- **Blockquote deaktivieren:** Wenn Zitate nicht als separate Module erscheinen sollen

---

## DEV-Mode : Interview-Modus (nur für Eigengebrauch in Zwiefach.de)

Der Interview-Modus ist eine **Spezialfunktion für Zwiefach-Interview-Artikel**.

Aktiviert man die Checkbox **„Liste-zu-Blockquote Transformation"**, werden alle Listen (OL und UL) im Text automatisch in Blockquote-Elemente umgewandelt. 

Bei Zwiefach-Interviews werden Fragen und Antworten manchmal als Listenelemente formatiert. Der Interview-Modus wandelt diese in Blockquotes um, damit sie im DIVI-Layout als hervorgehobene Zitatblöcke erscheinen. (Divi-Presets auf zweifach.de reagieren darauf (> Text-Modul Preset "Interview")

**Wichtig:** Diesen Modus nur bei Interview-Artikeln für Zwiefach aktivieren – bei normalen Artikeln würde er reguläre Aufzählungen ungewollt in Zitate verwandeln.

---

## Weitere Optionen

### DEV-Mode : Fußnoten transformieren

Verarbeitet Fußnotenmarkierungen und Indizes im Text und erstellt eine hin- und rückverlinkte Fußnotenliste! Ist aber auch Eigengebrauch-Spezifisch nur für den Internene GEbracuh da er bestimmte HTML-Strukturen vorzufinden sucht und von Dritten angepasst werden müsste. Falls entsprechdende Fußnoten-Strukturen vorhanden sind, werden diese schön querverlinkt.

### Fragmentierte Tags zusammenführen

Bereinigt HTML-Code, der aus InDesign-Exporten manchmal schlechten Code und fragmentierte `<em>`- und `<span>`-Tags enthält. Diese werden zu sauberen, zusammenhängenden Tags zusammengeführt.

---

## Tutorial: Schritt-für-Schritt-Beispiel

### Szenario
Stephan hat einen neuen Artikel aus InDesign exportiert und in DIVI importiert. Der gesamte Artikeltext liegt nun in einem einzigen riesigen Text-Modul. Oder Du hast ein simples Basis-Layout mit einer Zeile und einem Text-Modul erstellt und den kompletten Text eingefügt und alle Zwischenüberschrifte liegen HTML-formaiert vor – als <h2></h2>, <h3></h3>, <h4></h4> etc., sonst kann das Skript nicht arbeiten.

### Schritt 1: JSON-Export erstellen

1. Öffne die Seite im DIVI-Builder
2. Klicke auf das Drei-Punkte-Menü unten in der Mitte
3. Wähle **„Portabilität"** → **„Exportieren"**
4. Speichere die JSON-Datei (z.B. `artikel-xyz.json`)

### Schritt 2: Transformer öffnen

1. Öffne die Datei `divi-json-transformer.html` in Windows (Doppelklick) > (öffnet im Browser)
2. Das Tool startet – keine Installation nötig

### Schritt 3: Einstellungen prüfen

Für einen typischen Artikel aus InDesign:

- **Modus:** Erweiterter Modus
- **Trennstellen:** 
  - ... H3, ✅ **H4**, H5, H6
  - ❌ Blockquote
  - ❌ OL, UL
- **Max. Module pro Zeile:** 2 (oder nach Bedarf)
- **Interview-Modus:** ❌ Aus (außer bei Zwiefach-Interviews)
- **Fußnoten transformieren:** ✅ An
- **Fragmentierte Tags zusammenführen:** ✅ An

### Schritt 4: Datei verarbeiten

1. Ziehe die JSON-Datei in den Ablagebereich des Tools (oder klicke zum Auswählen)
2. Die Verarbeitung startet automatisch
3. Die Datei `artikel-xyz_output.json` wird automatisch heruntergeladen

### Schritt 5: Zurück in DIVI importieren

1. Gehe zurück in den DIVI-Builder
2. Klicke auf **„Portabilität"** → **„Importieren"**
3. Wähle die `*_output.json` Datei, lasse in diesem Schritt ✅ "das alte Layout löschen".
5. Das neue Layout wird importtiert und erscheint mit getrennten und benamten Text-Modulen

### Ergebnis

Statt eines Moduls hast du nun:

- Separate Text-Module die mit einer Headline beginnen, für jeden Abschnitt
- Zitate als separate Blockquote-Module
- Bei „Max. Module pro Zeile = 2": eine unterteiltere Zeilenstruktur

Jetzt kannst du im DIVI-Builder einzelne Abschnitte verschieben, Spalten erstellen oder Module individuell gestalten.


---

## Häufige Fragen

**Kann ich mehrere Dateien gleichzeitig verarbeiten?**
Ja, theoretisch möglich, aber selten sinnvoll.

**Was passiert mit meinen Originaldateien?**
Nichts – das Tool erstellt neue Dateien mit dem Suffix `_output.json`.
Wenn etwas schieft läuft, kannst Du in der beitragsbearbeitungs-Historie zurückgehen.

**Funktioniert das Tool offline?**
Ja, die HTML-Datei enthält alles und benötigt keine Internetverbindung.

---
 
## ** !!! Wichtig !!! **
Der DIVI-Builder wird manchmal unstabil nach der Verwendung JSON-IMPORT/EXPORT. Es empfiehlt sich nach dem Re-Import der `_output.json` sofort den Beitrags zu speichern, einmal die Beitragsbearbeitung (Edit) zu verlassen und den Edit des Beitrags neu zu betreten.

---