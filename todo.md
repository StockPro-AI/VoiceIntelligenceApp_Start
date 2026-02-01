# Voice Intelligence Desktop App - TODO

## Phase 1: Projektarchitektur & Setup
- [x] Tauri-Integration in Next.js Setup durchführen
- [x] Tauri-Konfiguration (tauri.conf.json) für Desktop-App
- [x] Rust-Backend für Tauri Commands vorbereiten
- [x] Build-Pipeline für Desktop-App konfigurieren

## Phase 2: Audio-Recording & Transkription
- [x] Web Audio API Integration für Audio-Aufnahme
- [x] Audio-Buffer Management und WAV-Konvertierung
- [x] Whisper API Integration im Backend
- [x] Transkriptions-Pipeline mit Error-Handling
- [x] Audio-Upload zu S3 vor Transkription

## Phase 3: LLM-Integration & Enrichment
- [x] LLM-Enrichment-Strategien definieren (Formatierung, Zusammenfassung, Strukturierung)
- [x] Prompt-Engineering für verschiedene Enrichment-Modi
- [x] Streaming-Response-Handling für LLM
- [ ] Enrichment-Cache zur Performance-Optimierung

## Phase 4: Hotkey & Desktop-Integration
- [x] Tauri Global Hotkey Plugin Integration
- [x] Hotkey-Listener für Alt+Shift+V (oder konfigurierbar)
- [ ] Window-Management (Show/Hide, Always-on-Top)
- [ ] System-Tray Integration für Background-Betrieb
- [ ] Keyboard-Shortcuts für Recording-Kontrolle

## Phase 5: UI/UX Design & Frontend
- [x] Elegantes Design-System mit Tailwind CSS 4
- [x] Recording-Interface mit visuellen Feedback
- [x] Transkriptions-Anzeige mit Live-Updates
- [x] Enrichment-Ergebnis-Anzeige
- [x] Responsive Layout für Desktop
- [x] Dark-Mode Theme (elegant & perfekt)
- [x] Animationen & Micro-Interactions

## Phase 6: Export & Ergebnis-Verwaltung
- [x] Copy-to-Clipboard Funktionalität
- [ ] Export als Markdown/TXT/PDF
- [ ] Verlauf/History der Aufnahmen speichern
- [ ] Favoriten-System für häufig verwendete Enrichment-Modi
- [ ] Einstellungen-Panel (Hotkey-Konfiguration, Sprache, etc.)

## Phase 7: Testing & Dokumentation
- [ ] Vitest Unit-Tests für Backend-Logik
- [ ] Integration-Tests für Transkriptions-Pipeline
- [x] README mit Architektur-Überblick
- [x] Setup-Anleitung für Entwicklung & Distribution
- [x] Design-Entscheidungen dokumentieren
- [x] API-Dokumentation für Tauri Commands

## Phase 8: Finalisierung & Deployment
- [ ] Performance-Optimierung
- [ ] Error-Handling & Logging
- [ ] Build für macOS/Windows/Linux
- [ ] Installer-Erstellung
- [ ] GitHub Release vorbereiten

---

## Architektur-Überblick

```
Frontend (React/Next.js)
├── Recording UI (Audio Input)
├── Transcription Display
├── Enrichment Results
└── Settings & History

↓ (tRPC + Tauri Commands)

Backend (Express + Tauri)
├── Audio Processing (WAV Conversion)
├── Whisper API Integration
├── LLM Enrichment Pipeline
└── System Integration (Hotkeys, Tray)

↓ (External APIs)

External Services
├── Whisper API (Speech-to-Text)
├── LLM API (Claude/GPT for Enrichment)
└── S3 Storage (Audio Files)
```

## Design-Entscheidungen

- **Framework**: Tauri + Next.js (Desktop + Modern UI)
- **Audio**: Web Audio API (Browser-native)
- **Speech-to-Text**: Whisper API (Accuracy & Reliability)
- **LLM**: Manus Built-in LLM (Integration ready)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Elegant & Professional)
- **State Management**: React Query + tRPC (Type-safe)
- **Desktop Integration**: Tauri Global Hotkeys + System Tray
