---
description: Generate comprehensive QA hand-off impact analysis for software changes
argument-hint: [feature-name]
---

# Impact Analysis Report

Generate a comprehensive impact analysis report for QA hand-off. This report provides QE teams with context, clarity, and confidence about software changes.

## Overview

Every ticket with code changes requires an engineering assessment when handed off to the QA team for validation. This command analyzes implementation changes and generates a thorough impact analysis covering edge cases, worst-case scenarios, test scenarios, feature flags, and telemetry.

## Prerequisites: Atlassian MCP Server (Optional)

The Atlassian MCP server can be used to reference the official QA Hand-Off template.

### Check MCP Server Availability

1. **If Atlassian MCP server is available:**
   - Confirm: "Atlassian MCP server detected. Template reference available from Confluence."
   - Optionally fetch template from: `https://arlo.atlassian.net/wiki/spaces/MPN/pages/154599722/QA+Hand+Off+Impact+Analysis`

2. **If Atlassian MCP server is NOT available:**
   - Proceed with built-in template (this command includes the full template structure)
   - Note: "Atlassian MCP server not detected. Using built-in QA Hand-Off template."

## Input Requirements

### Required Argument

- **Feature Name ($1):** The name of the feature being analyzed
  - Used to locate execution report at: `.cursor/execution-reports/$1.md`
  - Used to name output file: `.cursor/impact-analysis-reports/$1.md`

### Step 1: Gather Context

Read the following sources to understand the changes:

1. **Execution Report:**
   ```
   .cursor/execution-reports/$1.md
   ```
   - If not found, prompt user: "Execution report not found at `.cursor/execution-reports/$1.md`. Please provide the feature name or path to the execution report."

2. **Related Plan (if referenced in execution report):**
   - Read the plan file mentioned in the execution report

3. **Git Changes:**
   ```bash
   git diff HEAD~10 --stat  # Get overview of recent changes
   git log --oneline -10    # Recent commits
   ```

4. **Modified Files:**
   - Read each file modified as part of this feature implementation
   - Identify components, services, and modules affected

### Step 2: Gather Additional Information

Prompt the user for information not available in the execution report:

```
To complete the impact analysis, I need additional information:

1. **Build Information:**
   - Build link/version to be tested:
   - Branch name:

2. **Environment Details:**
   - Environment tested (dev/staging/prod):
   - Firmware version (if applicable):
   - OS versions tested:

3. **Feature Flags:**
   - LaunchDarkly flag name and link (if applicable):
   - Kill switch details:
   - Capabilities JSON nodes (if applicable):

4. **Related Jira Ticket(s):**
   - Ticket ID(s):

5. **Figma Links (if applicable):**
   - Design reference links:

6. **Known Issues:**
   - Any known issues or limitations:
```

## Analysis Process

### Phase 1: Change Analysis

Analyze the execution report and code changes to identify:

1. **Files Changed**
   - List all added, modified, and deleted files
   - Categorize by type (UI, API, service, util, test, etc.)

2. **Components Affected**
   - UI components modified
   - Services/APIs touched
   - Database/storage changes
   - Configuration changes

3. **Dependency Analysis**
   - What depends on the changed code?
   - What does the changed code depend on?
   - Cross-module impacts

### Phase 2: Impact Assessment

For each area of change, assess:

1. **Direct Impact**
   - Primary functionality affected
   - User-facing changes
   - API contract changes

2. **Indirect Impact**
   - Related features that share code
   - Features that consume affected APIs
   - Downstream effects

3. **Risk Assessment**
   - Likelihood of regression
   - Severity if regression occurs
   - Blast radius of potential issues

### Phase 3: Test Scenario Generation

Generate comprehensive test scenarios:

1. **Happy Path Scenarios**
   - Primary use cases
   - Expected user flows

2. **Edge Cases**
   - Boundary conditions
   - Empty/null states
   - Maximum/minimum values
   - Special characters
   - Network conditions (offline, slow, timeout)

3. **Negative Scenarios**
   - Invalid inputs
   - Error conditions
   - Permission/auth failures
   - Concurrent operations

4. **Cross-Feature Scenarios**
   - Integration with other features
   - Feature flag combinations
   - User segment variations

### Phase 4: Worst-Case Analysis

Document potential failure modes:

1. **What Can Break?**
   - List specific components/features at risk
   - Data integrity concerns
   - User experience degradation

2. **Worst-Case Scenarios**
   - Most severe potential failures
   - Data loss possibilities
   - Security implications
   - Performance degradation

3. **Mitigation Strategies**
   - Rollback procedures
   - Kill switch activation
   - Monitoring alerts to set up

### Phase 5: Telemetry & Metrics

Document relevant telemetry:

1. **Events to Monitor**
   - New events added
   - Existing events affected
   - Event properties changed

2. **Dashboards**
   - Amplitude dashboard links
   - Splunk queries
   - Key metrics to watch

3. **Success Criteria**
   - Metrics that indicate success
   - Thresholds for concern
   - Alerting recommendations

## Output Document

Save the analysis to: `.cursor/impact-analysis-reports/$1.md`

### Document Structure

```markdown
# QA Hand-Off & Impact Analysis: [Feature Name]

## Meta Information
- **Feature:** [Feature name]
- **Date:** [Current date]
- **Author:** [Engineering team/developer]
- **Jira Ticket(s):** [Ticket IDs with links]
- **Execution Report:** [Path to execution report]

---

## Build

| Field | Value |
|-------|-------|
| Build Link | [Link to build] |
| Branch | [Branch name] |
| Commit | [Commit hash] |
| Version | [App version] |

---

## Scope of Work

### Summary
[Brief description of what was implemented]

### Screens/Components Updated
- [ ] [Screen/Component 1]
- [ ] [Screen/Component 2]

### Design References
- Figma: [Link if applicable]
- Requirements: [Link to requirements doc]

### Files Changed

| Type | Files Added | Files Modified | Files Deleted |
|------|-------------|----------------|---------------|
| UI | [count] | [count] | [count] |
| Services | [count] | [count] | [count] |
| Tests | [count] | [count] | [count] |
| Config | [count] | [count] | [count] |

<details>
<summary>Full File List</summary>

**Added:**
- `path/to/file1.ts`

**Modified:**
- `path/to/file2.ts`

**Deleted:**
- `path/to/file3.ts`

</details>

---

## Impact Analysis

### Areas of App Affected
| Area | Impact Level | Description |
|------|--------------|-------------|
| [Area 1] | High/Medium/Low | [How it's affected] |
| [Area 2] | High/Medium/Low | [How it's affected] |

### Impact on Existing Features
| Feature/Device | Impact | Notes |
|----------------|--------|-------|
| [Feature/NPI 1] | ✅ None / ⚠️ Minor / 🔴 Major | [Details] |
| [Feature/NPI 2] | ✅ None / ⚠️ Minor / 🔴 Major | [Details] |

### Dependency Analysis
```
[Component A] 
  └── depends on → [Component B] (modified)
      └── used by → [Component C] (may be affected)
```

### What Can Break?
1. **[Risk Area 1]**
   - Likelihood: High/Medium/Low
   - Severity: Critical/High/Medium/Low
   - Description: [What could go wrong]

2. **[Risk Area 2]**
   - Likelihood: High/Medium/Low
   - Severity: Critical/High/Medium/Low
   - Description: [What could go wrong]

### Worst-Case Scenarios
| Scenario | Impact | Mitigation |
|----------|--------|------------|
| [Scenario 1] | [User/system impact] | [How to recover/prevent] |
| [Scenario 2] | [User/system impact] | [How to recover/prevent] |

---

## Test Scenarios

### Dev Tested Scenarios ✅
| Scenario | Environment | FW Version | Result | Evidence |
|----------|-------------|------------|--------|----------|
| [Scenario 1] | [Env] | [Version] | ✅ Pass | [Link to PR/screenshot] |
| [Scenario 2] | [Env] | [Version] | ✅ Pass | [Link to PR/screenshot] |

### Required QA Test Scenarios

#### Happy Path
- [ ] **[Scenario 1]:** [Description]
  - Steps: [1, 2, 3...]
  - Expected: [Expected outcome]
  
- [ ] **[Scenario 2]:** [Description]
  - Steps: [1, 2, 3...]
  - Expected: [Expected outcome]

#### Edge Cases
- [ ] **[Edge Case 1]:** [Description]
  - Condition: [What makes this an edge case]
  - Expected: [Expected behavior]

- [ ] **[Edge Case 2]:** [Description]
  - Condition: [What makes this an edge case]
  - Expected: [Expected behavior]

#### Negative Scenarios
- [ ] **[Negative 1]:** [Description]
  - Input/Condition: [Invalid input or error condition]
  - Expected: [Expected error handling]

#### Cross-Feature Testing
- [ ] **[Cross-Feature 1]:** [Description]
  - Related Feature: [Feature name]
  - Integration Point: [Where they interact]

### Edge Case Matrix

| Dimension | Variations to Test |
|-----------|-------------------|
| Theme | Light, Dark, System |
| Form Factor | Phone, Tablet |
| OS Version | [Min supported] - [Latest] |
| Network | Online, Offline, Slow (3G), Timeout |
| Locale | [Key locales to test] |
| User State | New user, Existing user, Guest |

---

## Feature Flags & Capabilities

### LaunchDarkly Flags
| Flag Name | Purpose | Default | Kill Switch? |
|-----------|---------|---------|--------------|
| [flag-name] | [What it controls] | true/false | Yes/No |

**Flag Link:** [LaunchDarkly URL]

### Kill Switch Impact
If the kill switch is activated:
- **Affected Features:** [List features that would be disabled]
- **User Experience:** [What users would see]
- **Other Devices Affected:** [Cross-device impact]

### Capabilities Configuration
```json
{
  "capabilities": {
    "[node-path]": {
      "[key]": "[value]"
    }
  }
}
```

**Gating Logic:** [Explain how capabilities gate the feature]

---

## Metrics & Telemetry

### New/Modified Events
| Event Name | Type | Properties | Dashboard |
|------------|------|------------|-----------|
| [event_name] | Track/Screen | [key props] | [Link] |

### Key Metrics to Monitor
| Metric | Baseline | Alert Threshold | Dashboard |
|--------|----------|-----------------|-----------|
| [Metric 1] | [Current value] | [Threshold] | [Link] |
| [Metric 2] | [Current value] | [Threshold] | [Link] |

### Relevant Dashboards
- **Amplitude:** [Dashboard link]
- **Splunk:** [Query or dashboard link]

---

## Known Issues

| Issue | Severity | Jira Link | Workaround |
|-------|----------|-----------|------------|
| [Issue 1] | High/Medium/Low | [JIRA-123] | [Workaround if any] |

---

## Release Plan

### Rollout Strategy
- [ ] **Phase 1:** [Description] - [Target %] of users
- [ ] **Phase 2:** [Description] - [Target %] of users
- [ ] **Phase 3:** Full rollout

### Post-Launch Tasks
- [ ] Remove feature flag: [flag-name] by [date]
- [ ] Monitor metrics for [duration]
- [ ] [Other post-launch tasks]

### Rollback Plan
1. [Step 1 - e.g., Disable flag in LaunchDarkly]
2. [Step 2 - e.g., Revert commit if needed]
3. [Step 3 - e.g., Communicate to stakeholders]

---

## QA Sign-Off Checklist

### Pre-Testing
- [ ] Build is accessible and correct version
- [ ] Test environment is configured correctly
- [ ] Feature flags are set appropriately
- [ ] Test data is prepared

### Testing Complete
- [ ] All happy path scenarios passed
- [ ] All edge cases tested
- [ ] All negative scenarios handled correctly
- [ ] Cross-feature integration verified
- [ ] Performance acceptable
- [ ] No new issues introduced

### Sign-Off
- **QA Engineer:** _______________
- **Date:** _______________
- **Result:** ✅ Approved / ❌ Rejected
- **Notes:** _______________
```

## Execution Steps

### Step-by-Step Process

1. **Check for Atlassian MCP Server**
   - List available MCP servers
   - If `user-Atlassian-MCP-Server` is available, note it for template reference
   - Proceed regardless of availability

2. **Read Execution Report**
   - Load `.cursor/execution-reports/$1.md`
   - Extract: files changed, challenges, divergences, validation results
   - If not found, prompt user for location or create from scratch

3. **Analyze Code Changes**
   - Run `git diff` and `git log` to understand changes
   - Read modified files to understand scope
   - Map dependencies and impact areas

4. **Gather Additional Context**
   - Prompt user for build info, flags, Jira tickets
   - Check for related PRD or design docs
   - Look for existing telemetry configuration

5. **Generate Impact Analysis**
   - Assess direct and indirect impacts
   - Identify risk areas and worst-case scenarios
   - Document mitigation strategies

6. **Generate Test Scenarios**
   - Create happy path scenarios
   - Identify edge cases from code analysis
   - Document negative scenarios
   - Consider cross-feature interactions

7. **Document Telemetry**
   - List new/modified events
   - Link to relevant dashboards
   - Define success metrics

8. **Create Output Document**
   - Write comprehensive report to `.cursor/impact-analysis-reports/$1.md`
   - Follow the document structure above
   - Ensure all sections are complete or marked N/A

9. **Confirm Completion**
   - Summarize key risks identified
   - Highlight critical test scenarios
   - Note any open questions for QA

## Error Handling

- **Execution Report Not Found:** Prompt user for correct path or feature name
- **No Git History:** Analyze current code state, note limited historical context
- **Missing Information:** Mark sections as "TBD - Needs Input" and list questions
- **Large Change Set:** Break analysis into logical sections, prioritize high-risk areas

## Notes

- Be thorough but concise - QE teams need actionable information
- Prioritize risks by likelihood and severity
- Include specific steps for test scenarios, not just descriptions
- Link to evidence (PRs, screenshots, recordings) where available
- Consider the perspective of someone unfamiliar with the code
- Flag any assumptions made during analysis
- Update this report as new information becomes available
