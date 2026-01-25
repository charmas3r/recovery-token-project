---
description: Generate a project rule from PRD to enable one-pass task development
argument-hint: [output-filename]
---

# Create Project Rule: Generate Development Rules from PRD

## Overview

Generate a concise, actionable project rule (100-300 lines) from the Product Requirements Document that enables one-pass task development. The rule should provide all context an AI agent needs to implement features without additional clarification.

This command is **tech stack agnostic** — it adapts to whatever technologies are specified in the PRD.

## Input Source

Read and analyze the PRD at: `prd.md`

If the PRD is empty or missing, prompt the user to run `/create-prd` first.

## Output File

Write the project rule to: `$ARGUMENTS` (default: `.cursorrules`)

## Project Rule Structure

Generate a project rule with these sections. **Adapt terminology and patterns to match the PRD's tech stack:**

### Required Sections

**1. Project Overview** (5-10 lines)
- One-paragraph project description
- Tech stack summary on single line (pipe-separated)
- Horizontal rule separator

**2. Project Structure** (15-30 lines)
- Directory tree showing key folders (adapt to framework conventions)
- Brief explanation of organization patterns
- Entry points and routing structure

**3. Code Conventions** (20-40 lines)
- Language-specific patterns (typing, modules, error handling)
- Naming conventions table:

| Element | Convention | Example |
|---------|------------|---------|
| Components/Classes | [Appropriate case] | [Domain example] |
| Functions/Methods | [Appropriate case] | [Domain example] |
| Files | [Appropriate case] | [Domain example] |
| Constants | [Appropriate case] | [Domain example] |
| Database fields | [Appropriate case] | [Domain example] |
| URLs/Routes | [Appropriate case] | [Domain example] |

- Import/module organization rules
- Primary pattern example (single code block showing idiomatic structure)

**4. Logging Standards** (10-15 lines)
- Log level guidance table
- Structured logging pattern for the tech stack
- Security considerations (what not to log)

**5. Testing Approach** (15-20 lines)
- Testing framework and strategy from PRD
- Example test pattern for the stack
- Selector/identifier conventions for testable elements
- Common test commands

**6. Environment Variables** (10-20 lines)
- Table of required variables based on PRD integrations
- Description and sensitivity level for each
- Runtime vs build-time distinction if applicable

**7. Data Models** (10-25 lines)
- Primary data structures/tables/schemas from PRD
- Key fields and relationships
- Storage layer details

**8. Common Commands** (10-15 lines)
- Development server command
- Build/compile command
- Lint/format commands
- Database/migration commands (if applicable)
- Any other tooling from PRD

**9. Checklists** (10-20 lines)
- File creation checklist (adapted to stack)
- Code review checklist
- Use checkbox format `- [ ]`

## Instructions

### 1. Read and Parse PRD

Read `prd.md` and extract:
- **Project identity:** Name, purpose, core value proposition
- **Tech stack:** All languages, frameworks, libraries, services mentioned
- **Architecture:** Directory structure, patterns, component organization
- **Data models:** Database tables, schemas, API shapes, content types
- **Features:** Core functionality that informs conventions
- **Security:** Authentication, authorization, configuration needs
- **Integrations:** External services, APIs, third-party tools
- **Testing:** Testing frameworks, strategies, requirements

### 2. Adapt to Tech Stack

The generated rules must use terminology and patterns appropriate to the PRD's stack:

| Stack Aspect | Adapt These Elements |
|--------------|---------------------|
| Language | Typing approach, module system, idioms |
| Framework | Directory conventions, routing, components |
| Database | Query patterns, migration approach, ORM usage |
| Testing | Test runner, assertion style, mocking approach |
| Deployment | Environment handling, build process |

Do not assume any specific technology. Derive everything from the PRD.

### 3. Generate Concise Rules

**Line Budget:** 100-300 lines total. Prioritize:
1. Information density over verbosity
2. Tables over prose for reference data
3. Code examples over lengthy explanations
4. Actionable patterns over abstract principles

**Formatting Requirements:**
- Use markdown tables for structured data
- Single code block per concept (not multiple small blocks)
- Horizontal rules (`---`) between major sections
- No redundant headers or excessive whitespace

### 4. Ensure One-Pass Development

The rule must enable an AI agent to:
- Understand project context without re-reading PRD
- Know exactly where to place new files
- Apply correct naming conventions immediately
- Use idiomatic patterns for the tech stack
- Follow security and testing requirements

### 5. Quality Checks

Before output, verify:
- [ ] Total line count: 100-300 lines
- [ ] All sections have actionable content
- [ ] Tech stack matches PRD exactly (no assumptions)
- [ ] Directory structure follows framework conventions
- [ ] Naming conventions cover all element types
- [ ] Environment variables include all integrations
- [ ] Checklists are practical for the specific stack
- [ ] No placeholder text or TODOs remain
- [ ] Examples use project domain, not generic placeholders

## Style Guidelines

- **Tone:** Direct, technical, reference-style
- **Format:** Dense markdown (tables, code blocks, lists)
- **Headers:** Use `##` for sections, minimize nesting
- **Examples:** Real examples from project domain, not generic
- **Length:** Shorter is better if information is preserved
- **Stack-specific:** Use correct terminology for the tech stack

## Output Confirmation

After creating the project rule:
1. Confirm the output file path
2. Report total line count
3. Note any PRD gaps that required assumptions

## Example Output Structure

```markdown
# [Project Name] - Project Rules

## Project Overview

[One paragraph description derived from PRD]

**Tech Stack:** [Actual technologies from PRD, pipe-separated]

---

## 1. Project Structure

\`\`\`
project-name/
├── [framework-appropriate directories]
│   └── ...
\`\`\`

[Brief conventions explanation]

---

## 2. Code Conventions

| Element | Convention | Example |
|---------|------------|---------|
| [Appropriate elements for stack] | [Stack conventions] | [Domain examples] |

\`\`\`[language]
// Idiomatic pattern example for this stack
\`\`\`

---

[Continue with remaining sections adapted to tech stack...]

## Checklists

### File Creation
- [ ] [Stack-appropriate checklist items]

### Code Review
- [ ] [Stack-appropriate checklist items]
```

## Error Handling

- **Empty PRD:** Prompt user to create PRD first with `/create-prd`
- **No tech stack in PRD:** Ask user to specify technologies
- **Ambiguous requirements:** Note assumptions in output confirmation
- **PRD too brief:** Generate minimal rule, flag sections needing expansion
