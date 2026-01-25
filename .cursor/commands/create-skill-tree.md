---
description: "Generate comprehensive skill definitions from PRD for one-pass feature implementation"
---

# Create Skill Tree from PRD

## Mission

Analyze the project's PRD (`prd.md`) and generate a **complete set of skill definitions** under `.cursor/skills/` that enable AI agents to implement features in a single pass without needing additional research or pattern discovery.

**Core Principle**: Skills are reusable knowledge modules. Each skill should contain everything an agent needs to implement features in that domain: patterns, code examples, file locations, type/model definitions, validation approaches, and common operations.

---

## Phase 1: PRD Analysis

**Read and extract from `prd.md`:**

1. **Technology Stack** - Identify all languages, frameworks, libraries, databases, APIs, and services
2. **Feature Domains** - Map distinct functional areas (e.g., auth, search, content, payments)
3. **Data Models** - Extract all entities, relationships, and schemas
4. **Integrations** - Note external services and their purposes
5. **Architectural Patterns** - Identify conventions (server-first, API-first, etc.)
6. **Security Requirements** - Auth, authorization, validation approaches

---

## Phase 2: Skill Identification

**Categorize extracted technologies and domains into skill areas:**

### Infrastructure Skills
Skills for core technical foundations:
- Database/ORM patterns
- Authentication/authorization
- File storage
- Email/notifications
- Caching
- API clients for external services

### UI/UX Skills
Skills for user interface implementation:
- Component library patterns
- Styling conventions
- Form handling and validation
- State management
- Loading/error/empty states
- Accessibility patterns

### Feature Skills
Skills for cross-cutting concerns:
- Search and filtering
- SEO and metadata
- Analytics and tracking
- Internationalization
- Real-time updates

### Domain Skills
Skills specific to the project's business domain:
- Core domain models and definitions
- Business logic patterns
- Domain-specific validation rules
- Admin/management patterns
- Workflow implementations

**Naming Convention:** Use kebab-case for skill folder names (e.g., `form-validation`, `file-storage`, `user-auth`)

---

## Phase 3: Skill File Structure

**For each identified skill, create `.cursor/skills/{skill-name}/SKILL.md` with this structure:**

````markdown
# {Skill Name} Skill

## Overview

{1-2 sentence description of what this skill covers and when an agent should use it}

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| {role}    | {library}  | {ver}   |

## Directory Structure

```
{where files for this skill domain live - use actual extensions from PRD}
lib/{skill}/
  ├── client.{ext}      # Client setup
  ├── queries.{ext}     # Data fetching
  └── types.{ext}       # Type/model definitions
```

## Core Patterns

### Pattern: {Descriptive Name}

**When to use:** {Situation where this pattern applies}

**File Location:** `{path/to/file.ext}`

```{language}
// Complete, copy-pasteable code example
// Include all imports/requires
// Include all type annotations or docstrings as appropriate
```

### Pattern: {Next Pattern}
...

## Type/Model Definitions

```{language}
// All types, interfaces, models, or structs for this domain
// Include documentation comments for complex definitions
```

## Common Operations

### {Operation Name}

**Purpose:** {What this accomplishes}

**File:** `{path/to/implementation}`

```{language}
{Complete implementation with imports}
```

**Usage:**

```{language}
{How to call/use this operation}
```

## Database/API Reference

{If applicable: tables, schemas, endpoints, external API patterns}

## Validation

```{language}
// Validation schemas or functions
// Include all field validations
// Include error messages
```

## Error Handling

```{language}
// Standard error handling pattern for this domain
// Include error types/classes
// Include recovery strategies
```

## Testing Patterns

```{language}
// How to test features using this skill
// Include test setup
// Include common assertions
```

## Gotchas & Best Practices

- **DO:** {Best practice}
- **DO:** {Another best practice}
- **AVOID:** {Common mistake}
- **AVOID:** {Another pitfall}

## Related Skills

- `{skill-name}` - {Why/when to use together}
````

---

## Phase 4: Skill Content Requirements

**Each skill file MUST include:**

### Completeness Checklist

- [ ] **All imports specified** - No guessing required
- [ ] **Full type/model definitions** - Every type, model, struct, or class
- [ ] **Copy-pasteable examples** - Code works without modification
- [ ] **File paths included** - Where each pattern lives
- [ ] **Environment variables** - Any required config keys
- [ ] **Error handling** - How to handle failures
- [ ] **Validation rules** - All input validation

### Content Depth Guidelines

**For Database/Storage Skills:**
- Complete schema definitions
- All CRUD operation patterns
- Query patterns with joins/relations
- Migration patterns if applicable
- Security rules (RLS, permissions)

**For API/Integration Skills:**
- Client initialization
- Authentication patterns
- Request/response definitions
- Rate limiting considerations
- Webhook handling if applicable

**For UI Component Skills:**
- Import statements for each component
- Component property definitions
- Composition patterns
- Responsive variants
- Accessibility requirements

**For Form/Validation Skills:**
- Schema definitions for all forms
- Field-level validation
- Form submission patterns
- Error display patterns
- Success handling

**For Domain Skills:**
- Complete entity definitions
- Business rule implementations
- State transitions
- Relationship handling

---

## Phase 5: Cross-Skill Consistency

**Ensure consistency across all generated skills:**

1. **Type/Model Names** - Same entity uses same name everywhere
2. **Import Paths** - Consistent path aliases and conventions
3. **Error Patterns** - Uniform error handling approach
4. **Naming Conventions** - Consistent function/variable naming
5. **File Locations** - Logical, predictable file organization

---

## Output Structure

```
.cursor/skills/
├── {infrastructure-skill-1}/
│   └── SKILL.md
├── {infrastructure-skill-2}/
│   └── SKILL.md
├── {ui-skill-1}/
│   └── SKILL.md
├── {feature-skill-1}/
│   └── SKILL.md
├── {domain-skill-1}/
│   └── SKILL.md
└── ... (one folder per identified skill)
```

---

## Execution Steps

1. **Read** `prd.md` completely
2. **Extract** technology stack, features, and data models
3. **Identify** all skills needed (typically 8-15 skills)
4. **Create** `.cursor/skills/` directory
5. **Generate** each `SKILL.md` with comprehensive content using the project's language
6. **Validate** code examples are syntactically correct
7. **Cross-reference** to ensure naming consistency
8. **Report** summary of generated skills

---

## Quality Criteria

### One-Pass Implementation Test

An agent should be able to implement any PRD feature by:
1. Reading the relevant skill file(s)
2. Copying and adapting the patterns
3. Following the documented conventions

**Without needing to:**
- Search the codebase for examples
- Look up external documentation
- Ask clarifying questions about patterns
- Guess at definitions or imports

### Completeness Verification

For each skill, verify:
- [ ] Could implement a new feature using only this skill file?
- [ ] Are all code examples complete with imports?
- [ ] Are all types/models fully defined?
- [ ] Are file locations specified?
- [ ] Are error cases handled?

---

## Report Format

After generating all skills, provide:

```markdown
## Skill Tree Generation Complete

### Skills Generated ({count})

| Skill | Category | Key Patterns |
|-------|----------|--------------|
| {name} | {category} | {patterns} |

### Coverage Analysis

- **PRD Features Covered:** {list}
- **Technology Stack Covered:** {list}

### Cross-Skill Dependencies

- {skill-a} → {skill-b}: {relationship}

### Confidence Score: {X}/10

{Brief assessment of one-pass implementation readiness}
```
