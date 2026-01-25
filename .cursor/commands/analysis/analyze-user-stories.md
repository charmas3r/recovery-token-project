---
description: Analyze user stories from Confluence pages and generate a comprehensive requirements summary
argument-hint: [feature-name]
---

# Analyze User Stories: Confluence Requirements Analysis

## Overview

Analyze user stories from Confluence pages using the Atlassian MCP server to generate a comprehensive requirements summary. This command extracts functional requirements, non-functional requirements, acceptance criteria, edge cases, and constraints from user story documentation.

## Prerequisites: Atlassian MCP Server

**IMPORTANT:** This command requires the Atlassian MCP server to be enabled.

### Check MCP Server Availability

Before proceeding, verify the Atlassian MCP server is available:

1. **Test MCP Server Connection:**
   - Attempt to call the `getConfluencePage` tool with a test request
   - If the tool is available and responds, the server is connected
   - Alternatively, check if Atlassian-related tools (e.g., `getConfluencePage`, `searchConfluenceUsingCql`) are listed in available MCP tools

2. **If Atlassian MCP server is NOT installed:**
   - Prompt the user:
   ```
   The Atlassian MCP server is required for this command but is not available.
   
   To set up the Atlassian MCP server:
   
   1. Install the Atlassian MCP server:
      - Repository: https://github.com/atlassian/mcp-server-atlassian
      - Follow the installation instructions in the repository README
   
   2. Configure it with your Atlassian credentials:
      - Atlassian API Token (generate at https://id.atlassian.com/manage-profile/security/api-tokens)
      - Your Atlassian email address
      - Site URL (e.g., https://yourcompany.atlassian.net)
   
   3. Add the server configuration to your Cursor MCP settings:
      - Open Cursor Settings (Cmd/Ctrl + ,)
      - Navigate to: Features > MCP Servers
      - Add a new MCP server with the Atlassian configuration
      - Example configuration:
        {
          "mcpServers": {
            "atlassian": {
              "command": "npx",
              "args": ["-y", "@anthropic/atlassian-mcp-server"],
              "env": {
                "ATLASSIAN_SITE_URL": "https://yourcompany.atlassian.net",
                "ATLASSIAN_USER_EMAIL": "your-email@company.com",
                "ATLASSIAN_API_TOKEN": "your-api-token"
              }
            }
          }
        }
   
   4. Restart Cursor to load the new MCP server
   
   Once set up, run this command again.
   ```
   - STOP execution until the server is installed and configured

3. **If Atlassian MCP server IS installed but DISABLED:**
   - Prompt the user:
   ```
   The Atlassian MCP server appears to be installed but is currently disabled or not responding.
   
   Please enable it:
   1. Open Cursor Settings (Cmd/Ctrl + ,)
   2. Navigate to: Features > MCP Servers
   3. Find 'Atlassian' in the server list
   4. Toggle it ON to enable
   5. Wait for the server to connect (green status indicator)
   6. If it fails to connect, check your API token and credentials are still valid
   
   Once enabled, run this command again.
   ```
   - STOP execution until the server is enabled

4. **If Atlassian MCP server IS available and enabled:**
   - Confirm: "Atlassian MCP server detected and connected. Ready to analyze your Confluence user stories."
   - Proceed with the analysis

## Input Requirements

### Step 1: Gather Confluence Information

Prompt the user for the following information:

```
To analyze your user stories, I need the following:

1. **Confluence Link:** Please provide the Confluence page URL containing user stories.
   - Page URL format: https://yoursite.atlassian.net/wiki/spaces/SPACE/pages/123456789/Page+Title
   - The page ID (123456789) will be extracted from the URL

2. **Feature Name:** What is the name of this feature? (e.g., "User Authentication", "Payment Processing", "Dashboard Widgets")

3. **Analysis Scope:** What aspect of the user stories should be prioritized?
   - Full analysis (default)
   - Focus on edge cases
   - Focus on non-functional requirements
   - Focus on acceptance criteria

4. **Include Child Pages (optional):** Should child/descendant pages also be analyzed?
   - Yes: Analyze the main page and all descendant pages
   - No: Analyze only the specified page

5. **Project Context (optional):** Any additional context about the project that helps interpretation?
   - Example: "This is for a mobile app" or "Must support offline mode"
```

### Step 2: Parse Confluence URLs

Extract relevant information from provided URLs:
- URL format: `https://yoursite.atlassian.net/wiki/spaces/SPACE/pages/PAGE_ID/Page+Title`
- Extract: site URL (cloudId), page ID
- The site URL can be used as the cloudId parameter directly

## Analysis Process

### Phase 1: Page Retrieval

Use the Atlassian MCP `getConfluencePage` tool to retrieve the content:

```
Tool: getConfluencePage
Arguments:
  - cloudId: [extracted site URL, e.g., "https://yoursite.atlassian.net"]
  - pageId: [extracted page ID, e.g., "123456789"]
  - contentFormat: "markdown"
```

This provides:
- Page title and metadata
- Full page content in markdown format
- Author and last modified information

### Phase 2: Descendant Pages (if requested)

If the user wants to include child pages, use `getConfluencePageDescendants`:

```
Tool: getConfluencePageDescendants
Arguments:
  - cloudId: [site URL]
  - pageId: [parent page ID]
  - depth: 2 (or specified depth)
  - limit: 50
```

Then retrieve each descendant page using `getConfluencePage` for full content.

### Phase 3: Content Parsing

Parse the retrieved content to identify:
- User story format (As a... I want... So that...)
- Acceptance criteria sections
- Technical requirements
- Constraints and limitations
- Dependencies
- Diagrams or flowcharts (noted for reference)

## Analysis Framework

### User Story Extraction

For each user story identified, extract:

1. **Story Identification**
   - Story ID/Reference (if present)
   - Story title
   - Epic or parent feature
   - Priority (if indicated)
   - Story points/estimate (if indicated)

2. **Core Elements**
   - **Actor/Persona:** Who is the user?
   - **Goal/Want:** What does the user want to accomplish?
   - **Benefit/Value:** Why does the user want this?

3. **Acceptance Criteria**
   - Given/When/Then scenarios
   - Success conditions
   - Validation rules
   - Expected behaviors

### Functional Requirements Analysis

Document all functional requirements with attention to:

1. **Primary Functionality**
   - Core features and capabilities
   - User interactions
   - System behaviors
   - Data operations (CRUD)

2. **Business Rules**
   - Validation rules
   - Calculation logic
   - Workflow rules
   - Authorization rules

3. **Integration Requirements**
   - API interactions
   - Third-party services
   - Data synchronization
   - External system dependencies

### Non-Functional Requirements Analysis

Identify and categorize non-functional requirements:

1. **Performance Requirements**
   - Response time expectations
   - Throughput requirements
   - Concurrent user limits
   - Data volume handling

2. **Security Requirements**
   - Authentication requirements
   - Authorization/permissions
   - Data encryption needs
   - Audit logging requirements

3. **Scalability Requirements**
   - Growth expectations
   - Load handling
   - Resource scaling needs

4. **Reliability Requirements**
   - Uptime requirements
   - Error handling expectations
   - Recovery procedures
   - Data backup needs

5. **Usability Requirements**
   - Accessibility standards (WCAG)
   - Responsive design needs
   - Localization requirements
   - User experience constraints

6. **Compliance Requirements**
   - Regulatory compliance (GDPR, HIPAA, etc.)
   - Industry standards
   - Legal requirements

### Edge Cases Analysis

Systematically identify edge cases:

1. **Input Edge Cases**
   - Empty/null values
   - Maximum/minimum values
   - Invalid formats
   - Special characters
   - Boundary conditions

2. **State Edge Cases**
   - First-time user scenarios
   - Returning user scenarios
   - Concurrent modifications
   - Race conditions
   - Session timeout scenarios

3. **Error Edge Cases**
   - Network failures
   - Service unavailability
   - Partial failures
   - Data corruption scenarios
   - Permission denied scenarios

4. **Business Edge Cases**
   - Edge pricing scenarios
   - Time zone edge cases
   - Multi-currency scenarios
   - Role-specific edge cases

### Constraints Analysis

Document all constraints:

1. **Technical Constraints**
   - Technology stack limitations
   - Platform restrictions
   - Browser/device requirements
   - API limitations
   - Database constraints

2. **Business Constraints**
   - Budget limitations
   - Timeline requirements
   - Resource availability
   - Regulatory restrictions

3. **Design Constraints**
   - UI/UX guidelines
   - Brand requirements
   - Accessibility requirements
   - Responsive design requirements

4. **Dependencies**
   - External service dependencies
   - Internal system dependencies
   - Data dependencies
   - Timing dependencies

### Gaps and Ambiguities

Identify areas needing clarification:

- Missing acceptance criteria
- Ambiguous requirements
- Undefined edge cases
- Conflicting requirements
- Missing non-functional requirements
- Unclear dependencies

## Output Document

Write the analysis to: `.cursor/docs/references/user-story-summarization.md`

### Document Structure

```markdown
# User Story Analysis: [Feature Name]

## Overview
- **Feature:** [Name]
- **Analyzed:** [Date]
- **Confluence Source:** [Link(s)]
- **Total Stories Analyzed:** [Count]
- **Analysis Scope:** [Full/Focused on X]

## Executive Summary
[2-3 paragraph summary of the feature, its purpose, key requirements, and critical considerations. Highlight any major risks, gaps, or areas needing attention.]

## User Stories Inventory

### Story Summary Table
| ID | Title | Actor | Priority | Status | Complexity |
|----|-------|-------|----------|--------|------------|
| [ID] | [Title] | [User type] | [High/Med/Low] | [Ready/Needs Work] | [Simple/Medium/Complex] |

### Detailed Story Analysis

#### Story: [Story ID/Title]
**User Story:**
> As a [actor], I want [goal], so that [benefit].

**Acceptance Criteria:**
1. [ ] [Criterion 1]
2. [ ] [Criterion 2]
3. [ ] [Criterion 3]

**Functional Requirements:**
- [Requirement 1]
- [Requirement 2]

**Edge Cases Identified:**
- [Edge case 1]
- [Edge case 2]

**Dependencies:**
- [Dependency 1]

**Open Questions:**
- [ ] [Question needing clarification]

[Repeat for each story...]

## Functional Requirements Summary

### Core Functionality
| Requirement | Description | Stories | Priority |
|-------------|-------------|---------|----------|
| [FR-001] | [Description] | [Story IDs] | [High/Med/Low] |

### Business Rules
| Rule ID | Description | Validation Logic | Stories |
|---------|-------------|------------------|---------|
| [BR-001] | [Description] | [Logic] | [Story IDs] |

### Data Requirements
| Entity | Operations | Validation | Storage |
|--------|------------|------------|---------|
| [Entity] | [CRUD operations] | [Rules] | [Requirements] |

### Integration Points
| System | Direction | Data | Protocol | Stories |
|--------|-----------|------|----------|---------|
| [System] | [In/Out/Both] | [Data exchanged] | [API/Event/etc] | [Story IDs] |

## Non-Functional Requirements Summary

### Performance Requirements
| Requirement | Target | Measurement | Priority |
|-------------|--------|-------------|----------|
| Response Time | [X ms] | [How measured] | [Priority] |
| Throughput | [X req/s] | [How measured] | [Priority] |
| Concurrent Users | [X users] | [Scenario] | [Priority] |

### Security Requirements
| Requirement | Description | Implementation Notes |
|-------------|-------------|---------------------|
| Authentication | [Details] | [Notes] |
| Authorization | [Details] | [Notes] |
| Data Protection | [Details] | [Notes] |

### Scalability Requirements
| Aspect | Current | Target | Growth Plan |
|--------|---------|--------|-------------|
| [Aspect] | [Current state] | [Target] | [Plan] |

### Reliability Requirements
| Requirement | Target | Fallback Strategy |
|-------------|--------|-------------------|
| Uptime | [X%] | [Strategy] |
| Recovery Time | [X min] | [Strategy] |

### Usability Requirements
| Requirement | Standard | Scope |
|-------------|----------|-------|
| Accessibility | [WCAG 2.1 AA] | [All/Specific features] |
| Responsive | [Breakpoints] | [Devices] |
| Localization | [Languages] | [Regions] |

### Compliance Requirements
| Regulation | Requirement | Impact |
|------------|-------------|--------|
| [GDPR/HIPAA/etc] | [Requirement] | [Features affected] |

## Edge Cases Comprehensive Analysis

### Input Validation Edge Cases
| Field/Input | Edge Case | Expected Behavior | Stories |
|-------------|-----------|-------------------|---------|
| [Field] | Empty value | [Behavior] | [IDs] |
| [Field] | Max length | [Behavior] | [IDs] |
| [Field] | Special chars | [Behavior] | [IDs] |

### State-Based Edge Cases
| Scenario | Trigger Condition | Expected Behavior | Recovery |
|----------|-------------------|-------------------|----------|
| First-time user | No prior data | [Behavior] | N/A |
| Session timeout | Inactivity | [Behavior] | [Recovery] |
| Concurrent edit | Multiple users | [Behavior] | [Resolution] |

### Error Handling Edge Cases
| Error Scenario | Trigger | User Message | System Behavior |
|----------------|---------|--------------|-----------------|
| Network failure | Connectivity lost | [Message] | [Behavior] |
| Service unavailable | Backend down | [Message] | [Behavior] |
| Permission denied | Unauthorized | [Message] | [Behavior] |

### Business Logic Edge Cases
| Scenario | Condition | Expected Outcome | Notes |
|----------|-----------|------------------|-------|
| [Scenario] | [Condition] | [Outcome] | [Notes] |

## Constraints Summary

### Technical Constraints
| Constraint | Description | Impact | Mitigation |
|------------|-------------|--------|------------|
| [Constraint] | [Details] | [Impact on implementation] | [How to address] |

### Business Constraints
| Constraint | Description | Impact | Stakeholder |
|------------|-------------|--------|-------------|
| [Constraint] | [Details] | [Impact] | [Who owns this] |

### Dependencies
| Dependency | Type | Status | Risk Level | Mitigation |
|------------|------|--------|------------|------------|
| [System/Service] | [Hard/Soft] | [Available/Planned] | [High/Med/Low] | [Plan] |

## Gaps and Ambiguities

### Missing Information
| Area | Gap Description | Impact | Resolution Needed |
|------|-----------------|--------|-------------------|
| [Area] | [What's missing] | [Impact on dev] | [Who to ask] |

### Ambiguous Requirements
| Requirement | Ambiguity | Possible Interpretations | Recommended Clarification |
|-------------|-----------|--------------------------|---------------------------|
| [Requirement] | [What's unclear] | [Option A, Option B] | [Question to ask] |

### Conflicting Requirements
| Requirement A | Requirement B | Conflict | Recommended Resolution |
|---------------|---------------|----------|------------------------|
| [Req A] | [Req B] | [Conflict description] | [Recommendation] |

## Risk Assessment

### Technical Risks
| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| [Risk] | [High/Med/Low] | [High/Med/Low] | [Strategy] |

### Business Risks
| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| [Risk] | [High/Med/Low] | [High/Med/Low] | [Strategy] |

## Implementation Recommendations

### Priority Order
1. **Must Have (P0):** [Requirements list]
2. **Should Have (P1):** [Requirements list]
3. **Nice to Have (P2):** [Requirements list]

### Implementation Phases
| Phase | Scope | Stories | Dependencies |
|-------|-------|---------|--------------|
| Phase 1 | [Scope] | [Story IDs] | [Dependencies] |
| Phase 2 | [Scope] | [Story IDs] | [Dependencies] |

### Testing Considerations
- **Unit Testing Focus:** [Key areas]
- **Integration Testing Focus:** [Key areas]
- **Edge Case Testing:** [Priority edge cases]
- **Performance Testing:** [Key scenarios]

## Open Questions for Stakeholders

### Product Questions
- [ ] [Question 1]
- [ ] [Question 2]

### Technical Questions
- [ ] [Question 1]
- [ ] [Question 2]

### Design Questions
- [ ] [Question 1]
- [ ] [Question 2]

## Appendix

### Confluence Page References
| Page | Title | Page ID | Direct Link |
|------|-------|---------|-------------|
| Main | [Title] | [ID] | [URL] |
| Child 1 | [Title] | [ID] | [URL] |

### Glossary
| Term | Definition |
|------|------------|
| [Term] | [Definition] |

### Analysis Methodology
- Confluence pages retrieved via Atlassian MCP server
- User stories parsed using standard formats (As a/I want/So that, Given/When/Then)
- Edge cases identified through systematic analysis of inputs, states, errors, and business logic
- Non-functional requirements extracted from explicit mentions and implied needs
- Gaps identified by comparing against standard requirements checklist
```

## Execution Steps

### Step-by-Step Process

1. **Verify MCP Server**
   - Attempt to use an Atlassian MCP tool (e.g., list Confluence spaces or test connection)
   - If tools are not available, prompt user with setup instructions and STOP
   - If tools fail to respond, prompt user to enable/check the server and STOP
   - If tools respond successfully, proceed with the analysis

2. **Collect Input**
   - Ask for Confluence page URL
   - Ask for feature name
   - Ask for analysis scope preference
   - Ask if child pages should be included
   - Ask for project context (optional)

3. **Parse Confluence URL**
   - Extract site URL (cloudId)
   - Extract page ID from the URL path
   - Validate URL format

4. **Retrieve Page Content**
   - Use `getConfluencePage` with cloudId and pageId
   - Request content in markdown format
   - If child pages requested, use `getConfluencePageDescendants`
   - Retrieve each child page content

5. **Parse User Stories**
   - Identify user story patterns in content
   - Extract acceptance criteria
   - Identify requirements sections
   - Note any diagrams or attachments referenced

6. **Analyze Requirements**
   - Categorize functional requirements
   - Identify non-functional requirements
   - Document business rules
   - Map integration points

7. **Identify Edge Cases**
   - Systematically analyze input edge cases
   - Consider state-based scenarios
   - Identify error handling needs
   - Document business logic edge cases

8. **Document Constraints**
   - Technical constraints
   - Business constraints
   - Dependencies
   - Timeline constraints

9. **Identify Gaps**
   - Missing acceptance criteria
   - Ambiguous requirements
   - Undefined behaviors
   - Missing non-functional requirements

10. **Generate Output**
    - Write comprehensive analysis to `.cursor/docs/references/user-story-summarization.md`
    - Follow the document structure above
    - Include all page references for traceability

11. **Confirm Completion**
    - Report summary of stories analyzed
    - Highlight critical findings (gaps, risks, edge cases)
    - List open questions requiring stakeholder input
    - Suggest next steps

## Error Handling

- **MCP Server Not Installed:** Stop and provide detailed setup instructions
- **MCP Server Disabled:** Stop and guide user to enable it in settings
- **Invalid Confluence URL:** Request corrected URL with format examples
- **Access Denied:** Prompt user to check:
  - Atlassian API token validity
  - Page access permissions
  - Site URL correctness
- **Page Not Found:** Verify page ID and suggest using search
- **Rate Limiting:** Implement delays between requests for large analyses
- **Empty Page:** Report that page has no content and request alternative

## Notes

- Always verify MCP server availability before starting
- For large Confluence pages, focus on structured content sections
- Cross-reference with any existing PRD, technical specs, or design documents
- Note any discrepancies between user stories and other documentation
- Flag user stories that appear incomplete or poorly formed
- Consider the INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable) when evaluating story quality
- Document assumptions made during analysis
- Include original Confluence formatting context where relevant (tables, diagrams referenced)
