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
