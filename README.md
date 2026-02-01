# Voice Intelligence Desktop App

Eine elegante Desktop-Anwendung, die Spracheingaben aufnimmt, transkribiert und durch KI-gestützte Verarbeitung intelligent anreichert. Die Anwendung ist nahtlos in den Desktop-Workflow integrierbar und wird per globaler Hotkey-Kombination aktiviert.

## Problem & Motivation

In modernen Workflows entsteht häufig die Herausforderung, schnell Gedanken zu erfassen und strukturiert festzuhalten. Voice Intelligence löst diesen Use-Case durch eine nahtlose Integration:

1. **Schnelle Erfassung**: Globale Hotkey-Aktivierung (Alt+Shift+V) ermöglicht sofortige Sprachaufnahme ohne Kontextwechsel
2. **Intelligente Verarbeitung**: Automatische Transkription und KI-basierte Anreicherung (Formatierung, Zusammenfassung, Strukturierung)
3. **Direkte Nutzbarkeit**: Ergebnisse können sofort kopiert, exportiert oder weiterverarbeitet werden

## Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────────┐
│                     Voice Intelligence Desktop                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (React 19 + Tailwind CSS 4)                           │
│  ├── Voice Recorder Component (Web Audio API)                   │
│  ├── Transcription Display                                      │
│  ├── Enrichment UI (Multiple Modes)                             │
│  └── Settings & History                                         │
│                                                                   │
│  ↓ (tRPC Type-Safe RPC)                                         │
│                                                                   │
│  Backend (Express + Tauri)                                      │
│  ├── Audio Upload (S3 Storage)                                  │
│  ├── Whisper API Integration                                    │
│  ├── LLM Enrichment Pipeline                                    │
│  └── Tauri Commands (Hotkeys, System Integration)               │
│                                                                   │
│  ↓ (External APIs)                                              │
│                                                                   │
│  External Services                                              │
│  ├── Whisper API (OpenAI Speech-to-Text)                        │
│  ├── LLM API (Claude/GPT for Enrichment)                        │
│  ├── S3 Storage (Audio File Persistence)                        │
│  └── System Hotkeys (Tauri Global Shortcut)                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Technologie-Stack

| Bereich | Technologie | Grund |
|---------|-------------|-------|
| **Desktop Runtime** | Tauri 2.x | Leichtgewichtig, Rust-basiert, Cross-Platform |
| **Frontend Framework** | Next.js + React 19 | Modern, Type-Safe, Component-basiert |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Elegant, Responsive, Accessible |
| **Backend** | Express + tRPC | Type-Safe RPC, Minimal Boilerplate |
| **Database** | MySQL/TiDB | Persistent Storage für History |
| **Speech-to-Text** | Whisper API | Hochgenaue Transkription |
| **LLM Integration** | Manus Built-in LLM | Enrichment & Processing |
| **File Storage** | S3 (AWS) | Audio-Datei Persistierung |
| **State Management** | React Query + tRPC | Optimistic Updates, Caching |

## Voice-Processing Pipeline

```
Audio Input (Web Audio API)
    ↓
WAV/WebM Encoding
    ↓
S3 Upload
    ↓
Whisper API Transcription
    ↓
Transcription Text
    ↓
LLM Enrichment (Selected Mode)
    ├── Summary: Prägnante Zusammenfassung
    ├── Structure: Strukturierte Gliederung
    ├── Format: Formatierte Notiz
    └── Context: Kontextbezogene Anpassung
    ↓
Enriched Output
    ↓
Display & Export (Clipboard, File, History)
```

## Enrichment-Modi

Die Anwendung bietet vier Enrichment-Modi zur intelligenten Verarbeitung von Transkripten:

### 1. **Summary** (Zusammenfassung)
Erstellt eine prägnante 2-3 Satz-Zusammenfassung des Transkripts.
```
Input: "Heute habe ich ein langes Meeting gehabt über Q1 Planung..."
Output: "Q1 Planung Meeting mit Fokus auf Ressourcenallokation und Timeline."
```

### 2. **Structure** (Strukturierung)
Gliedert den Text mit Überschriften und Aufzählungspunkten.
```
Output:
# Hauptthema
- Punkt 1
- Punkt 2
  - Unterpunkt
```

### 3. **Format** (Formatierung)
Erstellt eine strukturierte Notiz mit klaren Abschnitten.
```
Output:
## Überschrift
Inhalt mit Formatierung

### Unterabschnitt
Detaillierte Punkte
```

### 4. **Context** (Kontext-Anpassung)
Analysiert den Text im Kontext eines spezifizierten Themas.
```
Input Context: "Projektmanagement"
Output: Transkript wird im PM-Kontext analysiert und aufbereitet
```

## Setup & Installation

### Voraussetzungen

- Node.js 18+ und pnpm
- Rust (für Tauri Desktop-Build)
- Git

### Entwicklungs-Setup

```bash
# Repository klonen
git clone <repo-url>
cd voice-intelligence-app

# Dependencies installieren
pnpm install

# Environment-Variablen setzen
cp .env.example .env.local
# Folgende Variablen konfigurieren:
# - DATABASE_URL: MySQL/TiDB Connection String
# - BUILT_IN_FORGE_API_KEY: Manus LLM API Key
# - BUILT_IN_FORGE_API_URL: Manus LLM API URL

# Development Server starten (Web)
pnpm dev

# Desktop App starten (Tauri)
pnpm dev:desktop

# Build für Production
pnpm build:desktop
```

### Hotkey-Konfiguration

Die Standard-Hotkey-Kombination ist **Alt+Shift+V**. Diese kann in der App-Einstellung konfiguriert werden:

1. Öffne die Anwendung
2. Navigiere zu Settings
3. Ändere die Hotkey-Kombination
4. Speichern und neu starten

## Design-Entscheidungen

### 1. **Tauri statt Electron**
- **Grund**: Kleinere Bundle-Größe (~3MB vs ~150MB), schnellere Startzeit, bessere Performance
- **Trade-off**: Weniger Ökosystem, aber ausreichend für Desktop-Integration

### 2. **Web Audio API statt Native Recording**
- **Grund**: Cross-Platform Kompatibilität, keine zusätzlichen Abhängigkeiten
- **Features**: Echo Cancellation, Noise Suppression, Auto Gain Control

### 3. **Whisper API statt lokales Modell**
- **Grund**: Höhere Genauigkeit, Multi-Language Support, keine lokale GPU erforderlich
- **Alternative**: Könnte zu lokal gehosteten Modellen migriert werden

### 4. **LLM-Enrichment statt statische Verarbeitung**
- **Grund**: Flexible, kontextbezogene Verarbeitung
- **Modes**: Vier verschiedene Enrichment-Strategien für unterschiedliche Use-Cases

### 5. **S3 Storage für Audio-Dateien**
- **Grund**: Persistierung, Backup, Skalierbarkeit
- **Sicherheit**: Presigned URLs, Zugriffskontrolle

## API-Referenz

### tRPC Procedures

#### `transcription.uploadAudio`
Lädt Audio-Datei zu S3 hoch.

```typescript
input: {
  audioData: string;      // Base64-encoded audio
  filename: string;       // Dateiname
}

output: {
  success: boolean;
  url: string;           // S3 URL
  fileKey: string;       // S3 Key
}
```

#### `transcription.transcribeAudio`
Transkribiert Audio mit Whisper API.

```typescript
input: {
  audioUrl: string;      // S3 URL
  language?: string;     // Optional: ISO-639-1 Code
}

output: {
  success: boolean;
  text: string;         // Transkribierter Text
  language: string;     // Erkannte Sprache
  segments: Array;      // Timestamped Segmente
}
```

#### `transcription.enrichTranscription`
Reichert Transkript mit LLM an.

```typescript
input: {
  text: string;
  mode: 'summary' | 'structure' | 'format' | 'context';
  context?: string;     // Optional: Kontext für Context-Mode
}

output: {
  success: boolean;
  enrichedText: string;
  mode: string;
}
```

### Tauri Commands

#### `register_hotkey`
Registriert globale Hotkey.

```rust
register_hotkey(hotkey: &str) -> Result<(), String>
```

#### `unregister_hotkey`
Deregistriert globale Hotkey.

```rust
unregister_hotkey(hotkey: &str) -> Result<(), String>
```

## Datenbankschema

### Recordings Table
```sql
CREATE TABLE recordings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  audioUrl VARCHAR(512) NOT NULL,
  audioKey VARCHAR(256) NOT NULL,
  transcription LONGTEXT,
  enrichedText LONGTEXT,
  enrichmentMode ENUM('summary', 'structure', 'format', 'context'),
  duration INT,
  language VARCHAR(10),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## Performance-Optimierungen

1. **Audio Streaming**: Große Audio-Dateien werden in Chunks verarbeitet
2. **LLM Caching**: Häufig verwendete Enrichment-Modi werden gecacht
3. **Lazy Loading**: UI-Komponenten werden on-demand geladen
4. **Optimistic Updates**: Sofortige UI-Feedback ohne Warten auf Server

## Sicherheit

1. **API-Keys**: Alle sensiblen Credentials sind server-side
2. **Audio-Dateien**: S3 mit Presigned URLs und Zugriffskontrolle
3. **Transcription**: Nur authentifizierte Benutzer können transkribieren
4. **HTTPS**: Alle Kommunikation ist verschlüsselt

## Bekannte Limitationen & Roadmap

### Aktuelle Limitationen
- Audio-Dateien sind auf 16MB begrenzt (Whisper API Limit)
- Nur englische und deutsche Sprache vollständig getestet
- Desktop-App ist derzeit nur für macOS/Windows optimiert

### Roadmap
- [ ] Linux-Support für Desktop-App
- [ ] Offline-Transkription mit lokalem Whisper
- [ ] Erweiterte Enrichment-Modi (Translation, Sentiment Analysis)
- [ ] Voice-Shortcuts für häufige Aktionen
- [ ] Integration mit populären Notiz-Apps (Notion, Obsidian)
- [ ] Real-time Collaboration für Team-Nutzung

## Entwicklung & Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test:integration
```

### Linting & Formatting
```bash
pnpm format
pnpm check
```

## Deployment

### Desktop App Distribution

```bash
# Build für alle Plattformen
pnpm build:desktop

# Installer werden generiert in:
# - src-tauri/target/release/bundle/
```

### Web Version (Optional)

```bash
# Build für Web
pnpm build

# Deploy zu Manus oder externem Host
```

## Lizenz

MIT License - Siehe LICENSE Datei für Details

## Support & Kontakt

Bei Fragen oder Problemen:
1. Öffne ein Issue im GitHub Repository
2. Konsultiere die Dokumentation
3. Kontaktiere das Development Team

## Danksagungen

- OpenAI Whisper für Speech-to-Text
- Tauri Team für Desktop-Runtime
- shadcn/ui für UI-Komponenten
- Manus Platform für LLM & Storage Integration
