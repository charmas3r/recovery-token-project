---
description: Create a Product Requirements Document from conversation and reference docs
argument-hint: [output-filename]
---

# Create PRD: Generate Product Requirements Document

## Overview

Generate a comprehensive Product Requirements Document (PRD) based on the current conversation context AND the reference documentation sources listed below. Use the structure and sections defined to create a thorough, professional PRD.

## Reference Documentation Sources

Before generating the PRD, **read ALL documents from the `.cursor/docs/references/` folder**. This folder contains all research and analysis outputs that should be synthesized into the PRD.

**Standard reference documents include (but are not limited to):**

1. **Technical Documentation** - `technical-documentation-summarization.md`
   - Use for: API specifications, architecture components, data models, security considerations, dependencies, implementation guidance

2. **Telemetry Analysis** - `telemetry-feature-summarization.md`
   - Use for: Success metrics, user behavior insights, conversion funnels, monitoring recommendations, experiment ideas

3. **User Story Analysis** - `user-story-summarization.md`
   - Use for: User stories, functional requirements, edge cases, constraints, dependencies, gaps and open questions

4. **UX Flow Analysis** - `ux-flow-feature-summarization.md`
   - Use for: Screen-by-screen requirements, navigation flows, UI components, state variations, error handling, accessibility constraints

**Additional custom research documents:**
- Any additional `.md` files in `.cursor/docs/references/` created through manual research
- Custom analysis outputs for specific feature domains
- Notes and findings from ad-hoc investigation

> **Important:** Always scan the entire `.cursor/docs/references/` directory and read ALL markdown files found there. Do not assume only the 4 standard files exist.

## Output File

Write the PRD to: `$ARGUMENTS` (default: `prd.md`)

## PRD Structure

Create a well-structured PRD with the following sections. Adapt depth and detail based on available information:

### Required Sections

**1. Executive Summary**
- Concise product overview (2-3 paragraphs)
- Core value proposition
- MVP goal statement

**2. Mission**
- Product mission statement
- Core principles (3-5 key principles)

**3. Target Users**
- Primary user personas
- Technical comfort level
- Key user needs and pain points

**4. MVP Scope**
- **In Scope:** Core functionality for MVP (use ✅ checkboxes)
- **Out of Scope:** Features deferred to future phases (use ❌ checkboxes)
- Group by categories (Core Functionality, Technical, Integration, Deployment)

**5. User Stories**
- Primary user stories (5-8 stories) in format: "As a [user], I want to [action], so that [benefit]"
- Include concrete examples for each story
- Add technical user stories if relevant

**6. Core Architecture & Patterns**
- High-level architecture approach
- Directory structure (if applicable)
- Key design patterns and principles
- Technology-specific patterns

**7. Tools/Features**
- Detailed feature specifications
- If building an agent: Tool designs with purpose, operations, and key features
- If building an app: Core feature breakdown

**8. Technology Stack**
- Backend/Frontend technologies with versions
- Dependencies and libraries
- Optional dependencies
- Third-party integrations

**9. Security & Configuration**
- Authentication/authorization approach
- Configuration management (environment variables, settings)
- Security scope (in-scope and out-of-scope)
- Deployment considerations

**10. API Specification** (if applicable)
- Endpoint definitions
- Request/response formats
- Authentication requirements
- Example payloads

**11. Success Criteria**
- MVP success definition
- **Measurable KPIs (REQUIRED):**
  - Specific metrics to track (conversion rates, engagement time, error rates, etc.)
  - Target values for each metric
  - Measurement methodology (how/where metrics are captured)
  - Telemetry/analytics instrumentation requirements
  - Success/failure thresholds
- Functional requirements (use ✅ checkboxes)
- Quality indicators
- User experience goals

**12. Implementation Phases**
- Break down into 3-4 phases
- Each phase includes: Goal, Deliverables (✅ checkboxes), Validation criteria
- Realistic timeline estimates

**13. Future Considerations**
- Post-MVP enhancements
- Integration opportunities
- Advanced features for later phases

**14. Risks & Mitigations**
- 3-5 key risks with specific mitigation strategies

**15. Appendix** (if applicable)
- Related documents
- Key dependencies with links
- Repository/project structure

## Instructions

### 1. Read Reference Documentation

**First, list all files in `.cursor/docs/references/` directory to discover all available research documents.**

Then read all markdown files found and extract relevant information:

**From Technical Documentation:**
- API/Interface specifications → API Specification section
- Architecture components → Core Architecture & Patterns section
- Data models/schemas → API Specification and Architecture sections
- Security considerations → Security & Configuration section
- Dependencies → Technology Stack section
- Implementation guidance → Implementation Phases section
- Constraints/limitations → Risks & Mitigations section

**From Telemetry Analysis:**
- Key metrics and targets → Success Criteria section (CRITICAL: Define as measurable KPIs)
- User behavior insights → Target Users section
- Conversion funnels → User Stories and Success Criteria sections
- Monitoring recommendations → Success Criteria section (include in KPI measurement methodology)
- Experiment ideas → Future Considerations section

**From User Story Analysis:**
- User stories inventory → User Stories section
- Functional requirements → MVP Scope and Tools/Features sections
- Edge cases → Tools/Features section (include as acceptance criteria)
- Constraints and dependencies → Risks & Mitigations section
- Gaps and open questions → Appendix or Risks section

**From UX Flow Analysis:**
- Screen-by-screen specs → Tools/Features section
- Navigation flows → User Stories and Tools/Features sections
- UI components → Tools/Features section
- State variations → Tools/Features section (include all states)
- Error handling → Tools/Features and Risks sections
- Accessibility constraints → Tools/Features and Security & Configuration sections

### 2. Extract Conversation Context
- Review the entire conversation history
- Identify explicit requirements and implicit needs
- Note technical constraints and preferences
- Capture user goals and success criteria

### 3. Synthesize All Sources
- Merge information from reference docs with conversation context
- Resolve any conflicts (conversation context takes precedence)
- Fill in reasonable assumptions where details are missing
- Maintain consistency across sections
- Ensure technical feasibility
- Flag if reference docs are empty/unpopulated

### 4. Write the PRD
- Use clear, professional language
- Include concrete examples and specifics
- Use markdown formatting (headings, lists, code blocks, checkboxes)
- Add code snippets for technical sections where helpful
- Keep Executive Summary concise but comprehensive
- Cross-reference source documents where helpful

### 5. Quality Checks
- ✅ All required sections present
- ✅ **ALL files from `.cursor/docs/references/` directory have been read and synthesized**
- ✅ User stories have clear benefits
- ✅ MVP scope is realistic and well-defined
- ✅ Technology choices are justified
- ✅ Implementation phases are actionable
- ✅ **CRITICAL: Measurable KPIs are defined with specific metrics, target values, and measurement methodology**
- ✅ Success criteria are measurable
- ✅ Telemetry/analytics requirements are specified for KPI tracking
- ✅ Consistent terminology throughout
- ✅ Reference documentation incorporated where populated
- ✅ Edge cases from UX flows and user stories included

## Style Guidelines

- **Tone:** Professional, clear, action-oriented
- **Format:** Use markdown extensively (headings, lists, code blocks, tables)
- **Checkboxes:** Use ✅ for in-scope items, ❌ for out-of-scope
- **Specificity:** Prefer concrete examples over abstract descriptions
- **Length:** Comprehensive but scannable (typically 30-60 sections worth of content)

## Output Confirmation

After creating the PRD:
1. Confirm the file path where it was written
2. Provide a brief summary of the PRD contents
3. Highlight any assumptions made due to missing information
4. Suggest next steps (e.g., review, refinement, planning)

## Notes

- **CRITICAL:** Always list and read ALL files in `.cursor/docs/references/` directory—don't assume only the 4 standard files exist
- If critical information is missing, ask clarifying questions before generating
- Adapt section depth based on available details
- For highly technical products, emphasize architecture and technical stack
- For user-facing products, emphasize user stories and experience
- Reference documents may be empty templates if analysis commands haven't been run yet—proceed with available information
- If reference docs contain placeholder text (e.g., "[Feature Name]", "No analysis yet"), note this in the PRD and rely on conversation context
- When reference docs conflict with each other or conversation context, prioritize: (1) conversation context, (2) most recently updated reference doc
- Custom research files in the references folder may have any filename—read them all to capture the full research context

## Reference Document Commands

To populate the reference documents before generating a PRD, run these analysis commands:

- `/analyze-technical-document` → Populates technical-documentation-summarization.md
- `/analyze-telemetry` → Populates telemetry-feature-summarization.md  
- `/analyze-user-stories` → Populates user-story-summarization.md
- `/analyze-ux-flow` → Populates ux-flow-feature-summarization.md

