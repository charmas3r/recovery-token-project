---
description: Analyze technical documentation from Confluence pages and generate a comprehensive technical summary
argument-hint: [confluence-link]
---

# Analyze Technical Document: Confluence Technical Documentation Analysis

## Overview

Analyze technical documentation from Confluence pages using the Atlassian MCP server to generate a comprehensive technical summary. This command handles various technical documentation types including firmware API specifications, architecture documents, protocol specifications, integration guides, and system design documents.

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
   - Confirm: "Atlassian MCP server detected and connected. Ready to analyze your technical documentation."
   - Proceed with the analysis

## Input Requirements

### Step 1: Gather Confluence Information

Prompt the user for the following information:

```
To analyze your technical documentation, I need the following:

1. **Confluence Link:** Please provide the Confluence page URL containing the technical documentation.
   - Page URL format: https://yoursite.atlassian.net/wiki/spaces/SPACE/pages/123456789/Page+Title
   - The page ID (123456789) will be extracted from the URL

2. **Document Type:** What type of technical documentation is this?
   - API Specification (firmware, REST, GraphQL, etc.)
   - Architecture Document
   - System Design Document
   - Protocol Specification
   - Integration Guide
   - Hardware/Firmware Specification
   - Data Model/Schema Documentation
   - Interface Contract Document
   - Other (please describe)

3. **Component/System Name:** What component or system does this documentation pertain to?
   - Example: "Device Firmware v2.0", "Authentication Service", "Matter Protocol Handler"

4. **Analysis Focus (optional):** What aspects should be prioritized?
   - Full analysis (default)
   - Focus on API contracts/interfaces
   - Focus on data structures/schemas
   - Focus on integration points
   - Focus on security considerations
   - Focus on dependencies

5. **Include Child Pages (optional):** Should child/descendant pages also be analyzed?
   - Yes: Analyze the main page and all descendant pages
   - No: Analyze only the specified page

6. **Project Context (optional):** Any additional context that helps interpretation?
   - Example: "This is for an IoT device" or "Must integrate with cloud services"
```

### Step 2: Parse Confluence URLs

Extract relevant information from provided URLs:
- URL format: `https://yoursite.atlassian.net/wiki/spaces/SPACE/pages/PAGE_ID/Page+Title`
- Extract: site URL (cloudId), page ID
- The site URL can be used as the cloudId parameter directly

## Document Type Classification

### Automatic Classification

After retrieving the document, classify it into one of these categories based on content analysis:

| Document Type | Key Indicators | Analysis Focus |
|--------------|----------------|----------------|
| **API Specification** | Endpoints, methods, request/response schemas, HTTP verbs, status codes | Contracts, data types, error handling |
| **Architecture Document** | Component diagrams, system boundaries, layers, modules | Dependencies, scalability, patterns |
| **Protocol Specification** | Message formats, state machines, handshakes, sequences | Protocol flow, error states, timing |
| **Integration Guide** | Setup steps, configuration, connection details | Prerequisites, troubleshooting, examples |
| **Firmware Specification** | Registers, memory maps, commands, hardware interfaces | Hardware abstraction, commands, states |
| **Data Model Documentation** | Entities, relationships, schemas, field definitions | Constraints, relationships, validation |
| **Interface Contract** | Service interfaces, method signatures, contracts | Input/output, preconditions, exceptions |

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

### Phase 3: Document Structure Analysis

Parse the retrieved content to identify:
- Document sections and hierarchy
- Code blocks and examples
- Tables (API parameters, data definitions)
- Diagrams (sequence, architecture, flow)
- Version information
- Change history

## Analysis Framework

### For API Specifications

Extract and document:

1. **API Overview**
   - API name and version
   - Base URL/endpoint pattern
   - Authentication method
   - Rate limiting details
   - Supported formats (JSON, XML, Protobuf, etc.)

2. **Endpoints/Methods**
   - HTTP method and path (or RPC method name)
   - Purpose and description
   - Request parameters (path, query, body)
   - Request body schema
   - Response schema (success and error)
   - Status codes and error codes
   - Example requests/responses

3. **Data Models**
   - Object/entity definitions
   - Field types and constraints
   - Required vs optional fields
   - Relationships between models
   - Enumerations and constants

4. **Authentication & Authorization**
   - Auth mechanisms
   - Token formats
   - Permission requirements
   - Scope definitions

### For Architecture Documents

Extract and document:

1. **System Overview**
   - System purpose and scope
   - High-level architecture pattern
   - Key design decisions
   - Technology stack

2. **Components**
   - Component names and responsibilities
   - Component interfaces
   - Component dependencies
   - Communication patterns

3. **Data Flow**
   - Data sources and sinks
   - Data transformation points
   - Storage mechanisms
   - Caching strategies

4. **Integration Points**
   - External system interfaces
   - APIs consumed
   - Events published/subscribed
   - Protocol requirements

5. **Quality Attributes**
   - Scalability approach
   - Security architecture
   - Performance considerations
   - Reliability mechanisms

### For Firmware/Hardware Specifications

Extract and document:

1. **Hardware Interface**
   - Communication protocols (I2C, SPI, UART, etc.)
   - Register maps and addresses
   - Memory layout
   - Pin configurations

2. **Command Set**
   - Command codes/opcodes
   - Command parameters
   - Response formats
   - Timing requirements

3. **State Machine**
   - Device states
   - State transitions
   - Events/triggers
   - Error states

4. **Data Formats**
   - Message structures
   - Byte ordering (endianness)
   - Encoding formats
   - Checksums/CRCs

### For Protocol Specifications

Extract and document:

1. **Protocol Overview**
   - Protocol name and version
   - Transport layer requirements
   - Connection establishment
   - Session management

2. **Message Formats**
   - Message structure/framing
   - Header fields
   - Payload formats
   - Message types

3. **Sequences**
   - Handshake sequences
   - Request-response patterns
   - Async notification patterns
   - Error handling sequences

4. **Error Handling**
   - Error codes
   - Recovery procedures
   - Timeout handling
   - Retry policies

## Cross-Cutting Analysis

Regardless of document type, also analyze:

### Dependencies
- External services/systems
- Libraries/SDKs
- Hardware requirements
- Protocol/standard dependencies

### Security Considerations
- Authentication requirements
- Encryption specifications
- Access control
- Data sensitivity

### Versioning & Compatibility
- Version numbering scheme
- Backward compatibility notes
- Migration requirements
- Deprecation notices

### Constraints & Limitations
- Performance constraints
- Resource limitations
- Platform requirements
- Known limitations

### Gaps & Ambiguities
- Missing specifications
- Unclear definitions
- Inconsistencies
- Areas needing clarification

## Output Document

Write the analysis to: `.cursor/docs/references/technical-documentation-summarization.md`

### Document Structure

```markdown
# Technical Documentation Analysis: [Component/System Name]

## Overview
- **Document Title:** [Title from Confluence]
- **Component/System:** [Name]
- **Document Type:** [API Spec/Architecture/Protocol/etc.]
- **Version:** [Document or API version]
- **Analyzed:** [Date]
- **Confluence Source:** [Link(s)]
- **Last Updated:** [From Confluence metadata]

## Executive Summary
[2-3 paragraph summary covering:
- What this documentation describes
- Key technical components/interfaces
- Critical implementation considerations
- Notable gaps or areas needing attention]

## Document Classification
- **Primary Type:** [API Specification | Architecture | Protocol | Firmware | Integration | Data Model]
- **Relevance:** [Which system components this pertains to]
- **Audience:** [Developers, Integrators, Hardware Engineers, etc.]
- **Maturity:** [Draft | Review | Approved | Deprecated]

---

## Technical Summary

### Component Overview
[Brief description of the component/system this documentation covers]

**Purpose:** [What problem does it solve?]

**Scope:** [What does it cover and not cover?]

**Key Capabilities:**
- [Capability 1]
- [Capability 2]
- [Capability 3]

---

## API/Interface Specification

### Endpoints/Methods Summary
| Endpoint/Method | Type | Purpose | Auth Required |
|-----------------|------|---------|---------------|
| [/path or method] | [GET/POST/RPC] | [Brief purpose] | [Yes/No] |

### Detailed Interface Definitions

#### [Interface/Endpoint Name]
**Description:** [What it does]

**Request:**
```
[Method] [Path/Pattern]
Headers:
  - [Header]: [Value/Description]

Parameters:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| [param] | [type] | [Yes/No] | [Description] |

Body Schema:
{
  "field": "type // description"
}
```

**Response:**
```
Success (200/OK):
{
  "field": "type // description"
}

Error Responses:
| Code | Meaning | Body |
|------|---------|------|
| [code] | [meaning] | [error schema] |
```

[Repeat for each interface/endpoint...]

---

## Data Models/Schemas

### Entity Definitions

#### [Entity Name]
**Description:** [What this entity represents]

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| [field] | [type] | [Yes/No] | [constraints] | [description] |

**Relationships:**
- [Relationship to other entities]

**Example:**
```json
{
  "example": "value"
}
```

### Enumerations & Constants
| Name | Values | Usage |
|------|--------|-------|
| [EnumName] | [value1, value2, ...] | [Where used] |

---

## Architecture Components

### Component Inventory
| Component | Responsibility | Technology | Dependencies |
|-----------|---------------|------------|--------------|
| [Name] | [What it does] | [Tech stack] | [What it depends on] |

### Component Interactions
```
[Text description or ASCII diagram of component interactions]
```

### Data Flow
1. [Step 1: Data flows from A to B]
2. [Step 2: B processes and sends to C]
3. [Continue...]

---

## Protocol/Communication Details

### Message Formats
| Message Type | Direction | Purpose | Format |
|--------------|-----------|---------|--------|
| [Type] | [In/Out/Both] | [Purpose] | [JSON/Binary/etc] |

### Sequence Diagrams
```
[Text description of key sequences]

Example:
Client -> Server: Request
Server -> Database: Query
Database -> Server: Response
Server -> Client: Response
```

### State Machine
| State | Description | Transitions |
|-------|-------------|-------------|
| [State] | [Description] | [Events that cause transitions] |

---

## Security Considerations

### Authentication
- **Method:** [OAuth2/API Key/Token/Certificate/etc.]
- **Details:** [How to authenticate]

### Authorization
- **Model:** [RBAC/ABAC/etc.]
- **Permissions:** [List of permissions/scopes]

### Data Protection
- **Encryption:** [In transit/at rest details]
- **Sensitive Data:** [PII, credentials, etc. handling]

---

## Dependencies & Requirements

### External Dependencies
| Dependency | Type | Version | Purpose | Critical |
|------------|------|---------|---------|----------|
| [Name] | [Service/Library/Hardware] | [Version] | [Why needed] | [Yes/No] |

### System Requirements
- **Runtime:** [OS, platform requirements]
- **Resources:** [Memory, CPU, storage requirements]
- **Network:** [Connectivity requirements]

### Compatibility
- **Backward Compatibility:** [Notes on compatibility]
- **Supported Versions:** [Version matrix if applicable]

---

## Constraints & Limitations

### Technical Constraints
| Constraint | Description | Impact | Workaround |
|------------|-------------|--------|------------|
| [Constraint] | [Details] | [How it affects implementation] | [If any] |

### Performance Limitations
| Aspect | Limit | Notes |
|--------|-------|-------|
| [Rate limit/timeout/etc.] | [Value] | [Additional context] |

### Known Limitations
- [Limitation 1]
- [Limitation 2]

---

## Implementation Guidance

### Quick Start
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Best Practices
- [Practice 1]
- [Practice 2]

### Common Pitfalls
- [Pitfall 1: Description and how to avoid]
- [Pitfall 2: Description and how to avoid]

### Code Examples
```[language]
// Example implementation
[code]
```

---

## Gaps & Clarifications Needed

### Missing Information
| Area | What's Missing | Impact | Priority |
|------|----------------|--------|----------|
| [Area] | [Description] | [How it affects implementation] | [High/Med/Low] |

### Ambiguities
| Section | Ambiguity | Possible Interpretations | Recommendation |
|---------|-----------|--------------------------|----------------|
| [Section] | [What's unclear] | [Option A, Option B] | [Suggested clarification] |

### Inconsistencies
| Location 1 | Location 2 | Inconsistency | Resolution Needed |
|------------|------------|---------------|-------------------|
| [Where] | [Where] | [What conflicts] | [Who to ask] |

---

## Change Log & Versioning

### Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| [Version] | [Date] | [Author] | [Summary of changes] |

### API/Interface Versioning
- **Current Version:** [Version]
- **Deprecation Policy:** [If documented]
- **Migration Notes:** [If applicable]

---

## Related Documentation

### Internal References
| Document | Relationship | Link |
|----------|--------------|------|
| [Title] | [How related] | [Confluence link] |

### External References
| Resource | Type | Link |
|----------|------|------|
| [Name] | [Standard/Spec/Tutorial] | [URL] |

---

## Appendix

### Confluence Page References
| Page | Title | Page ID | Direct Link |
|------|-------|---------|-------------|
| Main | [Title] | [ID] | [URL] |
| Child 1 | [Title] | [ID] | [URL] |

### Glossary
| Term | Definition |
|------|------------|
| [Term] | [Definition specific to this documentation] |

### Analysis Methodology
- Confluence pages retrieved via Atlassian MCP server
- Document classified based on content structure and terminology
- Technical specifications extracted from tables, code blocks, and structured content
- Gaps identified by comparing against standard documentation requirements
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
   - Ask for document type (or auto-detect)
   - Ask for component/system name
   - Ask for analysis focus preference
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

5. **Classify Document**
   - Analyze content structure and terminology
   - Determine document type (API spec, architecture, protocol, etc.)
   - Identify the component/system it pertains to
   - Note the document's maturity level

6. **Extract Technical Details**
   - Parse API endpoints/methods
   - Extract data models and schemas
   - Identify components and their relationships
   - Document protocols and message formats
   - Note security requirements

7. **Analyze Dependencies & Constraints**
   - List external dependencies
   - Document system requirements
   - Identify limitations and constraints
   - Note compatibility requirements

8. **Identify Gaps & Ambiguities**
   - Missing specifications
   - Unclear definitions
   - Inconsistencies in the documentation
   - Areas needing clarification

9. **Generate Output**
   - Write comprehensive analysis to `.cursor/docs/references/technical-documentation-summarization.md`
   - Follow the document structure above
   - Adapt sections based on document type (omit irrelevant sections)
   - Include all page references for traceability

10. **Confirm Completion**
    - Report summary of documentation analyzed
    - Highlight document type and component relevance
    - List critical technical details extracted
    - Flag gaps, ambiguities, or areas needing stakeholder clarification
    - Suggest next steps or related documentation to review

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
- **Unsupported Document Format:** Explain what could not be parsed and suggest alternatives

## Notes

- Always verify MCP server availability before starting
- Adapt the output structure based on document type (not all sections apply to all types)
- For firmware/hardware specs, pay special attention to byte ordering, timing, and register details
- For API specs, ensure all error codes and edge cases are documented
- Cross-reference with existing PRD, user stories, or design documents when available
- Note any discrepancies between the documentation and other sources
- Flag documentation that appears outdated or incomplete
- Consider creating follow-up tasks for gaps that need resolution
- Include original Confluence formatting context where relevant (tables, diagrams referenced)
