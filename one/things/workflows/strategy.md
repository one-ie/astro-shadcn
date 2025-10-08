# Strategic Planning Workflow

**Version:** 1.0.0
**Purpose:** Define how the director agent plans, executes, and tracks strategic initiatives using OKRs

---

## Overview

The strategic planning workflow enables the director agent to:
1. Set organizational vision and goals
2. Create OKRs (Objectives & Key Results)
3. Break down OKRs into actionable tasks
4. Allocate resources across initiatives
5. Track progress and adjust strategy
6. Optimize based on intelligence insights

**Key Principle:** Strategy flows from vision → OKRs → tasks → execution, with continuous feedback loops for optimization.

---

## Strategic Hierarchy

```
┌─────────────────────────────────────────┐
│           VISION & MISSION               │
│  Long-term direction (3-5 years)         │
└────────────────┬─────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│        STRATEGIC OBJECTIVES              │
│  Quarterly goals (OKRs)                  │
└────────────────┬─────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│           KEY RESULTS                    │
│  Measurable outcomes                     │
└────────────────┬─────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│           INITIATIVES                    │
│  Projects and campaigns                  │
└────────────────┬─────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│             TASKS                        │
│  Individual agent work items             │
└──────────────────────────────────────────┘
```

---

## OKR Thing Structure

### Thing Type: `okr` (Objective & Key Results)

```typescript
{
  _id: Id<"things">,
  type: "okr",
  name: string,                    // Objective title
  properties: {
    objective: string,             // What we want to achieve
    description: string,           // Why this matters
    period: {
      quarter: "Q1" | "Q2" | "Q3" | "Q4",
      year: number,
      startDate: number,
      endDate: number,
    },
    keyResults: [
      {
        id: string,
        description: string,       // What we'll measure
        metric: string,            // Metric name
        target: number,            // Target value
        current: number,           // Current value
        unit: string,              // Unit (%, $, users, etc.)
        progress: number,          // 0-100
        status: "on_track" | "at_risk" | "off_track" | "completed",
        owner: Id<"things">,      // Which agent owns this KR
      }
    ],
    priority: "low" | "medium" | "high" | "critical",
    status: "draft" | "active" | "completed" | "abandoned",
    confidence: number,            // 0.0-1.0 confidence in achieving
    riskLevel: "low" | "medium" | "high",
    dependencies: Id<"things">[],  // Other OKRs this depends on
    blockers: {
      blocked: boolean,
      reason?: string,
      blockedBy?: Id<"things">,
    },
    organizationId: Id<"things">,
    createdBy: Id<"things">,       // Director agent or user
  },
  status: "active" | "archived",
  createdAt: number,
  updatedAt: number,
}
```

---

## Director Agent Strategy Process

### Phase 1: Vision Definition

**Input:** Organization goals, market context, available resources
**Output:** Strategic vision and quarterly objectives

```typescript
// convex/services/agents/director.ts
export class DirectorService extends Effect.Service<DirectorService>()(
  "DirectorService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const strategyAgent = yield* StrategyAgentService;

      return {
        createVision: (args: CreateVisionArgs) =>
          Effect.gen(function* () {
            // 1. Analyze organization context
            const context = yield* analyzeOrganizationContext(args.organizationId);

            // 2. Delegate vision creation to strategy agent
            const visionTask = yield* delegateTask({
              taskType: "strategy",
              description: "Define organizational vision and mission",
              parameters: {
                organizationId: args.organizationId,
                context,
                timeframe: "3-5 years",
              },
            });

            // 3. Wait for strategy agent to complete
            const vision = yield* waitForTaskResult(visionTask.taskId);

            // 4. Store vision as organization property
            yield* Effect.tryPromise(() =>
              db.patch(args.organizationId, {
                properties: {
                  ...org.properties,
                  vision: vision.data.vision,
                  mission: vision.data.mission,
                  values: vision.data.values,
                },
                updatedAt: Date.now(),
              })
            );

            return { success: true, vision };
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default, StrategyAgentService.Default],
  }
) {}
```

### Phase 2: OKR Creation

**Input:** Vision, quarterly goals, available resources
**Output:** Structured OKRs with key results

```typescript
createOKR: (args: CreateOKRArgs) =>
  Effect.gen(function* () {
    // 1. Delegate OKR creation to strategy agent
    const okrTask = yield* delegateTask({
      taskType: "strategy",
      description: `Create ${args.period.quarter} ${args.period.year} OKRs`,
      parameters: {
        organizationId: args.organizationId,
        vision: args.vision,
        constraints: {
          budget: args.budget,
          team: args.teamSize,
          timeframe: "90 days",
        },
        focus: args.focus,  // e.g., ["growth", "revenue", "community"]
      },
    });

    // 2. Wait for OKR design
    const okrDesign = yield* waitForTaskResult(okrTask.taskId);

    // 3. Create OKR entity
    const okrId = yield* Effect.tryPromise(() =>
      db.insert("things", {
        type: "okr",
        name: okrDesign.data.objective,
        properties: {
          objective: okrDesign.data.objective,
          description: okrDesign.data.description,
          period: args.period,
          keyResults: okrDesign.data.keyResults.map((kr, i) => ({
            id: `kr_${i}`,
            description: kr.description,
            metric: kr.metric,
            target: kr.target,
            current: 0,
            unit: kr.unit,
            progress: 0,
            status: "on_track",
            owner: selectOwnerAgent(kr.metric),  // Assign to appropriate agent
          })),
          priority: args.priority || "high",
          status: "active",
          confidence: okrDesign.data.confidence,
          riskLevel: okrDesign.data.riskLevel,
          dependencies: [],
          blockers: { blocked: false },
          organizationId: args.organizationId,
          createdBy: args.directorId,
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );

    // 4. Log creation event
    yield* Effect.tryPromise(() =>
      db.insert("events", {
        type: "entity_created",
        actorId: args.directorId,
        targetId: okrId,
        timestamp: Date.now(),
        metadata: {
          entityType: "okr",
          period: `${args.period.quarter} ${args.period.year}`,
          objective: okrDesign.data.objective,
        },
      })
    );

    return { success: true, okrId };
  }),
```

### Phase 3: Initiative Planning

**Input:** OKRs
**Output:** Initiatives (projects/campaigns) to achieve key results

```typescript
planInitiatives: (args: PlanInitiativesArgs) =>
  Effect.gen(function* () {
    // 1. Get OKR
    const okr = yield* Effect.tryPromise(() => db.get(args.okrId));

    // 2. For each key result, delegate initiative planning
    const initiatives = yield* Effect.all(
      okr.properties.keyResults.map((kr) =>
        Effect.gen(function* () {
          // Delegate to owner agent
          const initiativeTask = yield* delegateTask({
            taskType: getAgentType(kr.owner),
            description: `Plan initiative for: ${kr.description}`,
            parameters: {
              keyResult: kr,
              budget: args.budget / okr.properties.keyResults.length,
              duration: 90,  // days
            },
          });

          const initiative = yield* waitForTaskResult(initiativeTask.taskId);

          // Create initiative entity
          const initiativeId = yield* Effect.tryPromise(() =>
            db.insert("things", {
              type: "initiative",
              name: initiative.data.name,
              properties: {
                description: initiative.data.description,
                keyResultId: kr.id,
                okrId: args.okrId,
                owner: kr.owner,
                tactics: initiative.data.tactics,
                milestones: initiative.data.milestones,
                budget: initiative.data.budget,
                status: "planned",
                organizationId: okr.properties.organizationId,
              },
              status: "active",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          );

          // Link initiative to OKR
          yield* Effect.tryPromise(() =>
            db.insert("connections", {
              fromThingId: initiativeId,
              toThingId: args.okrId,
              relationshipType: "part_of",
              metadata: { keyResultId: kr.id },
              createdAt: Date.now(),
            })
          );

          return { initiativeId, keyResultId: kr.id };
        })
      )
    );

    return { success: true, initiatives };
  }),
```

### Phase 4: Task Breakdown

**Input:** Initiatives
**Output:** Actionable tasks assigned to agents

```typescript
breakdownInitiative: (args: BreakdownInitiativeArgs) =>
  Effect.gen(function* () {
    // 1. Get initiative
    const initiative = yield* Effect.tryPromise(() => db.get(args.initiativeId));

    // 2. Delegate task breakdown to owner agent
    const breakdownTask = yield* delegateTask({
      taskType: getAgentType(initiative.properties.owner),
      description: `Break down initiative: ${initiative.name}`,
      parameters: {
        initiative: initiative.properties,
        maxTasks: 20,
        timeframe: 90,
      },
    });

    const breakdown = yield* waitForTaskResult(breakdownTask.taskId);

    // 3. Create task entities
    const tasks = yield* Effect.all(
      breakdown.data.tasks.map((taskSpec) =>
        Effect.gen(function* () {
          const taskId = yield* Effect.tryPromise(() =>
            db.insert("things", {
              type: "task",
              name: taskSpec.title,
              properties: {
                taskType: taskSpec.taskType,
                description: taskSpec.description,
                priority: taskSpec.priority,
                status: "pending",
                deadline: taskSpec.deadline,
                estimatedDuration: taskSpec.estimatedDuration,
                parameters: taskSpec.parameters,
                organizationId: initiative.properties.organizationId,
                creatorId: args.directorId,
              },
              status: "active",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          );

          // Link task to initiative
          yield* Effect.tryPromise(() =>
            db.insert("connections", {
              fromThingId: taskId,
              toThingId: args.initiativeId,
              relationshipType: "part_of",
              createdAt: Date.now(),
            })
          );

          // Delegate task to agent
          yield* delegateTask({
            taskType: taskSpec.taskType,
            taskId,
            assignee: selectAgentForTask(taskSpec.taskType),
          });

          return taskId;
        })
      )
    );

    return { success: true, taskIds: tasks };
  }),
```

---

## Progress Tracking

### Track Key Result Progress

```typescript
updateKeyResultProgress: (args: UpdateKeyResultArgs) =>
  Effect.gen(function* () {
    // 1. Get OKR
    const okr = yield* Effect.tryPromise(() => db.get(args.okrId));

    // 2. Find key result
    const kr = okr.properties.keyResults.find((k) => k.id === args.keyResultId);
    if (!kr) return yield* Effect.fail(new KeyResultNotFoundError());

    // 3. Update progress
    const newProgress = (args.current / kr.target) * 100;
    const updatedKR = {
      ...kr,
      current: args.current,
      progress: Math.min(newProgress, 100),
      status: calculateStatus(newProgress, args.daysRemaining),
    };

    // 4. Update OKR
    const updatedKeyResults = okr.properties.keyResults.map((k) =>
      k.id === args.keyResultId ? updatedKR : k
    );

    yield* Effect.tryPromise(() =>
      db.patch(args.okrId, {
        properties: {
          ...okr.properties,
          keyResults: updatedKeyResults,
        },
        updatedAt: Date.now(),
      })
    );

    // 5. Log progress event
    yield* Effect.tryPromise(() =>
      db.insert("events", {
        type: "entity_updated",
        actorId: args.actorId,
        targetId: args.okrId,
        timestamp: Date.now(),
        metadata: {
          entityType: "okr",
          keyResultId: args.keyResultId,
          oldValue: kr.current,
          newValue: args.current,
          progress: newProgress,
          status: updatedKR.status,
        },
      })
    );

    // 6. If status changed to "at_risk" or "off_track", alert director
    if (
      updatedKR.status !== kr.status &&
      (updatedKR.status === "at_risk" || updatedKR.status === "off_track")
    ) {
      yield* alertDirector({
        okrId: args.okrId,
        keyResultId: args.keyResultId,
        status: updatedKR.status,
        message: `Key result "${kr.description}" is now ${updatedKR.status}`,
      });
    }

    return { success: true, updatedKR };
  }),

// Helper: Calculate KR status based on progress and time
function calculateStatus(progress: number, daysRemaining: number): string {
  const expectedProgress = ((90 - daysRemaining) / 90) * 100;

  if (progress >= 100) return "completed";
  if (progress >= expectedProgress - 10) return "on_track";
  if (progress >= expectedProgress - 25) return "at_risk";
  return "off_track";
}
```

### Weekly OKR Review

```typescript
weeklyOKRReview: (args: WeeklyReviewArgs) =>
  Effect.gen(function* () {
    // 1. Get all active OKRs for organization
    const okrs = yield* Effect.tryPromise(() =>
      db
        .query("things")
        .withIndex("by_type", (q) => q.eq("type", "okr"))
        .filter((q) =>
          q
            .eq(q.field("properties.organizationId"), args.organizationId)
            .eq(q.field("properties.status"), "active")
        )
        .collect()
    );

    // 2. Delegate analysis to intelligence agent
    const analysisTask = yield* delegateTask({
      taskType: "intelligence",
      description: "Analyze weekly OKR progress",
      parameters: {
        okrs: okrs.map((okr) => ({
          id: okr._id,
          objective: okr.properties.objective,
          keyResults: okr.properties.keyResults,
        })),
        period: "7 days",
      },
    });

    const analysis = yield* waitForTaskResult(analysisTask.taskId);

    // 3. Generate insights
    const insights = analysis.data.insights;  // Array of insights

    // 4. If critical issues, delegate strategy adjustment
    const criticalIssues = insights.filter((i) => i.severity === "critical");

    if (criticalIssues.length > 0) {
      yield* delegateTask({
        taskType: "strategy",
        description: "Adjust strategy based on OKR review",
        parameters: {
          issues: criticalIssues,
          okrs,
          recommendations: analysis.data.recommendations,
        },
      });
    }

    // 5. Create report entity
    const reportId = yield* Effect.tryPromise(() =>
      db.insert("things", {
        type: "report",
        name: `Weekly OKR Review - Week ${args.weekNumber}`,
        properties: {
          reportType: "okr_review",
          period: "weekly",
          weekNumber: args.weekNumber,
          organizationId: args.organizationId,
          insights,
          recommendations: analysis.data.recommendations,
          generatedAt: Date.now(),
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );

    return { success: true, reportId, insights };
  }),
```

---

## Resource Allocation

### Allocate Budget Across Initiatives

```typescript
allocateResources: (args: AllocateResourcesArgs) =>
  Effect.gen(function* () {
    // 1. Get all initiatives for OKR
    const initiatives = yield* Effect.tryPromise(() =>
      db
        .query("connections")
        .withIndex("to_type", (q) =>
          q.eq("toThingId", args.okrId).eq("relationshipType", "part_of")
        )
        .collect()
    );

    const initiativeEntities = yield* Effect.all(
      initiatives.map((conn) =>
        Effect.tryPromise(() => db.get(conn.fromThingId))
      )
    );

    // 2. Delegate resource allocation to finance agent
    const allocationTask = yield* delegateTask({
      taskType: "finance",
      description: "Allocate budget across initiatives",
      parameters: {
        totalBudget: args.totalBudget,
        initiatives: initiativeEntities.map((i) => ({
          id: i._id,
          name: i.name,
          estimatedBudget: i.properties.budget,
          priority: i.properties.priority,
          expectedImpact: i.properties.expectedImpact,
        })),
      },
    });

    const allocation = yield* waitForTaskResult(allocationTask.taskId);

    // 3. Update initiative budgets
    yield* Effect.all(
      allocation.data.allocations.map((a) =>
        Effect.tryPromise(() =>
          db.patch(a.initiativeId, {
            properties: {
              ...initiative.properties,
              allocatedBudget: a.amount,
            },
            updatedAt: Date.now(),
          })
        )
      )
    );

    // 4. Log allocation event
    yield* Effect.tryPromise(() =>
      db.insert("events", {
        type: "entity_updated",
        actorId: args.directorId,
        targetId: args.okrId,
        timestamp: Date.now(),
        metadata: {
          action: "budget_allocated",
          totalBudget: args.totalBudget,
          allocations: allocation.data.allocations,
        },
      })
    );

    return { success: true, allocations: allocation.data.allocations };
  }),
```

---

## Strategy Adjustment

### Adjust Strategy Based on Results

```typescript
adjustStrategy: (args: AdjustStrategyArgs) =>
  Effect.gen(function* () {
    // 1. Get intelligence analysis
    const intelligenceTask = yield* delegateTask({
      taskType: "intelligence",
      description: "Analyze OKR performance and identify issues",
      parameters: {
        okrId: args.okrId,
        period: "30 days",
      },
    });

    const analysis = yield* waitForTaskResult(intelligenceTask.taskId);

    // 2. Delegate strategy adjustment to strategy agent
    const adjustmentTask = yield* delegateTask({
      taskType: "strategy",
      description: "Adjust strategy based on performance analysis",
      parameters: {
        okrId: args.okrId,
        analysis: analysis.data,
        constraints: args.constraints,
      },
    });

    const adjustments = yield* waitForTaskResult(adjustmentTask.taskId);

    // 3. Apply adjustments
    if (adjustments.data.keyResultUpdates) {
      yield* updateKeyResults(args.okrId, adjustments.data.keyResultUpdates);
    }

    if (adjustments.data.initiativeChanges) {
      yield* applyInitiativeChanges(adjustments.data.initiativeChanges);
    }

    if (adjustments.data.resourceReallocation) {
      yield* reallocateResources(args.okrId, adjustments.data.resourceReallocation);
    }

    // 4. Log adjustment event
    yield* Effect.tryPromise(() =>
      db.insert("events", {
        type: "entity_updated",
        actorId: args.directorId,
        targetId: args.okrId,
        timestamp: Date.now(),
        metadata: {
          action: "strategy_adjusted",
          reason: analysis.data.issues,
          adjustments: adjustments.data,
        },
      })
    );

    return { success: true, adjustments };
  }),
```

---

## Example: Complete Strategic Workflow

### Q1 2025 Creator Growth Strategy

```typescript
// Step 1: Director defines vision (via Strategy Agent)
const vision = await directorService.createVision({
  organizationId: "org_123",
  directorId: "director_789",
});

// Step 2: Create Q1 2025 OKR
const okr = await directorService.createOKR({
  organizationId: "org_123",
  directorId: "director_789",
  period: {
    quarter: "Q1",
    year: 2025,
    startDate: Date.parse("2025-01-01"),
    endDate: Date.parse("2025-03-31"),
  },
  vision: vision.vision,
  focus: ["growth", "revenue", "community"],
  budget: 100000,
  teamSize: 10,
  priority: "critical",
});

// OKR created:
// Objective: "10x creator reach and double revenue"
// Key Results:
// 1. Grow YouTube subscribers from 50K to 150K (+200%)
// 2. Launch token with 5,000+ holders
// 3. Launch AI-powered course with 500+ enrollments
// 4. Increase MRR from $5K to $10K (+100%)

// Step 3: Plan initiatives for each key result
const initiatives = await directorService.planInitiatives({
  okrId: okr.okrId,
  directorId: "director_789",
  budget: 100000,
});

// Initiatives created:
// 1. YouTube Growth Campaign (Marketing Agent)
// 2. Token Launch Project (Engineering + Finance)
// 3. Course Creation & Launch (Marketing + Design + Engineering)
// 4. Revenue Optimization (Sales + Intelligence)

// Step 4: Break down initiatives into tasks
for (const initiative of initiatives.initiatives) {
  await directorService.breakdownInitiative({
    initiativeId: initiative.initiativeId,
    directorId: "director_789",
  });
}

// Tasks delegated to agents:
// - Research agent: Market analysis, competitor research
// - Marketing agent: Content calendar, campaign execution
// - Design agent: Brand assets, course design
// - Engineering agent: Platform build, integrations
// - Finance agent: Revenue tracking, forecasting
// - Intelligence agent: Performance analysis, insights

// Step 5: Weekly reviews
setInterval(async () => {
  await directorService.weeklyOKRReview({
    organizationId: "org_123",
    directorId: "director_789",
    weekNumber: getCurrentWeek(),
  });
}, 7 * 24 * 60 * 60 * 1000);  // Every 7 days

// Step 6: Adjust strategy if needed
// Intelligence agent identifies issue: YouTube growth slow
// Director adjusts strategy
await directorService.adjustStrategy({
  okrId: okr.okrId,
  directorId: "director_789",
  constraints: { budget: 100000 },
});

// Adjustments applied:
// - Reallocate $10K from token marketing to YouTube ads
// - Increase content frequency from 2x/week to 3x/week
// - Launch collaboration campaign with 5 creators
```

---

## Querying Strategic Data

### Get Organization's Current OKRs

```typescript
export const getCurrentOKRs = confect.query({
  args: { organizationId: v.id("things") },
  handler: async (ctx, args) => {
    const okrs = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "okr"))
      .filter((q) =>
        q
          .eq(q.field("properties.organizationId"), args.organizationId)
          .eq(q.field("properties.status"), "active")
      )
      .collect();

    return okrs;
  },
});
```

### Get OKR Progress Dashboard

```typescript
export const getOKRDashboard = confect.query({
  args: { okrId: v.id("things") },
  handler: async (ctx, args) => {
    const okr = await ctx.db.get(args.okrId);

    // Get initiatives
    const initiativeConnections = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.okrId).eq("relationshipType", "part_of")
      )
      .collect();

    const initiatives = await Promise.all(
      initiativeConnections.map((conn) => ctx.db.get(conn.fromThingId))
    );

    // Get tasks for each initiative
    const tasks = await Promise.all(
      initiatives.map(async (initiative) => {
        const taskConnections = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", initiative._id)
              .eq("relationshipType", "part_of")
          )
          .collect();

        return Promise.all(
          taskConnections.map((conn) => ctx.db.get(conn.fromThingId))
        );
      })
    );

    return {
      okr,
      initiatives,
      tasks: tasks.flat(),
      overallProgress:
        okr.properties.keyResults.reduce((sum, kr) => sum + kr.progress, 0) /
        okr.properties.keyResults.length,
    };
  },
});
```

---

## Best Practices

### 1. SMART Key Results
- **S**pecific: Clear, unambiguous targets
- **M**easurable: Quantifiable metrics
- **A**chievable: Realistic with resources
- **R**elevant: Aligned with vision
- **T**ime-bound: Deadline-driven

### 2. Regular Reviews
- Weekly: Progress tracking
- Monthly: Deep analysis
- Quarterly: Strategic adjustments

### 3. Data-Driven Decisions
- Use intelligence agent for insights
- Track all metrics in real-time
- Adjust based on evidence

### 4. Transparent Communication
- All stakeholders see OKR progress
- Blockers surfaced immediately
- Celebrate wins publicly

### 5. Continuous Learning
- Post-mortem on completed OKRs
- Document lessons learned
- Apply insights to next quarter

---

## Summary

The strategic planning workflow provides:

1. **Vision-driven** - Strategy flows from long-term vision
2. **OKR framework** - Structured goal-setting methodology
3. **Multi-agent execution** - Specialized agents own key results
4. **Real-time tracking** - Progress visible at all times
5. **Adaptive strategy** - Adjust based on intelligence insights
6. **Ontology-aligned** - OKRs, initiatives, and tasks are all things

**This creates a self-optimizing system where strategy is continuously refined based on execution results, with the director orchestrating work across specialized agents to achieve organizational goals.**
