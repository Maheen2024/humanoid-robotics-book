---
id: 1
title: AI Generated Book RAG Chatbot Constitution Update
stage: constitution
date: 2025-12-18
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: Taha Baig
command: /sp.constitution
labels: [constitution,rag,chatbot,spec-first]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - .specify/templates/plan-template.md
 - .specify/templates/spec-template.md
 - .specify/templates/tasks-template.md
tests:
 - null
---

## Prompt

```
Project: AI-Generated Book with Embedded RAG Chatbot

Purpose:
Create a unified technical book using Claude Code and Spec-Kit Plus, publish it with Docusaurus on GitHub Pages, and embed a RAG chatbot that answers questions strictly from the book content.

Core Principles:
1. Spec-First: All content and code must follow explicit specifications.
2. Single Source of Truth: The book content is the only knowledge base.
3. No Hallucination: The chatbot must not answer beyond indexed content.
4. Modular Design: Content, RAG pipeline, backend, and UI are clearly separated.
5. Deterministic Output: Same inputs must produce consistent behavior.

Key Standards:
- Markdown-first Docusaurus docs
- Clear, instructional technical writing
- RAG ingestion from book files only
- Answers must cite source sections or refuse when insufficient context exists
- Selected-text mode must restrict answers to user-highlighted text

Technology Constraints:
- Spec-Kit Plus + Claude Code
- Docusaurus + GitHub Pages
- FastAPI backend
- OpenAI Agents/ChatKit SDKs
- Qdrant Cloud (Free Tier) for embeddings
- Neon Serverless Postgres for metadata/state

Constraints:
- Single repository
- Free-tier compatible
- No external knowledge injection
- Reproducible via documentation alone

Success Criteria:
- Book deploys successfully
- Chatbot answers accurately from book content only
- Selected-text Q&A works correctly
- End-to-end setup reproducible by a new developer

End of Constitution
```

## Response snapshot

Updated the project constitution to reflect the new AI-Generated Book with Embedded RAG Chatbot project. The constitution now includes:

Core Principles:
- Spec-First: All content and code must follow explicit specifications
- Single Source of Truth: The book content is the only knowledge base
- No Hallucination: The chatbot must not answer beyond indexed content
- Modular Design: Content, RAG pipeline, backend, and UI are clearly separated
- Deterministic Output: Same inputs must produce consistent behavior
- Technical Constraint Adherence: Compliance with specified technology stack

Additional sections:
- Technology and Standards: Markdown-first Docusaurus docs, RAG ingestion from book files only, no external knowledge injection
- Development Workflow: Single repository approach, reproducible via documentation
- Governance: Constitution governs all project activities, compliance verification required

Updated related templates to ensure consistency:
- plan-template.md: Added constitution check items
- spec-template.md: Added constitution alignment requirements
- tasks-template.md: Added constitution compliance checks

## Outcome

- ✅ Impact: Project constitution updated with specific principles and requirements for RAG chatbot book project
- 🧪 Tests: N/A
- 📁 Files: Updated constitution and related templates
- 🔁 Next prompts: N/A
- 🧠 Reflection: Constitution now properly reflects project requirements and constraints

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A