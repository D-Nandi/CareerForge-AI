---
name: session-tutor
description: >-
  Generates a comprehensive learning guide and interactive Gemini tutoring prompt
  synthesizing all concepts, architecture, and debugging challenges from the current coding session.
  Activate whenever the user requests a session recap, learning guide, tutor prompt, or types '/tutor'.
---

# Session Tutor & Learning Guide Generator

This skill turns any completed engineering or debugging session into a master-class learning module tailored for a **Computer Science Graduate** learning real-world full-stack development.

## When to Run
Trigger this workflow whenever the user:
- Asks for a learning summary or session recap
- Says "teach me what we did" or "create a tutor prompt for Gemini"
- Types `/tutor` at the end of a task or session

---

## Workflow Procedure

### Step 1: Inspect Session Changes
1. Run `git status` and `git diff HEAD~1` (or inspect the recent tool/file edits in the conversation).
2. Identify:
   - What architecture or feature was introduced?
   - What third-party services or protocols were used (REST, Webhooks, WebSockets, DB)?
   - What specific bugs, syntax errors, deprecations, or build conflicts were encountered and resolved?

### Step 2: Formulate the Learning Context
Translate the session into 4 core sections:
1. **Big Picture & Core Concepts**: Explain high-level terms (e.g., Webhooks, ODM, Bearer Auth, Bundlers) simply with real-world analogies connecting to CS theory.
2. **Architecture & Data Flow**: ASCII or Mermaid diagram tracing the end-to-end request/response lifecycle.
3. **Real-World Challenges & Post-Mortem**: Document each unexpected error, why it happened under the hood, and how it was fixed.
4. **Key Files & Diffs**: Table linking all modified/created files and their purpose.

### Step 3: Generate the Interactive Gemini Tutor Prompt
Output a copy-pasteable prompt that primes Gemini to act as a 1-on-1 Socratic Engineering Mentor:
- Establishes the persona: Senior Software Engineer teaching a CS Fresher graduate.
- Embeds the exact session context, files, and solved bugs.
- Outlines 5 progressive learning modules.
- Instructs Gemini to teach one module at a time, show real code snippets, and ask an intuition check question before proceeding.

### Step 4: Save Context Artifact
Save the detailed walkthrough to `docs/learning_sessions/<YYYY-MM-DD>_<session_topic>.md` so the user builds a persistent engineering portfolio of learnings.
