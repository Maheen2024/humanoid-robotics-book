<!-- START SYNC IMPACT REPORT (Automated at constitution update) -->
<!-- Version: 1.0.0 → 1.1.0 -->
<!-- Modified Principles: [PRINCIPLE_1_NAME] → Spec-First, [PRINCIPLE_2_NAME] → Single Source of Truth, [PRINCIPLE_3_NAME] → No Hallucination, [PRINCIPLE_4_NAME] → Modular Design, [PRINCIPLE_5_NAME] → Deterministic Output -->
<!-- Added Sections: [PRINCIPLE_6_NAME] → Technical Constraint Adherence, [SECTION_2_NAME] → Technology and Standards, [SECTION_3_NAME] → Development Workflow -->
<!-- Removed Sections: None -->
<!-- Templates Updated: .specify/templates/plan-template.md ✅ updated, .specify/templates/spec-template.md ✅ updated, .specify/templates/tasks-template.md ✅ updated -->
<!-- Manual Follow-ups: [RATIFICATION_DATE] needs to be set to initial date -->
<!-- END SYNC IMPACT REPORT -->

# AI-Generated Book with Embedded RAG Chatbot Constitution

## Core Principles

### Spec-First
All content and code must follow explicit specifications.

### Single Source of Truth
The book content is the only knowledge base.

### No Hallucination
The chatbot must not answer beyond indexed content.

### Modular Design
Content, RAG pipeline, backend, and UI are clearly separated.

### Deterministic Output
Same inputs must produce consistent behavior.

### Technical Constraint Adherence
All implementations must comply with specified technology stack constraints: Spec-Kit Plus + Claude Code, Docusaurus + GitHub Pages, FastAPI backend, OpenAI Agents/ChatKit SDKs, Qdrant Cloud (Free Tier) for embeddings, and Neon Serverless Postgres for metadata/state.

## Technology and Standards
- Markdown-first Docusaurus documentation
- Clear, instructional technical writing
- RAG ingestion from book files only
- Answers must cite source sections or refuse when insufficient context exists
- Selected-text mode must restrict answers to user-highlighted text
- Free-tier compatible services only
- No external knowledge injection beyond indexed content

## Development Workflow
- Single repository approach
- Reproducible via documentation alone
- End-to-end setup must be reproducible by a new developer
- All changes must maintain deterministic output
- Strict adherence to no-hallucination requirement for chatbot responses

## Governance
The constitution governs all project activities and supersedes any conflicting practices. All implementations must verify compliance with core principles. Any deviation from the specified technology stack must be documented and approved. All pull requests and reviews must verify adherence to the "no hallucination" principle for the chatbot functionality.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-12-18
