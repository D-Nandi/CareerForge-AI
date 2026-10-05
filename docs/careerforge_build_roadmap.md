# CareerForge AI — Phase-Wise Build Roadmap
> Each checkbox is a discrete, shippable unit of work. Check off as you go.  
> **Complexity**: 🟢 Simple (< 2hrs) · 🟡 Medium (2–6hrs) · 🔴 Complex (6hrs+)

---

## Phase 1 — Growth Infrastructure
**Goal**: Bake in the email capture + account gating layer before any new features are built. Every new feature depends on this foundation.  
**Success Metric**: Email capture rate > 25% on ATS score result. Anonymous → account conversion > 15%.

### 1.1 Design System Consolidation
- [x] 🟡 Audit all CSS files and identify duplicate `:root` blocks (`style.css`, `tools-style.css`, `dashboard-style.css` each re-declare variables — merge into `css/tokens/colors.css` as the single source of truth)
- [x] 🟢 Remove inline `:root` blocks from `style.css` and replace with `@import './css/index.css'` (already partially done — complete the migration)
- [x] 🟡 Migrate `dashboard-style.css` to use `css/tokens/` variables instead of its own hardcoded values (`--accent: #8b5cf6` vs token `--accent: #6c5ce7` — these diverge)
- [x] 🟡 Create `css/atoms/cards.css` — consolidate `.tool-card`, `.feature-card`, `.faq-card`, `.metric-card` patterns into a unified card atom (`card`, `card-sm`, `card-lg` modifiers)
- [x] 🟡 Create `css/atoms/forms.css` — extract all `.field-group`, `.upload-zone`, `.tone-selector` patterns from `tools-style.css` into the atom layer
- [x] 🟢 Create `css/atoms/score-gauge.css` — extract `.gauge-wrap`, `.score-circle`, `.metric-bar-bg` from `tools-style.css`
- [x] 🟢 Create `css/atoms/chips.css` — extract `.chip`, `.chip-match`, `.chip-miss`, `.keyword-chips` from `tools-style.css`
- [x] 🟢 Add `css/atoms/nav.css` — consolidate `.tool-header`, `.navbar`, `.dash-header` into a single navigation atom with variants
- [x] 🟢 Add `css/atoms/modals.css` — extract modal patterns from `dashboard-style.css`
- [x] 🟡 Update `css/index.css` to import all new atom files
- [x] 🟡 Add `css/atoms/paywall.css` — new atom for blur-overlay / glimpse patterns (needed by Phase 2+)

### 1.2 Shared JavaScript Utilities
- [x] 🟡 Create `client/js/auth.js` — shared auth state manager (check login status, get user token, redirect if auth required). All pages import this.
- [x] 🟢 Create `client/js/toast.js` — extract toast notification logic from `dashboard-script.js` into a shared module
- [x] 🟡 Create `client/js/modal.js` — shared modal open/close/backdrop logic. Currently duplicated across pages.
- [x] 🟢 Create `client/js/api.js` — shared `fetch` wrapper with auth headers, error handling, and JSON parsing. Eliminates repeated fetch boilerplate.
- [x] 🟢 Verify `theme.js` is included on ALL pages (audit: `ats-score-checker.html`, `cover-letter-generator.html`, `templates.html` — confirm inclusion)

### 1.3 Email Capture on ATS Score
- [x] 🔴 Build email capture overlay on ATS score result: show score number + 3 items visible, remaining issues blurred. Email field + CTA to unlock full report.
- [x] 🟡 Backend: `POST /api/leads` endpoint — stores email + score + source tag in MongoDB `leads` collection
- [x] 🟡 On email submit: reveal full breakdown without page reload (remove blur, no redirect)
- [x] 🟡 After reveal: show contextual sign-up CTA card below results — "Save your score and track improvements →"
- [x] 🟢 Add `sessionStorage` check — if user already submitted email this session, skip capture (no re-gate)
- [x] 🟢 If user is already logged in, skip capture entirely — show full results immediately

### 1.4 Email Capture on Career Roadmap (Anonymous)
- [x] 🟡 Build same email capture pattern for Career Roadmap: show Phase 1 in full, blur Phases 2–4
- [x] 🟢 On email submit: reveal full roadmap, send roadmap PDF to email (use existing PDF generation or simple HTML email)
- [x] 🟢 Tag leads from Roadmap separately (`source: 'roadmap'`) for segmented nurture sequences

### 1.5 Newsletter / Nurture Backend
- [x] 🟡 Integrate email provider (Brevo / Mailchimp / Resend) — add API key to `.env`
- [x] 🟡 Backend: on lead creation, auto-subscribe to correct track (Track A for ATS, Track B for Roadmap, Track C for Interview Prep)
- [x] 🟡 Create 3 welcome email templates (one per track) — plain text + branded HTML version
- [x] 🟢 Backend: `POST /api/leads/unsubscribe` endpoint for one-click unsubscribe link in emails

### 1.6 Freemium Access Control
- [x] 🟡 Backend: Add `tier` field to User model (`'free' | 'pro' | 'career_plus'`). Default `'free'`.
- [x] 🟡 Backend: Create `middleware/requireTier.js` — middleware that checks `user.tier` and returns 403 with `{ upgradeRequired: true, feature: '...' }` if insufficient
- [x] 🟡 Frontend: Create `js/paywall.js` — handles 403 responses, shows paywall modal with feature preview and upgrade CTA
- [x] 🟢 Add paywall modal HTML structure to a shared `components/paywall-modal.html` fragment (or inline in each page with consistent markup)
- [x] 🟢 Create `css/atoms/paywall.css` — blur overlay, lock icon, upgrade CTA styles

### 1.7 Navigation Update
- [x] 🟡 Update main navbar in `index.html` to add "Career Roadmap" as a top-level nav link
- [x] 🟡 Update `tool-header` on all tool pages to include the new nav item
- [x] 🟢 Add "Interview Prep" nav link (points to coming soon / early access page for now)
- [x] 🟢 Add user avatar / account dropdown in nav when logged in (replace login/signup buttons)

---

## Phase 2 — Career Roadmap Feature
**Goal**: Ship the Career Roadmap as a fully working feature with anonymous (manual intake) + resume-powered modes.  
**Success Metric**: 40%+ of users who see the Roadmap page complete the intake form. 20%+ email capture.

### 2.1 Career Roadmap Page — Shell & Layout
- [x] 🟡 Create `client/career-roadmap.html` — new page using `tools-style.css` + design system tokens
- [x] 🟢 Add page to `sitemap.xml` and `robots.txt`
- [x] 🟢 Write SEO meta: title, description, OG tags targeting "career roadmap for CS engineers India"
- [x] 🟡 Add JSON-LD structured data (`HowTo` schema for the roadmap generation flow)

### 2.2 Career Compass Intake Form
- [x] 🟡 Build 5-step intake form using existing `.field-group` + `.tone-btn` atom patterns:
  - Step 1: Current situation (fresher / 1-3 yrs / 4-7 yrs / 7+)
  - Step 2: Current field (dropdown using `roles-data.js` patterns)
  - Step 3: Target role (dropdown + free text)
  - Step 4: Current skills (tag picker — chip UI from `css/atoms/chips.css`)
  - Step 5: Timeline (4 options)
- [x] 🟡 Add progress indicator (step 1 of 5) using existing badge/chip atoms
- [x] 🟢 Validate each step before proceeding — inline error states using `.error` class from `inputs.css`
- [x] 🟡 If user is logged in and has a saved resume → offer "Use my resume instead" shortcut that pre-fills the form from resume data

### 2.3 AI Roadmap Generation
- [x] 🔴 Backend: `POST /api/roadmap/generate` endpoint
  - Accepts: `{ currentRole, targetRole, skills[], experienceLevel, timeline, resumeData? }`
  - Calls Gemini/OpenAI API with structured prompt
  - Returns: `{ phases: [{ label, duration, skills[], certifications[], projects[], resumeImpact }] }`
- [x] 🟡 Backend: Define roadmap prompt template — must produce 4 phases (30-day, 90-day, 6-month, 12-month), India-specific certifications, realistic project ideas
- [x] 🟡 Backend: `POST /api/roadmap/save` (logged-in only) — persists roadmap to MongoDB
- [x] 🟡 Backend: `GET /api/roadmap/my` — fetches user's saved roadmap
- [x] 🟡 Create Mongoose `Roadmap` model: `{ userId, targetRole, phases[], createdAt, updatedAt, milestones[] }`

### 2.4 Roadmap Results UI
- [x] 🔴 Build roadmap output UI — 4 phase cards, each expandable:
  - Phase header: duration label, completion % indicator
  - Skills section: tag chips (using `css/atoms/chips.css`)
  - Certifications: cards with name, provider, estimated time, India relevance badge
  - Projects: cards with title, tech stack, estimated build time
  - Resume Impact: "Adding this will improve your ATS score for [target role] by ~X points"
- [x] 🟡 Implement email capture overlay (Phase 1 visible, Phases 2–4 blurred) for anonymous users
- [x] 🟡 On email capture: animate reveal of hidden phases
- [x] 🟢 Add share button → generates shareable URL or download-as-PDF option
- [x] 🟢 Add "Save to Dashboard" button (triggers login if not authenticated)

### 2.5 Profile Completeness Score
- [x] 🟡 Design and build score widget — mirrors ATS score gauge UI (reuse `css/atoms/score-gauge.css`)
- [x] 🟡 Backend: compute Profile Completeness Score from intake data vs target role requirements
- [x] 🟢 Add score interpretation text: "You're 61% ready for Senior SDE roles. These 3 things will move you to 80%+."

### 2.6 Dashboard Integration
- [x] 🟡 Add "Career Roadmap" tab to `dashboard.html` alongside Resumes and Cover Letters
- [x] 🟡 Show saved roadmap in dashboard: current phase, % complete, next milestone
- [x] 🟢 Add milestone checkbox UI — user can mark items complete, progress bar updates

---

## Phase 3 — Interview Prep Module
**Goal**: Ship Interview Prep as a standalone feature accessible without a resume, but enhanced by one.  
**Success Metric**: 30%+ of users who complete a resume download visit the Interview Prep page.

### 3.1 Interview Prep Page — Shell
- [ ] 🟡 Create `client/interview-prep.html` — new page with `tools-style.css`
- [ ] 🟢 Add page to `sitemap.xml`, `robots.txt`
- [ ] 🟢 SEO meta targeting "interview questions for SDE India", "Google interview prep India"
- [ ] 🟡 Add post-resume-export CTA: after PDF download, show banner "Resume ready? Prep for your interview →"

### 3.2 Intake Form (Anonymous Mode)
- [ ] 🟡 Build 4-question quick intake:
  - Company tier selector (FAANG / Unicorn / Product / IT Services / Startup) — visual card selector
  - Role selector (SDE-1 / SDE-2 / Tech Lead / Data Engineer / etc.)
  - Round type (DSA / System Design / Behavioural / HR / Full Loop)
  - Experience snippets (2–3 free text boxes: "Describe something you've worked on")
- [ ] 🟢 "Use my resume" shortcut for logged-in users with a saved resume
- [ ] 🟢 Animate between intake steps — slide transition using CSS transforms

### 3.3 AI Question Generation
- [ ] 🔴 Backend: `POST /api/interview/generate`
  - Accepts: `{ companyTier, role, roundType, experienceSnippets[], resumeData? }`
  - Returns: `{ questions: [{ id, category, question, hint, difficulty, sampleAnswer? }] }`
- [ ] 🟡 Backend: 3 prompt templates (DSA-focused, System Design-focused, Behavioural-focused)
- [ ] 🟡 Ensure questions reference user's experience snippets in behavioural questions ("Tell me about a time when you [specific thing they mentioned]…")
- [ ] 🟡 Backend: `POST /api/interview/save` — save session (logged-in only)

### 3.4 Question Display UI
- [ ] 🔴 Build question list UI:
  - Category tabs (DSA / System Design / Behavioural / HR)
  - Question cards: difficulty badge, question text, expandable hint
  - Free users: show 5 questions fully, remaining cards show count but are blurred (paywall overlay)
  - Answer input field (free text) per question — for self-practice notes
- [ ] 🟡 Email capture gate: "Get all 23 questions delivered to your email" after showing 5 free ones
- [ ] 🟡 "Mark as practiced" checkbox per question — session-persisted (no account needed), account-persisted if logged in

### 3.5 STAR Answer Builder
- [ ] 🔴 Build STAR Builder panel (Career+ tier only, with paywall glimpse for free users):
  - User selects a behavioural question
  - 4 guided text areas: Situation / Task / Action / Result
  - AI combines into a polished, recruiter-ready answer
  - Output displayed alongside original experience snippet for comparison
- [ ] 🟡 Backend: `POST /api/interview/star` — takes question + STAR fields → returns polished answer
- [ ] 🟢 "Copy answer" button, "Save answer" (requires login)

### 3.6 Company Prep Card
- [ ] 🟡 Build Company Prep Card — shown after question generation:
  - Company overview (2–3 sentences)
  - Known interview culture (e.g., "Amazon focuses heavily on Leadership Principles")
  - What to research before the interview
  - Relevant LeetCode patterns for DSA companies
- [ ] 🟡 Backend: `POST /api/interview/company-prep` — generates company card from company name + role
- [ ] 🟢 Free for all tiers (useful hook, low paywall)

---

## Phase 4 — Monetization & Payments
**Goal**: Enable paid upgrades. Pro and Career+ tiers go live.  
**Success Metric**: 3–5% conversion from Free → Paid within 30 days of sign-up.

### 4.1 Pricing Page
- [ ] 🔴 Create `client/pricing.html` — full pricing page with Free / Pro / Career+ tiers
- [ ] 🟡 Design tier comparison table — feature checklist per tier
- [ ] 🟡 Annual vs Monthly toggle — show both prices, default to Annual, show "Save 44%" badge
- [ ] 🟢 Add social proof: testimonial cards, "X students upgraded this week" live counter (seeded initially)
- [ ] 🟢 Add FAQ section: "Can I cancel anytime?", "Is my data safe?", "Do you offer student discounts?"

### 4.2 Payment Integration
- [ ] 🔴 Integrate Razorpay (India-first payment gateway — supports UPI, cards, net banking)
- [ ] 🟡 Backend: `POST /api/payments/create-order` — creates Razorpay order
- [ ] 🟡 Backend: `POST /api/payments/verify` — verifies Razorpay signature, upgrades `user.tier`
- [ ] 🟡 Backend: `POST /api/payments/webhook` — handles subscription events (renewal, cancellation)
- [ ] 🟡 Create Mongoose `Subscription` model: `{ userId, tier, razorpaySubscriptionId, startDate, endDate, status }`
- [ ] 🟢 Post-payment: redirect to dashboard with "Welcome to Pro! 🎉" success state

### 4.3 Paywall UI Polish
- [ ] 🟡 Implement blur overlay with "Upgrade to [tier]" CTA on all paywalled feature sections
- [ ] 🟡 Show feature preview counts: "Interview Prep would generate 23 questions for your profile" (personalized teaser)
- [ ] 🟢 Add upgrade nudge banner in dashboard for free users — subtle, dismissible, reappears after 7 days
- [ ] 🟢 Track paywall impressions and clicks via `analytics.js`

### 4.4 Subscription Management
- [ ] 🟡 Dashboard: "My Plan" section — shows current tier, renewal date, usage stats
- [ ] 🟡 "Cancel subscription" flow — confirmation modal, Razorpay cancellation API call
- [ ] 🟢 Downgrade grace period: user keeps paid features until period ends

---

## Phase 5 — Advanced Features (v3)
**Goal**: Increase retention and LTV through advanced Career+ features.  
**Success Metric**: Career+ churn < 5%/month. DAU/MAU ratio > 25% (users return frequently).

### 5.1 Milestone Tracker
- [x] 🔴 Build milestone tracking UI in dashboard — roadmap phases with interactive checkboxes, progress bar, and completion badges
- [x] 🟡 Backend: `PATCH /api/roadmap/milestone` & toggle controller — update milestone completion status in MongoDB
- [x] 🟡 Progress persistence + visual progress bar per phase in user dashboard
- [x] 🟢 Celebration animation on phase completion (toast, status badge shift)

### 5.2 Roadmap Re-calibration (90-day & Milestone-Triggered)
- [x] 🔴 Backend: `POST /api/roadmap/recalibrate` — recalculates profile score, updates phases, and re-evaluates candidate positioning
- [x] 🟡 Re-generate remaining phases using updated context (what they've completed + target company tier + updated timeline)
- [x] 🟢 Frontend: One-click "Recalibrate Plan" in both `career-roadmap.html` and `dashboard.html` with Pro paywall gate

### 5.3 Mock Interview Simulator (Career+ VIP)
- [x] 🔴 Build conversational mock interview UI in `interview-prep.html` — live chat turns, AI plays interviewer, real-time question generation
- [x] 🔴 Backend: `POST /api/interview/mock/turn` — multi-turn conversational AI evaluating candidate replies and delivering adaptive follow-up questions
- [x] 🟡 Backend: `POST /api/interview/mock/evaluate` — comprehensive Bar-Raiser scorecard measuring Technical Accuracy, STAR Structure, Communication Clarity, and hiring recommendation
- [x] 🟢 Session review modal with granular feedback breakdowns and improvement coaching

### 5.4 Salary Benchmarking India
- [x] 🟡 Build salary exploration tool `client/salary-benchmark.html` & `client/salary-benchmark-script.js`: role + city + company tier → CTC breakdown in LPA
- [x] 🟡 Backend: `backend/services/salaryData.js` & `GET /api/insights/salary-benchmark` — curated Indian tech compensation dataset with city multipliers and 4 company tiers (IT Services, Mid-Tier Product, Unicorns, FAANG)
- [x] 🟢 Visualize as interactive percentile distribution bar (P25, P50, P75, P90) with base vs variable/ESOP breakdown
- [x] 🟢 Show Indian tech negotiation playbook with counter-offer strategies and CTC pitfalls (joining bonus vs base)

### 5.5 Referral Programme & Viral Loop
- [x] 🟡 Backend: `GET /api/insights/referral/my-code` — generates deterministic unique referral code per user
- [x] 🟡 Backend: `POST /api/insights/referral/redeem` — applies referral code on signup/activation to award Pro extensions
- [x] 🟡 Frontend: Peer referral engine in `dashboard.html` with 1-click WhatsApp, LinkedIn, and clipboard sharing
- [x] 🟢 Referral stats widget in dashboard: tracks friends referred and months of free Pro earned

### 5.6 India Market Insights Panel
- [x] 🟡 Curated dataset & endpoint `GET /api/insights/market-trends`: top hiring roles by city (Bengaluru, Hyderabad, Pune, NCR, Chennai), hiring sentiment index, and top salary-multiplier skills
- [x] 🟡 Build market insights widgets on Salary Benchmark and Dashboard
- [x] 🟢 Inline salary multiplier badges and skill demand indicators

---

## Cross-Phase: Always-On Tasks

### SEO & Performance
- [x] Ensure every new page has: unique `<title>`, `<meta description>`, canonical URL, OG tags, JSON-LD
- [x] Add new pages to `sitemap.xml` as they ship
- [x] Standardized design system tokens with zero hardcoded colors
- [x] Unified responsive breakpoints (1080px, 768px, 560px, 480px) per `docs/design_system_guidelines.md`

### Analytics
- [x] Instrument features with `analytics.js` events
- [x] Track paywall impressions and upgrade clicks
- [x] Track roadmap intake and milestone completion

### Testing Checklist (per feature)
- [x] Dark mode renders correctly across all tools
- [x] Mobile (375px) layout works without horizontal scroll
- [x] Keyboard navigation works for all interactive elements
- [x] Anonymous / Free / Pro / Career+ tier states all render correctly
- [x] Defensive flexbox gaps and SVG scaling prevent all element collisions
