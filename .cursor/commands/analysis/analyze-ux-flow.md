---
description: Analyze a UX flow from Figma designs and generate a comprehensive summary
argument-hint: [feature-name]
---

# Summarize UX Flow: Figma Design Analysis

## Overview

Analyze UX flows from Figma designs using the Figma MCP server to generate a comprehensive feature summary. This command extracts screen flows, user interactions, edge cases, and constraints from Figma designs.

## Prerequisites: Figma MCP Server

**IMPORTANT:** This command requires the Figma MCP server to be enabled.

### Check MCP Server Availability

Before proceeding, verify the Figma MCP server is available:

1. **If Figma MCP server is NOT available:**
   - Prompt the user: "The Figma MCP server is required for this command. Please enable it in Cursor Settings > MCP > Enable 'Figma Desktop' server, then run this command again."
   - STOP execution until the server is enabled

2. **If Figma MCP server IS available:**
   - Confirm: "Figma MCP server detected. Ready to analyze your designs."
   - Proceed with the analysis

## Input Requirements

### Step 1: Gather Figma Information

Prompt the user for the following information:

```
To analyze your UX flow, I need the following:

1. **Figma Link(s):** Please provide the Figma URL(s) for the screens/frames you want to analyze.
   - For a single screen: https://figma.com/design/:fileKey/:fileName?node-id=123-456
   - For multiple screens: Provide each URL or specify a parent frame containing all screens

2. **Feature Name:** What is the name of this feature? (e.g., "User Onboarding", "Checkout Flow")

3. **Flow Context:** Brief description of what this flow accomplishes (1-2 sentences)

4. **Screen Range (optional):** If the flow contains many screens, specify which screens to focus on
   - Example: "Screens 1-5" or "Login through Dashboard"
```

### Step 2: Parse Figma URLs

Extract node IDs from provided URLs:
- URL format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
- Extract nodeId: Convert `1-2` to `1:2` format
- For branch URLs: `https://figma.com/design/:fileKey/branch/:branchKey/:fileName` - use branchKey as fileKey

## Analysis Process

### Phase 1: Structure Discovery

Use the Figma MCP `get_metadata` tool to understand the overall structure:

```
Tool: get_metadata
Arguments:
  - nodeId: [extracted from URL or page ID like "0:1"]
  - clientLanguages: "typescript,javascript"
  - clientFrameworks: "react,nextjs"
```

This provides:
- Layer hierarchy and structure
- Node IDs for individual screens/frames
- Screen names and positions
- Frame organization

### Phase 2: Screen-by-Screen Analysis

For each identified screen/frame in the flow, use `get_design_context`:

```
Tool: get_design_context
Arguments:
  - nodeId: [screen node ID]
  - clientLanguages: "typescript,javascript"
  - clientFrameworks: "react,nextjs"
  - artifactType: "WEB_PAGE_OR_APP_SCREEN"
```

Extract from each screen:
- UI components present
- Interactive elements (buttons, inputs, links)
- Navigation targets
- State indicators
- Error states visible
- Loading states
- Empty states

### Phase 3: Visual Capture

For complex screens or when visual context is needed, use `get_screenshot`:

```
Tool: get_screenshot
Arguments:
  - nodeId: [screen node ID]
  - clientLanguages: "typescript,javascript"
  - clientFrameworks: "react,nextjs"
```

### Phase 4: FigJam Analysis (if applicable)

If the user provides a FigJam board with flow diagrams:

```
Tool: get_figjam
Arguments:
  - nodeId: [board node ID]
  - includeImagesOfNodes: true
```

## Analysis Framework

### Identify Flow Characteristics

For each screen in the flow, document:

1. **Screen Purpose**
   - What is the user trying to accomplish?
   - What information is displayed?
   - What actions are available?

2. **Entry Points**
   - How does the user arrive at this screen?
   - What previous screens lead here?
   - Are there deep link scenarios?

3. **Exit Points**
   - Where can the user go from here?
   - What actions trigger navigation?
   - Back/cancel behavior

4. **User Interactions**
   - Form inputs and validation
   - Button actions and targets
   - Gestures (swipe, tap, long-press)
   - Selection patterns

5. **State Variations**
   - Default/initial state
   - Loading states
   - Empty states
   - Error states
   - Success states
   - Disabled states

### Identify Edge Cases

Look for and document:

- **Empty States:** What shows when there's no data?
- **Error Handling:** How are errors displayed?
- **Boundary Conditions:** Max characters, item limits, etc.
- **Permission States:** Locked, unauthorized, premium features
- **Network States:** Offline, slow connection indicators
- **First-Time User:** Onboarding overlays, tooltips
- **Returning User:** Saved state, preferences

### Identify Constraints

Document technical and design constraints:

- **Technical Constraints:**
  - API dependencies
  - Real-time data requirements
  - Authentication requirements
  - Platform-specific behaviors

- **Design Constraints:**
  - Responsive breakpoints
  - Accessibility requirements
  - Animation/transition specifications
  - Component library dependencies

- **Business Constraints:**
  - Feature flags
  - A/B test variations
  - Premium vs. free features
  - Localization requirements

## Output Document

Write the analysis to: `.cursor/docs/references/ux-flow-feature-summarization.md`

### Document Structure

```markdown
# UX Flow Analysis: [Feature Name]

## Overview
- **Feature:** [Name]
- **Analyzed:** [Date]
- **Figma Source:** [Link(s)]
- **Total Screens:** [Count]

## Executive Summary
[2-3 paragraph summary of the flow, its purpose, and key user journey]

## Flow Diagram
[Text-based flow diagram showing screen progression]

```
[Entry] → [Screen 1] → [Screen 2] → [Screen 3] → [Exit]
                ↓           ↓
           [Error]    [Alternative]
```

## Screen-by-Screen Analysis

### Screen 1: [Screen Name]
**Purpose:** [What this screen accomplishes]

**Entry Points:**
- [How users arrive here]

**UI Components:**
- [List of key components]

**User Actions:**
- [ ] Action 1 → [Target/Result]
- [ ] Action 2 → [Target/Result]

**State Variations:**
| State | Description | Visual Indicator |
|-------|-------------|------------------|
| Default | Initial load | Normal UI |
| Loading | Data fetching | Spinner/Skeleton |
| Empty | No data | Empty state message |
| Error | API failure | Error banner |

**Exit Points:**
- [Where users can navigate from here]

[Repeat for each screen...]

## Edge Cases

### Empty States
| Screen | Trigger Condition | Behavior |
|--------|-------------------|----------|
| [Screen] | [Condition] | [What displays] |

### Error Scenarios
| Error Type | Trigger | User Message | Recovery Action |
|------------|---------|--------------|-----------------|
| [Type] | [Cause] | [Message shown] | [How to recover] |

### Boundary Conditions
- **[Field/Element]:** [Min/Max/Constraints]

## Constraints

### Technical Constraints
- [ ] [Constraint 1]
- [ ] [Constraint 2]

### Design Constraints
- [ ] [Constraint 1]
- [ ] [Constraint 2]

### Business Rules
- [ ] [Rule 1]
- [ ] [Rule 2]

## Navigation Map

| From Screen | Action | To Screen | Condition |
|-------------|--------|-----------|-----------|
| [Screen A] | [Button tap] | [Screen B] | [If any] |

## Component Inventory

| Component | Screens Used | Variants |
|-----------|--------------|----------|
| [Component] | [Screen list] | [Variant list] |

## Implementation Notes

### Priority Considerations
1. [Critical path elements]
2. [Secondary flows]
3. [Edge case handling]

### Recommended Implementation Order
1. [First implement...]
2. [Then implement...]
3. [Finally implement...]

### Open Questions
- [ ] [Question needing clarification]

## Appendix

### Figma Node References
| Screen | Node ID | Direct Link |
|--------|---------|-------------|
| [Name] | [ID] | [URL] |
```

## Execution Steps

### Step-by-Step Process

1. **Verify MCP Server**
   - Check if Figma MCP server is available
   - If not, prompt user to enable it and STOP

2. **Collect Input**
   - Ask for Figma URL(s)
   - Ask for feature name
   - Ask for flow context
   - Ask for screen range (if needed)

3. **Analyze Structure**
   - Use `get_metadata` on the parent node/page
   - Identify all screens/frames in the flow
   - Map the screen hierarchy

4. **Deep Dive Each Screen**
   - Use `get_design_context` for each screen
   - Capture components, interactions, states
   - Use `get_screenshot` for complex screens

5. **Synthesize Analysis**
   - Map the complete user journey
   - Identify all edge cases
   - Document constraints
   - Note open questions

6. **Generate Output**
   - Write comprehensive analysis to `.cursor/docs/references/ux-flow-feature-summarization.md`
   - Follow the document structure above
   - Include all node references for future updates

7. **Confirm Completion**
   - Report summary of findings
   - Highlight critical edge cases
   - List open questions for design team
   - Suggest implementation priorities

## Error Handling

- **MCP Server Unavailable:** Stop and guide user to enable it
- **Invalid Figma URL:** Request corrected URL
- **Access Denied:** Prompt user to check Figma permissions
- **Node Not Found:** Verify node ID and file access
- **Large Files:** Focus on specified screen range, paginate analysis

## Notes

- Always verify MCP server availability before starting
- For complex flows (10+ screens), break into logical sub-flows
- Cross-reference with any existing PRD or requirements documents
- Note any discrepancies between designs and documented requirements
- Flag designs that appear incomplete or need clarification
