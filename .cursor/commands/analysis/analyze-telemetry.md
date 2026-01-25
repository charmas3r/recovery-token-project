---
description: Analyze telemetry data from Amplitude dashboards and generate a comprehensive summary
argument-hint: [feature-name]
---

# Analyze Telemetry: Amplitude Dashboard Analysis

## Overview

Analyze telemetry data from Amplitude dashboards using the Amplitude MCP server to generate a comprehensive feature telemetry summary. This command extracts user behavior patterns, conversion funnels, retention metrics, and event data to inform product decisions.

## Prerequisites: Amplitude MCP Server

**IMPORTANT:** This command requires the Amplitude MCP server to be enabled.

### Check MCP Server Availability

Before proceeding, verify the Amplitude MCP server is available by checking the MCP folder structure:

1. **If Amplitude MCP server is NOT present (no `amplitude` folder in mcps):**
   - Prompt the user:
   ```
   The Amplitude MCP server is required for this command but is not installed.
   
   To set up the Amplitude MCP server:
   1. Install the Amplitude MCP server package (check npm or the official Amplitude MCP repository)
   2. Configure it with your Amplitude API credentials:
      - API Key
      - Secret Key (for server-side access)
      - Project ID
   3. Add the server configuration to your Cursor MCP settings
   4. Restart Cursor to load the new MCP server
   
   Once set up, run this command again.
   ```
   - STOP execution until the server is installed and configured

2. **If Amplitude MCP server IS present but DISABLED:**
   - Prompt the user:
   ```
   The Amplitude MCP server is installed but currently disabled.
   
   Please enable it:
   1. Open Cursor Settings (Cmd/Ctrl + ,)
   2. Navigate to: Features > MCP Servers
   3. Find 'Amplitude' in the server list
   4. Toggle it ON to enable
   5. Wait for the server to connect (green status indicator)
   
   Once enabled, run this command again.
   ```
   - STOP execution until the server is enabled

3. **If Amplitude MCP server IS available and enabled:**
   - Confirm: "Amplitude MCP server detected and connected. Ready to analyze your telemetry data."
   - Proceed with the analysis

## Input Requirements

### Step 1: Gather Amplitude Information

Prompt the user for the following information:

```
To analyze your telemetry data, I need the following:

1. **Amplitude Dashboard Link(s):** Please provide the Amplitude URL(s) for the dashboards, charts, or funnels you want to analyze.
   - Dashboard: https://analytics.amplitude.com/[org]/dashboard/[dashboard-id]
   - Chart: https://analytics.amplitude.com/[org]/chart/[chart-id]
   - Funnel: https://analytics.amplitude.com/[org]/funnel/[funnel-id]
   - Cohort: https://analytics.amplitude.com/[org]/cohort/[cohort-id]

2. **Feature Name:** What is the name of the feature being analyzed? (e.g., "User Onboarding", "Checkout Flow", "Search Experience")

3. **Analysis Context:** What questions are you trying to answer with this telemetry data? (1-3 key questions)
   - Example: "What percentage of users complete onboarding?" 
   - Example: "Where do users drop off in the checkout flow?"

4. **Date Range:** What time period should the analysis cover?
   - Example: "Last 30 days", "Q4 2025", "Since feature launch (Dec 1, 2025)"

5. **User Segments (optional):** Any specific user segments to focus on?
   - Example: "New users only", "Premium subscribers", "Mobile users"
```

### Step 2: Parse Amplitude URLs

Extract relevant IDs from provided URLs:
- Dashboard URL format: `https://analytics.amplitude.com/[org]/dashboard/[dashboard-id]`
- Chart URL format: `https://analytics.amplitude.com/[org]/chart/[chart-id]`
- Extract: organization slug, resource type, resource ID

## Analysis Process

### Phase 1: Dashboard/Chart Discovery

Use the Amplitude MCP tools to understand the data structure:

```
Tool: get_dashboard (or equivalent)
Arguments:
  - dashboardId: [extracted from URL]
  - dateRange: [user specified range]
```

This provides:
- Charts and visualizations in the dashboard
- Metrics being tracked
- Segments and filters applied
- Date range configurations

### Phase 2: Event Analysis

For each relevant event or metric, retrieve detailed data:

```
Tool: get_event_data (or equivalent)
Arguments:
  - eventName: [event to analyze]
  - dateRange: [specified range]
  - groupBy: [relevant dimensions]
  - filters: [user segments if specified]
```

Extract:
- Event volumes over time
- Unique users vs. total events
- Event properties breakdown
- Trends and anomalies

### Phase 3: Funnel Analysis

For conversion funnels:

```
Tool: get_funnel_data (or equivalent)
Arguments:
  - funnelId: [funnel ID or event sequence]
  - dateRange: [specified range]
  - conversionWindow: [time window for conversion]
```

Extract:
- Step-by-step conversion rates
- Drop-off points
- Time to convert
- Segment comparisons

### Phase 4: Retention Analysis

For retention metrics:

```
Tool: get_retention_data (or equivalent)
Arguments:
  - startEvent: [initial action]
  - returnEvent: [return action]
  - dateRange: [specified range]
  - retentionType: [day/week/month]
```

Extract:
- Retention curves
- Cohort comparisons
- Retention by segment
- Churn indicators

### Phase 5: User Journey Analysis

For path analysis:

```
Tool: get_user_paths (or equivalent)
Arguments:
  - startingEvent: [entry point]
  - endingEvent: [target action or any]
  - pathLength: [number of steps to analyze]
```

Extract:
- Common user paths
- Unexpected journeys
- Path to conversion vs. drop-off
- Feature discovery patterns

## Analysis Framework

### Identify Key Metrics

For each dashboard/chart analyzed, document:

1. **Primary Metrics**
   - What is being measured?
   - What is the current value/rate?
   - What is the trend (improving/declining/stable)?
   - How does it compare to benchmarks or goals?

2. **Conversion Metrics**
   - Funnel completion rates
   - Step-by-step drop-off rates
   - Conversion time distribution
   - Segment performance differences

3. **Engagement Metrics**
   - DAU/WAU/MAU
   - Session frequency
   - Feature adoption rates
   - Power user identification

4. **Retention Metrics**
   - D1, D7, D30 retention
   - Cohort retention curves
   - Churn indicators
   - Reactivation patterns

### Identify Insights

Look for and document:

- **Drop-off Points:** Where are users abandoning flows?
- **Conversion Blockers:** What prevents users from completing goals?
- **Success Patterns:** What do successful users do differently?
- **Segment Differences:** How do different user groups behave?
- **Trend Changes:** Any significant changes in metrics over time?
- **Anomalies:** Unexpected spikes or drops in data

### Identify Opportunities

Document actionable opportunities:

- **Quick Wins:** Low-effort improvements with potential high impact
- **Major Improvements:** Larger changes that could significantly improve metrics
- **Experiments to Run:** A/B tests to validate hypotheses
- **Monitoring Needs:** Additional events or metrics to track

## Output Document

Write the analysis to: `.cursor/docs/references/telemetry-feature-summarization.md`

### Document Structure

```markdown
# Telemetry Analysis: [Feature Name]

## Overview
- **Feature:** [Name]
- **Analyzed:** [Date]
- **Date Range:** [Time period analyzed]
- **Amplitude Source(s):** [Dashboard/Chart link(s)]

## Executive Summary
[2-3 paragraph summary of key findings, including the most important metrics, notable trends, and primary recommendations]

## Key Questions Addressed
1. **[Question 1]**
   - Finding: [Answer based on data]
   - Supporting Data: [Key metrics]

2. **[Question 2]**
   - Finding: [Answer based on data]
   - Supporting Data: [Key metrics]

## Metrics Overview

### Primary Metrics
| Metric | Current Value | Trend | Target | Status |
|--------|---------------|-------|--------|--------|
| [Metric 1] | [Value] | [↑/↓/→] | [Goal] | [🟢/🟡/🔴] |
| [Metric 2] | [Value] | [↑/↓/→] | [Goal] | [🟢/🟡/🔴] |

### Conversion Funnel
| Step | Users | Conversion Rate | Drop-off |
|------|-------|-----------------|----------|
| [Step 1] | [Count] | 100% | - |
| [Step 2] | [Count] | [%] | [%] |
| [Step 3] | [Count] | [%] | [%] |

### Retention Metrics
| Cohort | D1 | D7 | D30 | Notes |
|--------|-----|-----|------|-------|
| [Cohort] | [%] | [%] | [%] | [Observation] |

## Detailed Findings

### Finding 1: [Title]
**Observation:** [What the data shows]

**Data Points:**
- [Specific metric or data point]
- [Supporting evidence]

**Implications:**
- [What this means for the product]
- [Potential impact]

**Recommendation:**
- [Suggested action]

### Finding 2: [Title]
[Repeat structure...]

## User Segments Analysis

### Segment Comparison
| Segment | [Key Metric 1] | [Key Metric 2] | [Key Metric 3] |
|---------|----------------|----------------|----------------|
| [Segment A] | [Value] | [Value] | [Value] |
| [Segment B] | [Value] | [Value] | [Value] |

### Segment Insights
- **[Segment A]:** [Key observations and behaviors]
- **[Segment B]:** [Key observations and behaviors]

## Drop-off Analysis

### Critical Drop-off Points
| Location | Drop-off Rate | Potential Causes | Priority |
|----------|---------------|------------------|----------|
| [Point 1] | [%] | [Hypotheses] | High |
| [Point 2] | [%] | [Hypotheses] | Medium |

### User Journey Insights
- Most common successful path: [Path description]
- Most common drop-off path: [Path description]
- Unexpected behaviors: [Observations]

## Trends and Anomalies

### Trend Analysis
| Period | Metric | Change | Possible Cause |
|--------|--------|--------|----------------|
| [Date range] | [Metric] | [+/-X%] | [Hypothesis] |

### Notable Anomalies
- **[Date/Period]:** [Description of anomaly and potential explanation]

## Recommendations

### Immediate Actions (Quick Wins)
1. **[Action 1]**
   - Expected Impact: [Metric improvement estimate]
   - Effort: Low
   - Data Supporting: [Reference to finding]

2. **[Action 2]**
   - Expected Impact: [Metric improvement estimate]
   - Effort: Low
   - Data Supporting: [Reference to finding]

### Strategic Improvements
1. **[Improvement 1]**
   - Expected Impact: [Metric improvement estimate]
   - Effort: Medium/High
   - Data Supporting: [Reference to finding]

### Experiments to Consider
| Hypothesis | Test Design | Success Metric | Priority |
|------------|-------------|----------------|----------|
| [Hypothesis] | [A/B test description] | [Metric to measure] | [Priority] |

## Monitoring Recommendations

### New Events to Track
| Event Name | Purpose | Properties to Capture |
|------------|---------|----------------------|
| [Event] | [Why track it] | [Key properties] |

### Alerts to Set Up
| Alert | Condition | Threshold |
|-------|-----------|-----------|
| [Alert name] | [Trigger condition] | [Value] |

## Data Quality Notes
- **Coverage:** [% of users/events captured]
- **Known Gaps:** [Any missing data or tracking issues]
- **Confidence Level:** [High/Medium/Low] - [Explanation]

## Appendix

### Amplitude Resource References
| Resource | Type | ID | Direct Link |
|----------|------|-----|-------------|
| [Name] | Dashboard/Chart/Funnel | [ID] | [URL] |

### Event Definitions
| Event Name | Description | Key Properties |
|------------|-------------|----------------|
| [Event] | [What it tracks] | [Properties] |

### Analysis Methodology
- [Description of how analysis was conducted]
- [Any assumptions made]
- [Limitations of the analysis]
```

## Execution Steps

### Step-by-Step Process

1. **Verify MCP Server**
   - Check if Amplitude MCP server folder exists in mcps directory
   - If not present, prompt user with setup instructions and STOP
   - If present but disabled, prompt user to enable it and STOP
   - If available and connected, proceed

2. **Collect Input**
   - Ask for Amplitude dashboard/chart URL(s)
   - Ask for feature name
   - Ask for analysis questions/context
   - Ask for date range
   - Ask for user segments (optional)

3. **Retrieve Dashboard Data**
   - Use Amplitude MCP tools to fetch dashboard configuration
   - Identify charts, metrics, and segments
   - Note any filters or date ranges applied

4. **Analyze Events and Funnels**
   - Pull event data for relevant metrics
   - Analyze funnel conversion rates
   - Calculate drop-off points
   - Compare segments

5. **Analyze Retention and Engagement**
   - Pull retention data
   - Identify cohort patterns
   - Analyze engagement metrics
   - Look for power user behaviors

6. **Synthesize Insights**
   - Identify key findings
   - Document trends and anomalies
   - Formulate recommendations
   - Prioritize opportunities

7. **Generate Output**
   - Write comprehensive analysis to `.cursor/docs/references/telemetry-feature-summarization.md`
   - Follow the document structure above
   - Include all resource references for future updates

8. **Confirm Completion**
   - Report summary of key findings
   - Highlight critical insights
   - List recommended actions
   - Note any data quality concerns or open questions

## Error Handling

- **MCP Server Not Installed:** Stop and provide setup instructions
- **MCP Server Disabled:** Stop and guide user to enable it
- **Invalid Amplitude URL:** Request corrected URL with format examples
- **Access Denied:** Prompt user to check Amplitude permissions and API credentials
- **Dashboard Not Found:** Verify dashboard ID and organization access
- **Rate Limiting:** Implement pagination and retry logic for large data requests
- **Incomplete Data:** Note data gaps in the analysis and adjust confidence levels

## Notes

- Always verify MCP server availability before starting
- For complex analyses spanning multiple dashboards, break into logical sections
- Cross-reference with existing PRD, UX flow analyses, or requirements documents
- Note any discrepancies between expected and actual user behavior
- Flag metrics that appear anomalous or need further investigation
- Consider seasonality and external factors when analyzing trends
- Document any assumptions made during the analysis
