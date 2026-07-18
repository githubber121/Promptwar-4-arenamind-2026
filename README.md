# ArenaMind 2026 — AI-Powered Smart Stadium Platform

> **Challenge 4: Smart Stadiums & Tournament Operations**  
> Built for the FIFA World Cup 2026 PromptWar Hackathon

![ArenaMind Banner](https://img.shields.io/badge/FIFA%20World%20Cup%202026-Smart%20Stadium-00c851?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-1.5%20Flash-orange?style=for-the-badge&logo=google)

---

## 🏟️ What is ArenaMind?

**ArenaMind** is a full-stack GenAI-powered platform that transforms the FIFA World Cup 2026 experience for **fans, staff, volunteers, and organizers**. It leverages Google Gemini 1.5 Flash to deliver intelligent, real-time assistance across six core modules — all in a single, unified web application.

---

## 🎯 Chosen Vertical

**Challenge 4 — Smart Stadiums & Tournament Operations**

ArenaMind addresses the following vertical use cases from the challenge:

| Vertical | ArenaMind Feature |
|---|---|
| 🗺️ Navigation | AI Fan Assistant with real-time zone routing |
| 👥 Crowd Management | Live Operations Dashboard with AI alerts |
| ♿ Accessibility | Accessibility Hub with filterable routes & AI guide |
| 🚌 Transportation | AI Transport Planner with live status |
| 🌱 Sustainability | Green Tracker with AI recommendations |
| 🌍 Multilingual | 8-language support in the Fan Assistant |
| 📊 Operational Intelligence | Staff/volunteer AI command guide |
| ⚡ Real-time Decision Support | Live crowd heatmap + AI Briefing button |

---

## 🚀 Features

### 1. 🤖 AI Fan Assistant (`/assistant`)
- **3 Personas**: Fan, Operations Staff, Volunteer — each with tailored system prompts
- **8 Languages**: English, Spanish, French, Arabic, Portuguese, German, Hindi, Chinese
- **Context-aware**: Real-time stadium occupancy data is injected into every AI response
- **Conversation memory**: Full multi-turn chat history maintained per session
- **Quick prompts**: Pre-built queries for fast access to common questions

### 2. 📊 Operations Dashboard (`/operations`)
- **Live crowd heatmap**: All zones update every 15 seconds with simulated real-time data
- **Automatic alerts**: Critical and warning alerts auto-generated based on zone thresholds
- **AI Operational Briefing**: One-click Gemini-powered status summary + action recommendations
- **Transport status monitoring**: Live status for all venue transport options

### 3. 🚌 Transport Planner (`/transport`)
- Full list of transport options per venue (metro, bus, shuttle, taxi)
- Live status indicators (on time / delayed / disrupted)
- AI-powered recommendation engine adapts advice to current disruptions

### 4. ♿ Accessibility Hub (`/accessibility`)
- Dedicated accessible routes per venue with feature tags (wheelchair, elevator, sensory, audio guide)
- Filter by accessibility feature type
- AI generates personalised step-by-step arrival guide for wheelchair users
- Emergency assistance info always visible

### 5. 🙋 Volunteer Guide (`/volunteer`)
- Full duty breakdown for FIFA 2026 volunteers
- 6 quick-access common situation buttons
- AI instantly advises on any scenario (lost fans, incidents, language barriers, medical)
- Key radio channels and contacts per venue

### 6. 🌱 Sustainability Tracker (`/sustainability`)
- Live metrics: energy, water, waste diversion, carbon offset
- Visual progress bars vs daily targets
- Green Initiative showcase
- AI generates actionable recommendations to improve metrics

---

## 🧠 Approach & Logic

### Architecture

```
ArenaMind/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── assistant/page.tsx    # AI Chat Interface
│   │   ├── operations/page.tsx   # Live Operations Dashboard
│   │   ├── transport/page.tsx    # Transport Planner
│   │   ├── accessibility/page.tsx # Accessibility Hub
│   │   ├── volunteer/page.tsx    # Volunteer Guide
│   │   ├── sustainability/page.tsx # Sustainability Tracker
│   │   └── api/
│   │       ├── chat/route.ts     # Secure Gemini API endpoint
│   │       └── stadiums/route.ts # Live stadium data endpoint
│   ├── lib/
│   │   ├── gemini.ts             # Gemini client (singleton, safety settings)
│   │   ├── stadiumData.ts        # Stadium constants + utility functions
│   │   └── prompts.ts            # Persona system prompts + input sanitisation
│   └── __tests__/
│       ├── stadiumData.test.ts   # 15 unit tests for data utilities
│       └── prompts.test.ts       # 10 unit tests for prompt builders + sanitisation
```

### AI Decision Logic

Each persona has a **different system prompt** with context-aware logic:

- **Fan Prompt**: Injects real-time zone occupancy → if zone >90% full, AI auto-suggests alternative zones
- **Operations Prompt**: Lists critical zones → AI provides crowd dispersal protocol
- **Volunteer Prompt**: Scenario-based → AI gives step-by-step protocols for incidents

### Security

- ✅ API key stored in `.env.local` (never client-side)
- ✅ All requests go through Next.js API route (server-side only)
- ✅ Input sanitisation: XSS prevention, HTML stripping, 2000-char max
- ✅ Request body validated with **Zod** schema
- ✅ In-memory rate limiting: 30 requests/minute per IP
- ✅ Gemini safety settings: blocks harassment, hate speech, explicit, dangerous content

---

## 🛠️ How to Run

### Prerequisites
- Node.js 18+
- A Google Gemini API key → [Get one free](https://aistudio.google.com/app/apikey)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/arenamind-2026.git
cd arenamind-2026

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local

# 4. Add your Gemini API key to .env.local
# GEMINI_API_KEY=your_key_here

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Tests

```bash
npm test
```

---

## 📋 How the Solution Works

1. **User opens ArenaMind** → chooses their role (Fan / Staff / Volunteer)
2. **Selects their venue** → real-time zone data is loaded
3. **Sends a message** → request hits `/api/chat` (server-side)
4. **API route**:
   - Validates and sanitises input (Zod + custom sanitiser)
   - Checks rate limit
   - Builds persona-specific system prompt with live stadium data
   - Calls Gemini 1.5 Flash
5. **Response returned** → displayed in chat UI with conversation history
6. **Operations Dashboard**: runs on a 15-second auto-refresh cycle, auto-generates alerts for any zone above its configured threshold

---

## 🧪 Testing

25 unit tests covering:
- `getCrowdDensity()` — correct %, edge cases (full, empty)
- `getCrowdStatus()` — all four status bands
- `getCrowdColor()` — correct colour for each status
- `getStadiumById()` — valid and invalid IDs
- `getCriticalZones()` — above/below threshold detection
- `sanitizeInput()` — XSS stripping, HTML escaping, length limits
- `buildFanPrompt()` — includes stadium name, zone data, language
- `buildOpsPrompt()` — includes critical zone detection
- `buildVolunteerPrompt()` — correct venue context

```bash
npm test
```

---

## ♿ Accessibility

- Semantic HTML5 throughout (`header`, `main`, `nav`, `section`, `article`, `aside`, `footer`)
- Proper `role` attributes (`log`, `progressbar`, `radiogroup`, `radio`, `list`, `listitem`)
- All interactive elements have `aria-label` or `aria-labelledby`
- Live regions: `aria-live="polite"` on chat log, `aria-live="polite"` on live status badge
- `role="alert"` on error messages
- Keyboard navigable: all buttons and links accessible via Tab + Enter
- `:focus-visible` styling for keyboard users
- Screen-reader friendly: `aria-hidden="true"` on decorative emojis

---

## 🌍 Assumptions

1. **Crowd data is simulated** — in a production system, this would connect to real venue IoT sensors via WebSocket or polling API
2. **Gemini 1.5 Flash** is used for the best balance of speed and intelligence for real-time chat
3. **Transport status** is simulated — production would integrate with local transit APIs (e.g., NJ Transit, LA Metro)
4. **Rate limiting** uses in-memory storage — production would use Redis for distributed rate limiting
5. **Three host venues** are included as representative examples (MetLife, SoFi, Azteca) — all 16 would be added in production

---

## 👨‍💻 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | Full-stack React framework (frontend + API routes) |
| **TypeScript** | Type safety throughout |
| **Google Gemini 1.5 Flash** | Generative AI — fast, capable, free tier |
| **Zod** | Runtime request validation |
| **Jest + Testing Library** | Unit testing |
| **Tailwind CSS** | Utility-first styling |
| **CSS Custom Properties** | Design token system |

---

## 📄 License

MIT License — built for the FIFA World Cup 2026 Smart Stadium Challenge.
