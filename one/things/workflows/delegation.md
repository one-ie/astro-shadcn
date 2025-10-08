# Agent Delegation Patterns

**Version:** 1.0.0
**Purpose:** Define how tasks flow between agents using the A2A protocol and ontology connections

---

## Overview

Agent delegation enables the director agent to orchestrate work across the 10 business agents. Each agent has specific capabilities and can collaborate via the A2A (Agent-to-Agent) protocol. Tasks flow through `delegated` connections with full A2A metadata tracking.

**Key Principle:** Agents are autonomous entities that communicate via standardized protocols. The ontology tracks relationships (`delegated` connections) and events (`communication_event`, `task_event`) to maintain complete transparency.

---

## The 10 Business Agent Types

### 1. Strategy Agent
**Role:** Vision, planning, OKRs
**Capabilities:**
- Set long-term goals
- Create OKRs (Objectives & Key Results)
- Define strategic initiatives
- Allocate resources
- Prioritize work

**Example Task:**
```typescript
{
  taskType: "strategy",
  description: "Create Q1 2025 OKRs for creator business",
  parameters: {
    period: "Q1 2025",
    focus: ["growth", "revenue", "community"],
    constraints: { budget: 50000, team: 3 }
  }
}
```

### 2. Research Agent
**Role:** Market, trends, competitors
**Capabilities:**
- Market research
- Competitive analysis
- Trend identification
- Data gathering
- Industry insights

**Example Task:**
```typescript
{
  taskType: "research",
  description: "Analyze competitor token strategies",
  parameters: {
    competitors: ["creator-a", "creator-b", "creator-c"],
    focus: ["tokenomics", "utility", "community"],
    depth: "detailed"
  }
}
```

### 3. Marketing Agent
**Role:** Content strategy, SEO, distribution
**Capabilities:**
- Content calendar creation
- SEO optimization
- Campaign planning
- Social media strategy
- Distribution channels

**Example Task:**
```typescript
{
  taskType: "marketing",
  description: "Create 30-day content campaign for course launch",
  parameters: {
    courseId: "course_123",
    channels: ["twitter", "youtube", "email"],
    goal: "500 enrollments",
    budget: 5000
  }
}
```

### 4. Sales Agent
**Role:** Funnels, conversion, follow-up
**Capabilities:**
- Lead generation
- Funnel optimization
- Conversion analysis
- Email sequences
- Follow-up automation

**Example Task:**
```typescript
{
  taskType: "sales",
  description: "Optimize course enrollment funnel",
  parameters: {
    courseId: "course_123",
    currentConversion: 0.02,
    targetConversion: 0.05,
    traffic: 10000
  }
}
```

### 5. Service Agent
**Role:** Support, onboarding, success
**Capabilities:**
- Customer support
- User onboarding
- Success metrics
- Retention strategies
- Feedback analysis

**Example Task:**
```typescript
{
  taskType: "service",
  description: "Create onboarding sequence for new token holders",
  parameters: {
    tokenId: "token_123",
    goals: ["first purchase", "community join", "content share"],
    timeline: "7 days"
  }
}
```

### 6. Design Agent
**Role:** Brand, UI/UX, assets
**Capabilities:**
- Brand identity
- UI/UX design
- Creative assets
- Design systems
- Visual consistency

**Example Task:**
```typescript
{
  taskType: "design",
  description: "Create course landing page design",
  parameters: {
    courseId: "course_123",
    style: "modern-minimal",
    elements: ["hero", "benefits", "testimonials", "cta"],
    brandColors: true
  }
}
```

### 7. Engineering Agent
**Role:** Tech, integration, automation
**Capabilities:**
- Technical implementation
- API integrations
- Automation workflows
- System architecture
- Performance optimization

**Example Task:**
```typescript
{
  taskType: "engineering",
  description: "Build Stripe payment integration for course",
  parameters: {
    courseId: "course_123",
    paymentMethods: ["card", "bank"],
    recurringBilling: false,
    webhooks: ["payment.success", "payment.failed"]
  }
}
```

### 8. Finance Agent
**Role:** Revenue, costs, forecasting
**Capabilities:**
- Revenue tracking
- Cost analysis
- Financial forecasting
- Budget management
- Profitability analysis

**Example Task:**
```typescript
{
  taskType: "finance",
  description: "Forecast Q1 revenue from token sales and courses",
  parameters: {
    tokenId: "token_123",
    courseIds: ["course_123", "course_456"],
    assumptions: { growth: 0.2, conversion: 0.03 }
  }
}
```

### 9. Legal Agent
**Role:** Compliance, contracts, IP
**Capabilities:**
- Legal compliance
- Contract review
- Intellectual property
- Terms of service
- Privacy policies

**Example Task:**
```typescript
{
  taskType: "legal",
  description: "Review token sale terms and conditions",
  parameters: {
    tokenId: "token_123",
    jurisdictions: ["US", "EU"],
    regulations: ["commodity", "consumer protection"],
    riskLevel: "high"
  }
}
```

### 10. Intelligence Agent
**Role:** Analytics, insights, predictions
**Capabilities:**
- Data analysis
- Pattern recognition
- Predictive analytics
- Insight generation
- Optimization recommendations

**Example Task:**
```typescript
{
  taskType: "intelligence",
  description: "Analyze community engagement patterns",
  parameters: {
    organizationId: "org_123",
    metrics: ["daily_active_users", "message_frequency", "token_velocity"],
    period: "30 days",
    predictions: true
  }
}
```

---

## Delegation Flow via A2A Protocol

### Step 1: Director Identifies Need

```typescript
// Director determines which agent should handle task
function selectAgent(taskType: TaskType): Id<"things"> {
  const agentMapping = {
    strategy: "strategy_agent_001",
    research: "research_agent_001",
    marketing: "marketing_agent_001",
    sales: "sales_agent_001",
    service: "service_agent_001",
    design: "design_agent_001",
    engineering: "engineering_agent_001",
    finance: "finance_agent_001",
    legal: "legal_agent_001",
    intelligence: "intelligence_agent_001",
  };

  return agentMapping[taskType];
}
```

### Step 2: Create Task Entity

```typescript
// Task entity created
{
  _id: "task_123",
  type: "task",
  name: "Research quantum computing trends",
  properties: {
    taskType: "research",
    description: "Analyze current trends in quantum computing",
    status: "pending",
    priority: "high",
    parameters: { topics: [...], depth: "detailed" }
  }
}
```

### Step 3: Create Delegated Connection

```typescript
// Connection: Director → Research Agent (delegated)
{
  _id: "conn_456",
  fromThingId: "director_789",
  toThingId: "research_agent_001",
  relationshipType: "delegated",
  metadata: {
    protocol: "a2a",
    taskId: "task_123",
    taskType: "research",
    assignedAt: Date.now(),
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    priority: "high",
    status: "pending"
  }
}
```

### Step 4: Send A2A Message

```typescript
// A2A message sent to research agent
{
  version: "1.0",
  messageId: crypto.randomUUID(),
  correlationId: "research-pipeline-123",
  from: {
    agentId: "director_789",
    endpoint: "https://api.one.ie/agents/director_789",
    capabilities: ["orchestration", "strategy"]
  },
  to: {
    agentId: "research_agent_001",
    endpoint: "https://api.one.ie/agents/research_agent_001"
  },
  message: {
    type: "task_delegation",
    content: {
      taskId: "task_123",
      task: "research",
      parameters: {
        topics: ["quantum algorithms", "error correction"],
        depth: "detailed"
      },
      callback: "https://api.one.ie/callbacks/task_123"
    },
    mimeType: "application/json"
  },
  metadata: {
    priority: "high",
    timeout: 604800000  // 7 days in ms
  }
}
```

### Step 5: Log Communication Event

```typescript
// Event logged
{
  type: "communication_event",
  actorId: "director_789",
  targetId: "research_agent_001",
  timestamp: Date.now(),
  metadata: {
    protocol: "a2a",
    messageType: "task_delegation",
    taskId: "task_123",
    taskType: "research",
    correlationId: "research-pipeline-123"
  }
}
```

---

## Agent Response Patterns

### Acceptance Pattern

```typescript
// Agent accepts task
{
  version: "1.0",
  messageId: crypto.randomUUID(),
  correlationId: "research-pipeline-123",
  from: {
    agentId: "research_agent_001",
    endpoint: "https://api.one.ie/agents/research_agent_001"
  },
  to: {
    agentId: "director_789",
    endpoint: "https://api.one.ie/agents/director_789"
  },
  message: {
    type: "task_acceptance",
    content: {
      taskId: "task_123",
      estimatedCompletion: Date.now() + 3 * 24 * 60 * 60 * 1000,  // 3 days
      capabilities: ["research", "data_analysis", "reporting"]
    },
    mimeType: "application/json"
  }
}

// Update connection
{
  metadata: {
    ...existing,
    status: "accepted",
    acceptedAt: Date.now(),
    estimatedCompletion: Date.now() + 3 * 24 * 60 * 60 * 1000
  }
}

// Log event
{
  type: "task_event",
  actorId: "research_agent_001",
  targetId: "task_123",
  timestamp: Date.now(),
  metadata: {
    action: "accepted",
    protocol: "a2a",
    message: "Research agent accepted task"
  }
}
```

### Rejection Pattern

```typescript
// Agent rejects task
{
  version: "1.0",
  messageId: crypto.randomUUID(),
  correlationId: "research-pipeline-123",
  from: {
    agentId: "research_agent_001",
    endpoint: "https://api.one.ie/agents/research_agent_001"
  },
  to: {
    agentId: "director_789",
    endpoint: "https://api.one.ie/agents/director_789"
  },
  message: {
    type: "task_rejection",
    content: {
      taskId: "task_123",
      reason: "insufficient_data",
      details: "Cannot access required data sources",
      alternative: "Suggest delegating to intelligence agent first"
    },
    mimeType: "application/json"
  }
}

// Update connection
{
  metadata: {
    ...existing,
    status: "rejected",
    rejectedAt: Date.now(),
    rejectedReason: "insufficient_data"
  }
}

// Log event
{
  type: "task_event",
  actorId: "research_agent_001",
  targetId: "task_123",
  timestamp: Date.now(),
  metadata: {
    action: "rejected",
    protocol: "a2a",
    reason: "insufficient_data",
    message: "Research agent rejected task: insufficient data"
  }
}
```

### Progress Update Pattern

```typescript
// Agent sends progress update
{
  version: "1.0",
  messageId: crypto.randomUUID(),
  correlationId: "research-pipeline-123",
  from: {
    agentId: "research_agent_001",
    endpoint: "https://api.one.ie/agents/research_agent_001"
  },
  to: {
    agentId: "director_789",
    endpoint: "https://api.one.ie/agents/director_789"
  },
  message: {
    type: "status_update",
    content: {
      taskId: "task_123",
      progress: 45,  // 45% complete
      message: "Completed analysis of quantum algorithms. Starting error correction research.",
      estimatedCompletion: Date.now() + 2 * 24 * 60 * 60 * 1000  // 2 days
    },
    mimeType: "application/json"
  }
}

// Log event
{
  type: "task_event",
  actorId: "research_agent_001",
  targetId: "task_123",
  timestamp: Date.now(),
  metadata: {
    action: "progressed",
    protocol: "a2a",
    progress: 45,
    message: "Completed analysis of quantum algorithms"
  }
}
```

### Completion Pattern

```typescript
// Agent completes task
{
  version: "1.0",
  messageId: crypto.randomUUID(),
  correlationId: "research-pipeline-123",
  from: {
    agentId: "research_agent_001",
    endpoint: "https://api.one.ie/agents/research_agent_001"
  },
  to: {
    agentId: "director_789",
    endpoint: "https://api.one.ie/agents/director_789"
  },
  message: {
    type: "task_result",
    content: {
      taskId: "task_123",
      status: "completed",
      result: {
        findings: [
          "Quantum error correction advancing rapidly",
          "Hardware scaling remains bottleneck",
          "Commercial applications emerging in 2025"
        ],
        sources: [
          { title: "Nature Paper...", url: "..." },
          { title: "IBM Research...", url: "..." }
        ],
        recommendations: [
          "Focus on error correction algorithms",
          "Partner with hardware providers",
          "Target early adopters in finance sector"
        ]
      }
    },
    mimeType: "application/json"
  }
}

// Update task
{
  properties: {
    ...existing,
    status: "completed",
    result: {
      status: "success",
      data: { findings: [...], sources: [...] },
      summary: "Identified 5 key trends in quantum computing",
      confidence: 0.92
    }
  }
}

// Update connection
{
  metadata: {
    ...existing,
    status: "completed",
    completedAt: Date.now()
  }
}

// Log event
{
  type: "task_event",
  actorId: "research_agent_001",
  targetId: "task_123",
  timestamp: Date.now(),
  metadata: {
    action: "completed",
    protocol: "a2a",
    status: "completed",
    message: "Research completed: 5 key trends identified"
  }
}
```

---

## Multi-Agent Coordination

### Sequential Delegation

Director delegates tasks in sequence (task B depends on task A):

```typescript
// Step 1: Research agent gathers data
const research = await delegateTask({
  taskType: "research",
  description: "Research fitness creator market"
});

// Wait for completion
await waitForTaskCompletion(research.taskId);

// Step 2: Strategy agent creates plan based on research
const strategy = await delegateTask({
  taskType: "strategy",
  description: "Create fitness creator growth strategy",
  parameters: {
    researchTaskId: research.taskId  // Reference prior task
  }
});

// Step 3: Marketing agent executes strategy
const marketing = await delegateTask({
  taskType: "marketing",
  description: "Execute growth strategy",
  parameters: {
    strategyTaskId: strategy.taskId
  }
});
```

### Parallel Delegation

Director delegates independent tasks simultaneously:

```typescript
// Launch multiple agents in parallel
const tasks = await Promise.all([
  // Research agent: Market analysis
  delegateTask({
    taskType: "research",
    description: "Analyze competitor strategies"
  }),

  // Design agent: Brand refresh
  delegateTask({
    taskType: "design",
    description: "Create new brand assets"
  }),

  // Finance agent: Revenue forecast
  delegateTask({
    taskType: "finance",
    description: "Forecast Q1 2025 revenue"
  }),
]);

// Wait for all to complete
await Promise.all(tasks.map(t => waitForTaskCompletion(t.taskId)));
```

### Agent-to-Agent Delegation

Agents can delegate subtasks to other agents:

```typescript
// Marketing agent delegates design work
const designTask = await a2a.delegateTask({
  fromAgentId: "marketing_agent_001",
  toAgentId: "design_agent_001",
  taskId: "task_subtask_123",
  taskType: "design",
  parentTaskId: "marketing_task_123"  // Link to parent
});

// Marketing agent delegates copywriting to research
const copyTask = await a2a.delegateTask({
  fromAgentId: "marketing_agent_001",
  toAgentId: "research_agent_001",
  taskId: "task_subtask_456",
  taskType: "research",
  parentTaskId: "marketing_task_123"
});
```

---

## Agent Collaboration Example: Course Launch

### Scenario: Launch a new course

**Step 1: Director creates OKR (via Strategy Agent)**
```typescript
const okr = await delegateTask({
  taskType: "strategy",
  description: "Create Q1 2025 course launch OKR",
  parameters: {
    courseId: "course_123",
    targets: {
      enrollments: 500,
      revenue: 50000,
      satisfaction: 4.5
    }
  }
});
```

**Step 2: Parallel market analysis and design**
```typescript
const [marketAnalysis, brandDesign] = await Promise.all([
  // Research: Market analysis
  delegateTask({
    taskType: "research",
    description: "Analyze course market and competitors"
  }),

  // Design: Course branding
  delegateTask({
    taskType: "design",
    description: "Create course landing page and assets"
  })
]);
```

**Step 3: Marketing creates campaign**
```typescript
const campaign = await delegateTask({
  taskType: "marketing",
  description: "Create 30-day launch campaign",
  parameters: {
    researchTaskId: marketAnalysis.taskId,
    designTaskId: brandDesign.taskId
  }
});
```

**Step 4: Engineering builds infrastructure**
```typescript
const infrastructure = await delegateTask({
  taskType: "engineering",
  description: "Build course platform and payment integration"
});
```

**Step 5: Sales optimizes funnel**
```typescript
const funnel = await delegateTask({
  taskType: "sales",
  description: "Create and optimize enrollment funnel",
  parameters: {
    targetConversion: 0.05,
    campaignTaskId: campaign.taskId
  }
});
```

**Step 6: Service creates onboarding**
```typescript
const onboarding = await delegateTask({
  taskType: "service",
  description: "Create student onboarding sequence"
});
```

**Step 7: Finance tracks performance**
```typescript
const tracking = await delegateTask({
  taskType: "finance",
  description: "Track launch revenue and forecast",
  parameters: {
    courseId: "course_123",
    period: "30 days"
  }
});
```

**Step 8: Intelligence analyzes results**
```typescript
const analysis = await delegateTask({
  taskType: "intelligence",
  description: "Analyze launch performance and generate insights",
  parameters: {
    courseId: "course_123",
    metrics: ["enrollments", "revenue", "satisfaction", "retention"]
  }
});
```

---

## Querying Delegation Patterns

### Get Agent Workload

```typescript
export const getAgentWorkload = confect.query({
  args: { agentId: v.id("things") },
  handler: async (ctx, args) => {
    const delegations = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.agentId).eq("relationshipType", "delegated")
      )
      .collect();

    const byStatus = delegations.reduce((acc, d) => {
      const status = d.metadata.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: delegations.length,
      byStatus,
      taskIds: delegations.map((d) => d.metadata.taskId),
    };
  },
});
```

### Get Delegation History

```typescript
export const getDelegationHistory = confect.query({
  args: {
    fromAgentId: v.id("things"),
    toAgentId: v.id("things"),
  },
  handler: async (ctx, args) => {
    const delegations = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.fromAgentId).eq("relationshipType", "delegated")
      )
      .filter((q) => q.eq(q.field("toThingId"), args.toAgentId))
      .collect();

    return delegations;
  },
});
```

---

## Best Practices

### 1. Protocol Compliance
- Always use A2A protocol for agent communication
- Include `metadata.protocol: "a2a"` in all connections
- Send proper A2A messages with correlation IDs

### 2. Event Logging
- Log every delegation as `communication_event`
- Log task lifecycle as `task_event`
- Track progress updates

### 3. Error Handling
- Implement task rejection gracefully
- Provide alternative suggestions
- Escalate blocking issues to director

### 4. Autonomy
- Agents can delegate subtasks to other agents
- No manual intervention required
- Director monitors, doesn't micromanage

### 5. Feedback Loops
- Agents report progress regularly
- Director adjusts strategy based on results
- Intelligence agent identifies patterns

---

## Summary

The delegation system enables:

1. **10 specialized agents** - Each with distinct capabilities
2. **A2A protocol** - Standardized agent communication
3. **Ontology integration** - Connections and events track everything
4. **Multi-agent workflows** - Sequential and parallel coordination
5. **Autonomous operation** - Minimal human intervention

**This creates a self-organizing system where agents collaborate to achieve strategic goals set by the director, with complete transparency through the ontology.**
