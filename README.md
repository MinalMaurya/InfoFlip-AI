# InfoFlip-AI
### Gen AI Platform for Automated Content Transformation
**Smart India Hackathon (SIH) Prototype**

Transform one piece of unstructured information (news article, advisory, incident report, or policy document) into multiple audience-specific communication artefacts across different audiences, tones, languages, and formats.

---

## 🚀 Quick Start (Local Run)

The prototype is fully client-side and requires **no API keys, database, or backend services** to run the complete interactive demo.

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production deployment
npm run build
```

---

## 🌟 Core Concept Flow

```
1 Source Content
       ↓
Understand Context & Intent (Semantic Domain, Threat/Urgency Tier, Entity Extraction)
       ↓
Configure Transformation (Audience, Tone, Language, Formats)
       ↓
Generate Multiple Communication Artefacts (Social Post, Short Brief, Email, Press Release, Awareness Notice)
       ↓
Human Review & Edit (Full editorial control before publishing)
       ↓
Export (Copy, Download .txt bundle)
```

---

## ⏱️ 60–90 Second SIH Presentation Demo Script

1. **Open the App**: Shows the enterprise AI workspace with high-polish typography and subtle accents.
2. **Load Preloaded Scenario**: Click **"Load Demo Content"** and select **"Emergency: Heavy Rainfall Advisory"**.
3. **Show Source Analysis**: The raw source text populates with live character and word counters.
4. **Configure Parameters**:
   - **Target Audience**: Change between *General Public*, *Students*, or *Government Officials*.
   - **Tone**: Select *Urgent* or *Informative*.
   - **Language**: Switch between *English*, *Hindi (हिंदी)*, and *Marathi (मराठी)*.
   - **Artefacts**: Toggle formats (*Social Media Post*, *Short Brief*, *Email*, *Press Release*, *Awareness Message*).
5. **Click "✦ Transform Content"**:
   - Watch the 4-stage pipeline animation:
     1. Source Analysis
     2. Context & Intent
     3. Audience Adaptation
     4. Content Transformation
6. **Inspect Results**:
   - View the **Cognitive Pipeline Extracted** card showing AI-detected intent, domain, and urgency level.
   - View synchronized output cards with format-specific layouts.
7. **Human-in-the-Loop Review**:
   - Click **"Edit"** on any card. Modify a line, then click **"Save Changes"**.
   - Notice the **"Edited & Reviewed ✓"** badge demonstrating responsible AI.
8. **Export**: Click **"Copy"** (shows animated *Copied ✓*) or **"Download"** to get a `.txt` file.
9. **Show Value Section**: Conclude on the **"Why InfoFlip-AI?"** cards and end-to-end workflow diagram.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS 3 (enterprise palette with indigo/purple accents)
- **Icons**: Lucide React
- **Architecture**: Modular service layer (`src/services/transformationService.js`) isolated for drop-in LLM integration.

---

## ☁️ Deployment Instructions

### Deploy to Vercel
1. Run `npx vercel` or push this repository to GitHub and import it on [vercel.com](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Deploy to Netlify
1. Drag and drop the `dist/` folder into Netlify Drop, or connect Git repo.
2. Build Command: `npm run build`
3. Publish Directory: `dist`
