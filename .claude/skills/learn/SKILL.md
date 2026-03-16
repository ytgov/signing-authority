---
description: Analyzes recent code changes to extract learnings about formatting, style, and patterns. Asks for clarification when needed, commits patterns to memory, and updates AGENTS.md for project-wide conventions.
auto_execution_mode: 1
---

## Intent

**WHY this workflow exists:** Manual corrections by users represent valuable implicit knowledge about preferences, patterns, and conventions. Without capturing these learnings, the same corrections must be made repeatedly across conversations.

**WHAT this workflow produces:**
- Memory entries that persist learnings across conversations
- Updates to AGENTS.md for project-wide patterns
- Updates to relevant workflows with new decision rules

**Decision Rules:**
- **Memory vs AGENTS.md:** Use memory for personal preferences; use AGENTS.md for project patterns that should be shared with other developers/agents
- **Workflow updates:** Only update workflows if the learning represents a reusable decision rule, not a one-off fix
- **Ask before assuming:** When a correction could have multiple interpretations, ask for clarification

---

## Process

Review the most recent file changes made by the user (shown in system reminders) and:

1. **Reflect on the changes**: Identify what changed and understand why it's better
   - Formatting preferences
   - Code style patterns
   - Structural improvements
   - Best practices demonstrated

2. **Ask for clarification** if the reasoning behind any change is unclear or could apply to multiple scenarios

3. **Internalize the learnings**: Explicitly state that you'll remember and apply these patterns going forward

4. **Create memory entry** for the learned patterns to ensure they persist across conversations and can be applied in future work

5. **Update AGENTS.md** if the learning represents a project-wide pattern or convention that should be documented for consistency

6. **Evaluate this workflow**: Consider whether this workflow itself should be tweaked for better pattern extraction or knowledge capture

7. **Update relevant workflows**: If any workflows were used in the current context and could benefit from the learned patterns, update those workflow files with new decision rules in their Intent sections

Format as concise bullet points with clear before/after examples where applicable.