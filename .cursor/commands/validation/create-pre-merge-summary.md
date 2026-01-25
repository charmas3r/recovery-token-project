---
description: Generate concise pre-merge summary for PR and team communication
argument-hint: [feature-name]
---

# Create Pre-Merge Summary

## Overview

Generate a concise, team-ready summary that synthesizes implementation results, validation status, and key information for code review and merging. This summary is ideal for:
- Pull request descriptions
- Team standup updates
- Stakeholder communication
- Merge decision-making

## Output File

Write to: `.cursor/execution-reports/[feature-name]-pre-merge-summary.md`

## Required Inputs

Before generating this summary, ensure these artifacts exist:
1. **Execution Report** - `.cursor/execution-reports/[feature-name].md`
2. **Impact Analysis Report** - `.cursor/impact-analysis-reports/[feature-name].md`
3. **Code Review Results** - `.cursor/code-reviews/[feature-name]-*.md` (if applicable)
4. **Validation Results** - From `/validation` command or manual validation checklist

## Summary Structure

### 1. Feature Overview (2-3 sentences)
- What was implemented
- Primary value/benefit
- Reference to PRD section if applicable

### 2. Implementation Summary
**Scope:**
- ✅ Files added: X
- ✅ Files modified: Y
- ✅ Total lines changed: +X -Y
- ✅ Tests added/updated: Z

**Key Changes:**
- [Brief bullet list of major changes, 3-5 items max]

### 3. Validation Status

**Automated Checks:**
- ✅/❌ Linting & Type Checking
- ✅/❌ Unit Tests (X% coverage)
- ✅/❌ Integration Tests
- ✅/❌ Build

**Manual Validation:**
- ✅/❌ Functional testing complete
- ✅/❌ Edge cases verified
- ✅/❌ UI/UX matches specs
- ✅/❌ **KPI instrumentation verified**

**Code Review:**
- ✅/❌ Review complete
- Issues found: X (X critical, Y moderate, Z minor)
- All issues resolved: ✅/❌

### 4. KPI Validation (CRITICAL)

**Metrics Instrumented:**
- [Metric 1]: Implementation details and verification method
- [Metric 2]: Implementation details and verification method
- [Metric 3]: Implementation details and verification method

**Telemetry Verification:**
- ✅/❌ Events fire correctly in dev environment
- ✅/❌ Payloads match specifications
- ✅/❌ Monitoring/alerts configured (if applicable)

### 5. Risk Assessment

**Risk Level:** 🟢 Low / 🟡 Medium / 🔴 High

**Key Risks:**
- [Risk 1]: Mitigation strategy
- [Risk 2]: Mitigation strategy

**Rollback Plan:**
- [Brief description of how to rollback if needed]

### 6. Divergences from Plan (if any)

**[Divergence Name]:**
- **Planned:** [what was expected]
- **Actual:** [what was done]
- **Reason:** [why - justified/necessary/better approach]
- **Impact:** [minimal/moderate/significant]

### 7. Dependencies & Prerequisites

**Merge Prerequisites:**
- [ ] All validation checks pass
- [ ] Code review approved
- [ ] KPIs verified
- [ ] Documentation updated
- [ ] Feature flag configured (if applicable)

**Downstream Dependencies:**
- [Any teams/systems that need to be notified]
- [Any follow-up work required]

### 8. Testing Notes for Reviewers

**How to Test:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
- [What reviewers should see/verify]

**Edge Cases to Verify:**
- [Edge case 1]
- [Edge case 2]

### 9. Post-Merge Actions (if any)

- [ ] Monitor KPIs for X days
- [ ] Enable feature flag for % of users
- [ ] Update team documentation
- [ ] Schedule follow-up work

### 10. Ready to Merge?

**Recommendation:** ✅ Ready / ⚠️ Ready with caveats / ❌ Not ready

**Rationale:**
[1-2 sentence explanation of merge readiness]

## Instructions

### 1. Gather All Artifacts

Read the following files:
- Execution report
- Impact analysis report  
- Code review results
- Validation checklist (if created)
- Any divergence reports from `.cursor/execution-reports/`

### 2. Synthesize Information

- Extract key facts and metrics
- Identify critical information for merge decision
- Highlight any blockers or concerns
- Confirm all validation steps completed

### 3. Write Concisely

- Use bullet points and checkboxes
- Keep explanations brief but complete
- Focus on actionable information
- Make merge readiness crystal clear

### 4. Verify Completeness

Before finalizing, ensure:
- ✅ All validation status items are checked
- ✅ KPI instrumentation is documented and verified
- ✅ Risk assessment is realistic
- ✅ Merge prerequisites are clearly listed
- ✅ Testing instructions are clear for reviewers
- ✅ Merge recommendation is explicit

## Style Guidelines

- **Tone:** Professional, factual, concise
- **Format:** Scannable with checkboxes and status indicators
- **Length:** 1-2 pages max (this is a summary, not full documentation)
- **Audience:** Engineers reviewing the PR and stakeholders approving the merge
- **Status Indicators:** Use ✅ (pass), ❌ (fail), ⚠️ (warning), 🟢🟡🔴 (risk levels)

## Output Confirmation

After creating the summary:
1. Confirm the file path where it was written
2. State the merge recommendation clearly
3. Highlight any blockers or critical items requiring attention
4. Note any post-merge monitoring requirements

## Usage Example

```
/create-pre-merge-summary user-authentication
```

This will generate a summary at:
`.cursor/execution-reports/user-authentication-pre-merge-summary.md`

## Best Practices

- **Run this LAST** after all other validation steps are complete
- **Be honest** about validation status—don't mark items complete if they're not
- **Highlight blockers** prominently if merge is not recommended
- **Include context** for divergences so reviewers understand changes
- **Make it actionable** for the person making the merge decision
