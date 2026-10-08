#!/usr/bin/env node
/**
 * scripts/session-tutor.cjs
 * Automatically inspects recent git changes and generates an interactive Gemini Tutor Prompt.
 * Usage: node scripts/session-tutor.cjs
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitOutput(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (e) {
    return '';
  }
}

const status = getGitOutput('git status -s');
const diffStat = getGitOutput('git diff --stat') || getGitOutput('git diff --stat HEAD~1');
const recentLogs = getGitOutput('git log -n 3 --oneline');

const promptTemplate = `
You are my personal Senior Software Engineering Mentor. I am a fresh Computer Science graduate. I understand core CS fundamentals (data structures, logic, basic networking), but I am learning real-world full-stack development, tooling, and debugging.

Here is the context of what we just worked on in our codebase:

==================== RECENT SESSION CONTEXT ====================
Git Status (Modified/Created Files):
${status || 'Files updated in current session'}

Diff Summary:
${diffStat || 'Code changes and features implemented'}

Recent Commits:
${recentLogs || 'Working session branch'}
==============================================================

YOUR ROLE & INSTRUCTIONS AS MY TUTOR:
1. Treat me like an intelligent beginner: explain complex concepts simply using intuitive real-world analogies, connecting them to Computer Science principles.
2. Teach me step-by-step in 5 digestible modules:
   - Module 1: The Big Picture (What was the goal, architecture, and feature we introduced?)
   - Module 2: Code Anatomy (How do the key files, functions, and data structures work?)
   - Module 3: Tooling & Protocols (What libraries, APIs, or protocols did we use and why?)
   - Module 4: Real-World Bug Post-Mortems (What edge cases, build issues, or bugs occurred, and how were they fixed?)
   - Module 5: Engineering Decisions & Trade-Offs (Why did we make these design choices instead of alternatives?)
3. Teach me one module at a time. After explaining each module:
   - Provide a concrete code snippet from our session.
   - Ask me 1 or 2 interactive check-for-understanding questions to test my intuition before moving forward.
   - Let me ask any questions I have.

Start by greeting me, outlining our roadmap, and jumping into Module 1!
`;

const outputPath = path.join(__dirname, '../docs/gemini_tutor_latest_prompt.md');
fs.writeFileSync(outputPath, promptTemplate.trim(), 'utf8');

console.log('========================================================');
console.log('✅ Gemini Tutor Prompt Generated Successfully!');
console.log(`📁 Saved to: ${outputPath}`);
console.log('📋 You can copy it directly or paste it into Gemini.');
console.log('========================================================\n');
console.log(promptTemplate.trim());
