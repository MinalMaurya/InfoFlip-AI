# InfoFlip-AI (V0.2.0)
### Gen AI Platform for Automated Content Transformation
**Smart India Hackathon (SIH 2026) Prototype • Problem Statement ID: SIH26154**

InfoFlip-AI transforms unstructured source material—government advisories, incident reports, policy circulars, press notes, documents (`.txt`, `.pdf`, `.docx`), and images (`.png`, `.jpg`, `.jpeg`, `.webp`)—into source-grounded, audience-adapted, human-reviewed communication deliverables across **13 output formats** and **6 Indian & international languages**.

---

## 🚀 Quick Start

InfoFlip-AI runs out of the box with **zero mandatory API keys, databases, or backend servers**. When no API key is configured, the platform automatically uses its built-in **Deterministic Client-Side NLP Engine**. Optionally, you can provide a Google Gemini API key to enable live `gemini-3.8-flash` inference with automatic fallback.

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Run the full automated verification suite (9 test suites)
npm test

# 4. Build for production
npm run build
```

### Optional Environment Configuration (`.env`)

```env
# Optional: Enable live Gemini 3.8 Flash structured generation
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_AI_PROVIDER=gemini
```

---

## 🖥️ Workspace & UI Architecture

InfoFlip-AI features a responsive, three-region **Chat-Centered Content Creation Workspace** alongside an integrated **Previous Prototype** inspector for stepping through all six pipeline modules individually.

```
┌──────────────────────┬───────────────────────────────────────────┬──────────────────────┐
│    LEFT SIDEBAR      │             CENTER WORKSPACE              │    RIGHT SIDEBAR     │
│ (Collapsible / Rail) │      (Conversation & Output Studio)       │ (Collapsible / Rail) │
├──────────────────────┼───────────────────────────────────────────┼──────────────────────┤
│ • + New Chat         │ • Header: Chat Title, Previous Prototype, │ • 13 Output Formats  │
│ • Explore (Preview)  │   Theme Switcher (Light / Dark / System)  │   - Social/Messaging │
│ • Library (All Items)│ • Chronological Multi-Turn Conversation   │   - Briefs & Media   │
│ • Scheduled (Soon)   │   - User Prompt + Source Attachment Card  │ • Generation Config  │
│ • Content Collections│   - AI Analysis & Key Facts Summary       │   - Tone             │
│   (13 Format Filters)│   - Tabbed & Expandable Format Outputs    │   - Target Audience  │
│ • Recent Chats       │   - Inline Edit, Approve, Reject & Export │   - Language (6)     │
│   (Search & Restore) │ • Multi-Modal Prompt Composer             │   - Detail Level     │
│ • Prototype Account  │   - Prompt Input, Paste Source Drawer,    │   - Objective        │
│   (Minal Maurya)     │     File/Image Upload & Demo Scenarios    │   - Content Style    │
└──────────────────────┴───────────────────────────────────────────┴──────────────────────┘
```

### Key Workspace Capabilities

1. **Independent Collapsible Sidebars & Persistent Icon Rails**:
   - On desktop, both the left navigation sidebar and right output-format sidebar collapse independently into compact `w-16` icon rails with direct-action tooltips and keyboard accessibility.
   - The center workspace automatically expands to utilize all available viewport width.
   - On mobile and tablet viewports, both sidebars operate as accessible slide-out drawers with backdrop and `Escape`-key dismissal.
2. **Multi-Turn Conversational Refinement**:
   - Submit a source document or text once, then send natural-language follow-up prompts (e.g., *"Make the LinkedIn post shorter"*, *"Switch tone to Urgent for Citizens in Hindi"*) that retain the active conversation's source and semantic analysis context.
3. **Canonical Content Library & Format Collections**:
   - Every generated output is stored as a canonical content item linked to its conversation and turn.
   - Browse all outputs in **Library** or filter by any of the **13 Content Collections** in the left sidebar. Edits and approvals synchronize across the active chat, Library, and collection views.
4. **Previous Prototype (6-Module Pipeline Inspector)**:
   - Clicking **Previous Prototype** in the top navigation bar opens the full six-stage modular interface (`Input` → `Understand` → `Transform` → `Communicate` → `Review` → `Export`) synchronized with the active workspace state.

---

## ⚙️ Six-Module Content Transformation Pipeline

InfoFlip-AI connects six dedicated modules under the hood (`src/services/workspace/chatPipelineOrchestrator.js`):

| Module | Name | Core Responsibilities | Key Service / Location |
| :--- | :--- | :--- | :--- |
| **Module 1** | **Input & Ingestion** | Validates `.txt`, `.pdf`, `.docx`, `.png`, `.jpg`, `.jpeg`, `.webp` files (up to 10 MB), extracts text/metadata, normalizes whitespace, and computes source fingerprints. | `src/services/ingestionService.js`<br>`src/utils/fileValidation.js` |
| **Module 2** | **AI Content Understanding** | Extracts main topic, domain category, urgency level, 5W1H breakdown, key facts, named entities (organizations, locations, technologies, people, dates), and source-traceable claims. | `src/services/analysisService.js` |
| **Module 3** | **Content Transformation** | Generates structured institutional formats: *Executive Summary*, *Detailed Brief*, *Key Takeaways*, *Public Advisory Notice*, *FAQ*, *Comparison View*, *Infographic Blueprint*, *Slide Outline*, and *Video/Reel Script*. | `src/services/transformation/transformationService.js` |
| **Module 4** | **Communication Generation** | Generates channel-specific deliverables: *LinkedIn Post*, *Twitter/X Thread*, *SMS Alert (≤160 chars)*, *Email Newsletter*, *WhatsApp Broadcast*, *Press Release*, *Poster Copy*, *CTA Card*, and *Hashtag/SEO Kit*. | `src/services/communication/communicationService.js` |
| **Module 5** | **Quality Review & Approval** | Runs a 5-pillar automated quality audit (Factual Alignment, Completeness, Tone, Readability, Platform Compliance), flags unverified claims or buzzwords, supports inline human editing, and enforces human approval. | `src/services/review/reviewService.js` |
| **Module 6** | **Export & Distribution** | Enforces an approval gate before exporting deliverables as **Clipboard Text**, **`.txt` Report**, **`.json` Data Package** (with full lineage), **`.pdf` Document**, or a **`.zip` Bundle**. | `src/services/export/exportService.js` |

---

## 📋 Supported Output Formats & Parameters

### 13 Workspace Output Formats
- **Social & Messaging**:
  - `LinkedIn Post` (`linkedin`)
  - `Twitter / X Thread` (`twitter`)
  - `SMS Alert` (`sms` — strict 160-character compliance)
  - `Email Newsletter` (`email`)
  - `WhatsApp Broadcast` (`whatsapp`)
  - `Press Release` (`press-release`)
  - `Awareness Poster` (`poster`)
  - `Action CTA Card` (`cta-card`)
  - `Hashtag & SEO Kit` (`hashtag-kit`)
- **Briefs & Media**:
  - `Executive Summary` (`executive-summary`)
  - `Public Advisory` (`advisory`)
  - `Infographic Plan` (`infographic`)
  - `Slide Outline` (`presentation`)
  - `Video / Reel Script` (`video-script`)

### Configurable Generation Controls
- **Target Audiences**: *General Public*, *Citizens*, *Students & Youth*, *Executives & Leadership*, *Government Officials*, *Technical Teams*, *Media & Press*
- **Tones**: *Formal*, *Informative*, *Urgent*, *Educational*, *Executive*, *Empathetic*, *Public Advisory*
- **Languages**: *English*, *Hindi (हिन्दी)*, *Marathi (मराठी)*, *Tamil (தமிழ்)*, *Telugu (తెలుగు)*, *Bengali (বাংলা)*
- **Detail Levels**: *Concise*, *Standard*, *Detailed*, *Comprehensive*
- **Objectives**: *Inform*, *Alert*, *Educate*, *Mobilize Action*, *Policy Briefing*
- **Content Styles**: *Bullet-First*, *Narrative*, *Action-Oriented*, *Q&A Structured*, *Data-Driven*

---

## 🛡️ Truthful AI & Verification Governance

InfoFlip-AI enforces strict content confidence and verification rules (`src/services/confidence/contentConfidenceService.js`):
- **No Fabricated Accuracy Claims**: The platform never displays unverifiable accuracy percentages or claims independent external fact-checking when operating solely on user-provided sources.
- **Explicit Provenance Labels**:
  - `Extracted from provided source` — Facts and metrics traced directly to sentences in the user's input.
  - `Source not independently verified` — Honest disclosure that source claims have not been cross-checked against external databases.
  - `AI-transformed draft` — Generated content awaiting human review.
  - `Human reviewed` / `Approved for export` — Content inspected, edited, and explicitly approved by a human reviewer.
- **Edit-Resets-Approval Safety**: Modifying any approved output automatically transitions its status back to `PENDING_REVIEW` until re-approved.

---

## 🎨 Global Design System (`Graphite + Steel Blue`)

The UI is built on a centralized semantic token system defined in `src/index.css` and mapped into Tailwind CSS (`tailwind.config.js`), supporting **Light**, **Dark**, and **System** theme modes with zero flash on load (`index.html` pre-hydration script + `src/context/ThemeContext.jsx`).

| Semantic Token | Light Mode | Dark Mode | Purpose |
| :--- | :--- | :--- | :--- |
| `--color-app-background` | `#F4F6F8` | `#16181C` | Main workspace canvas background |
| `--color-sidebar-background` | `#E9EDF2` | `#242831` | Left & right sidebars, secondary headers |
| `--color-surface` | `#FFFFFF` | `#242831` | Cards, panels, and input surfaces |
| `--color-surface-elevated` | `#FFFFFF` | `#2C313B` | Dropdowns, modals, and popovers |
| `--color-surface-hover` | `#E3E8EE` | `#303642` | Interactive hover states |
| `--color-surface-selected` | `#D8E1EA` | `#344252` | Active navigation, selected chips, user chat bubble |
| `--color-primary` | `#526B88` | `#526B88` | Primary Steel Blue brand actions & active indicators |
| `--color-accent` | `#8298B0` | `#8298B0` | Secondary Steel Blue highlights & dark-mode focus rings |
| `--color-text-primary` | `#202833` | `#F3F4F6` | Primary readable typography |
| `--color-text-secondary` | `#657180` | `#ADB5C2` | Secondary labels and metadata |
| `--color-border` | `#DCE2E8` | `#343943` | Hairline borders and structural dividers |

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 (`react`, `react-dom`)
- **Build Tool & Dev Server**: Vite 6 (`@vitejs/plugin-react`)
- **Styling & Design Tokens**: Tailwind CSS 3 + CSS Custom Properties (`--color-*`) + PostCSS + Autoprefixer
- **Iconography**: Lucide React (`lucide-react`)
- **AI & NLP Layer**:
  - **Primary (Optional)**: Google Gemini REST API (`gemini-3.8-flash`) with timeout, retry, circuit-breaker, and strict JSON schema validation (`src/services/ai/geminiClient.js`)
  - **Fallback / Default Offline**: Deterministic Client-Side NLP Provider (`src/services/ai/deterministicNLPProvider.js`)
- **Client Persistence**: Resilient `localStorage` service (`src/services/storage/workspaceStorageService.js`) with schema versioning, corruption recovery, quota handling, and automatic secret-key stripping
- **Export Generators**: Native client-side generators for `.txt`, `.json`, `.pdf` (IEEE-1028 structured binary PDF), and `.zip` (CRC32 + Store archive builder) with zero external runtime dependencies

---

## 📂 Project Structure

```text
InfoFlip_AI/
├── index.html                          # Pre-hydration theme script & root mount
├── package.json                        # Scripts & dependencies
├── tailwind.config.js                  # Semantic token mappings & theme configuration
├── vite.config.js                      # Vite bundler configuration
└── src/
    ├── App.jsx                         # Root layout, sidebar/drawer state & view router
    ├── main.jsx                        # React entrypoint with ThemeProvider
    ├── index.css                       # Global CSS variables (Light/Dark tokens) & utilities
    ├── context/
    │   └── ThemeContext.jsx            # Light, Dark & System theme state + DOM sync
    ├── components/
    │   ├── ThemeToggle.jsx             # Accessible theme dropdown & segmented switcher
    │   ├── Navbar.jsx                  # Header navigation for Previous Prototype inspector
    │   ├── AboutView.jsx               # Platform architecture & SIH 26154 overview
    │   ├── ValueSection.jsx            # Value proposition & pipeline summary cards
    │   ├── common/                     # Verification badges & disclaimer notices
    │   ├── workspace/                  # Chat-Centered Workspace components
    │   │   ├── LeftSidebar.jsx         # Collapsible left navigation, collections & rail
    │   │   ├── RightSidebar.jsx        # Collapsible format selector, settings & rail
    │   │   ├── ChatWorkspace.jsx       # Conversation thread, composer & turn actions
    │   │   ├── GeneratedOutputRenderer.jsx # Per-format output renderer, editor & QA controls
    │   │   ├── LibraryView.jsx         # Searchable/filterable Library & Collection view
    │   │   ├── ExploreView.jsx         # Explore placeholder & demo scenario launcher
    │   │   └── ScheduledPostsView.jsx  # Scheduled Posts "Coming soon" placeholder
    │   ├── input/                      # Module 1 UI components (Uploaders, Validation)
    │   ├── analysis/                   # Module 2 UI components (5W1H, Entities, Claims)
    │   ├── transformation/             # Module 3 UI components & format previews
    │   ├── communication/              # Module 4 UI components (Social, SMS, Email, Press)
    │   ├── review/                     # Module 5 UI components (Quality Audit, Approval)
    │   └── export/                     # Module 6 UI components (Export Package & Lineage)
    ├── views/                          # Full-page views for Modules 4, 5, and 6
    ├── services/
    │   ├── ingestionService.js         # Module 1 ingestion & text extraction service
    │   ├── analysisService.js          # Module 2 semantic understanding service
    │   ├── transformation/             # Module 3 structured transformation engine
    │   ├── communication/              # Module 4 social & messaging generator
    │   ├── review/                     # Module 5 quality audit & approval service
    │   ├── export/                     # Module 6 TXT, JSON, PDF & ZIP export builders
    │   ├── confidence/                 # Truthful verification & provenance governance
    │   ├── ai/                         # Gemini 3.8 Flash client & deterministic NLP fallback
    │   ├── storage/                    # Browser storage persistence & sanitization
    │   └── workspace/                  # End-to-end chat turn pipeline orchestrator
    ├── types/                          # Data contracts & constants across all 6 modules
    ├── utils/                          # File validation, formatting & helper utilities
    └── tests/                          # 9 automated verification & regression test suites
```

---

## 🧪 Automated Test Suites

Run the complete test suite at any time with:

```bash
npm test
# or
node src/tests/runAllTests.js
```

All **9 verification suites** run in Node.js without requiring a browser or external network connection:

1. **Module 1 — Input & Ingestion (`57 tests`)**: File validation, size limits, text extraction, and metadata normalization.
2. **Module 2 — Understanding & Analysis (`63 tests`)**: Topic detection, urgency scoring, 5W1H, entity recognition, and claim extraction.
3. **Module 3 — Transformation & Output Engine (`103 tests`)**: Multi-audience, multi-language, and multi-format structured transformations.
4. **Module 4 — Social & Communication Generator (`313 tests`)**: Channel-specific drafts, SMS 160-character enforcement, and vernacular localization.
5. **Module 5 — Review, QA & Human Approval (`68 tests`)**: Automated quality checks, inline editing, approval reset rules, and audit logging.
6. **Module 6 — Export & Distribution (`66 tests`)**: Approval gate enforcement and `.txt`, `.json`, `.pdf`, and `.zip` package generation.
7. **Gemini 3.8 Flash Integration & Resilience (`24 tests`)**: Schema validation, circuit-breaker behavior, and deterministic NLP fallback.
8. **Content Confidence & Verification Governance (`102 tests`)**: Provenance labeling, unverified claim flags, and anti-hallucination safeguards.
9. **Chat-Centered Workspace, Sidebars & Theme System (`49 tests`)**: Multi-turn chat orchestration, storage resilience, collapsed icon rails, `Previous Prototype` navigation, and `Graphite + Steel Blue` Light/Dark/System theme compliance.
