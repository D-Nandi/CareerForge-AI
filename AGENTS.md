# Universal Agent Instructions

## Slash Commands & Custom Workflows

### `/tutor` — End-of-Session Learning Guide & Gemini Tutor Prompt
Whenever the user types `/tutor` or asks for a learning recap / tutor prompt at the end of a session:

1. **Analyze the Session**:
   - Inspect all code written, modified, or debugged during the session.
   - Extract the core concepts, protocols, architectural choices, and specific bugs/deprecations solved.

2. **Generate Two Deliverables**:
   - **Deliverable A**: Save a structured markdown guide (`docs/learning_sessions/<topic>_guide.md`) explaining the concepts, architecture, and bug post-mortems for a Computer Science graduate.
   - **Deliverable B**: Provide a copy-pasteable prompt for Gemini to act as a 1-on-1 Socratic Senior Engineering Mentor. The prompt must embed the session's exact context, bugs, and files, and instruct Gemini to teach in 5 interactive modules (one module at a time, with concrete code snippets and check-for-understanding questions).

---

## Blog Publishing & Internal Linking Protocol

Whenever the user asks to write, draft, or publish a blog post from the Content Strategy / Production Tracker:

1. **Pre-Writing Opportunity Scan**:
   - Run `node scripts/link-opportunity-engine.cjs --check <ID|topic|slug>` to generate the bidirectional linking plan.
   - Extract:
     - **Outbound Links**: Identify 3–4 published cluster blog posts and key product pages (`/resume-builder`, `/ats-score-checker`, `/resume-examples`, `/interview-prep`, `/templates`) to embed naturally into the new draft.
     - **Inbound Links**: Identify which existing published articles must be updated to link back to the new article upon publication.
     - **Cannibalization Check**: Verify the primary keyword does not compete with an existing article.

2. **Drafting Standards**:
   - Weave outbound links seamlessly into the narrative using Markdown syntax (`[Anchor Text](/target-url)`).
   - Ensure every article links to `/resume-examples` and at least one core tool CTA.

3. **Post-Publishing Reciprocal Linking**:
   - Update `client/blog-data.js` with the new blog post entry.
   - Update the existing older articles in `client/blog-data.js` with reciprocal inbound links to the new post so no new article is ever orphaned.
   - Run `node scripts/generate-static-pages.cjs` to build the static HTML pages in `client/blog/`.
   - Run `node scripts/link-opportunity-engine.cjs --sync` to update `docs/internal-linking-registry.json` and keep the persistent audit trail synchronized.
