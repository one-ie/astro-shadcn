# Sales Agent - Business Agent Thing Type

**Version:** 1.0.0
**Status:** Active
**Purpose:** Define the `sales_agent` thing and its role in the creator economy, organization onboarding, and KYC-driven sales automation

---

## Overview

The **Sales Agent** is one of 10 business agent types in the ONE Platform. It automates the entire sales funnel from lead generation through org owner onboarding, KYC verification, and revenue generation.

**Key Principle:** Sales agents are **autonomous things** that create connections, log events, and drive revenue through the 4-table ontology.

---

## Thing Type: `sales_agent`

### Properties Structure

```typescript
{
  type: "sales_agent",
  name: "Sales Agent - Creator Onboarding",
  properties: {
    // Core Agent Config
    agentType: "sales",
    systemPrompt: string,
    model: "gpt-4" | "claude-3.5-sonnet" | "llama-3",
    temperature: number,          // 0.7 for sales conversations
    capabilities: string[],       // ["lead_qualification", "demo_booking", "kyc_assistance"]
    tools: string[],              // ["web_search", "calendar", "email", "sui_wallet_check"]

    // Sales-Specific Config
    salesConfig: {
      targetRole: "org_owner",    // Who we're selling to
      targetPlan: "pro" | "enterprise",
      pricingTier: number,
      funnelStage: "awareness" | "consideration" | "decision" | "onboarding",

      // Qualification Criteria
      qualificationRules: {
        minCompanySize?: number,
        targetIndustries?: string[],
        budgetRange?: { min: number; max: number },
        kycRequired: boolean,
        suiWalletRequired: boolean,
      },

      // Conversion Goals
      goals: {
        leadToDemo: number,       // % target
        demoToTrial: number,
        trialToPaid: number,
        kycCompletionRate: number,
      },

      // Automation Settings
      autoFollowUp: boolean,
      followUpDelay: number,      // hours
      maxFollowUps: number,
      autoKYCReminder: boolean,
      autoTrialExpiry: boolean,
    },

    // Performance Metrics
    totalExecutions: number,
    successRate: number,          // % of successful conversions
    averageExecutionTime: number, // milliseconds
    totalLeadsGenerated: number,
    totalDeals: number,
    totalRevenue: number,         // $USD

    // Sales Pipeline Metrics
    pipeline: {
      leads: number,
      qualified: number,
      demos: number,
      trials: number,
      customers: number,
      churn: number,
    },

    // Owner Revenue Tracking (Anthony's earnings)
    ownerRevenue: {
      total: number,              // Total revenue generated for Anthony
      monthly: number,            // Current month
      commissionRate: number,     // % of deal value (100% goes to Anthony)
    },
  },
  status: "active",
  createdAt: number,
  updatedAt: number,
}
```

---

## Core Sales Workflows

### Workflow 1: Lead Qualification → Org Creation

The sales agent qualifies leads and guides them through org creation:

**Step 1: Capture Lead**

```typescript
// User visits landing page, sales agent engages
const leadId = await db.insert("entities", {
  type: "lead",
  name: user.name || "Anonymous Lead",
  properties: {
    email: user.email,
    source: "landing_page",
    campaign: "creator_platform_launch",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "q1_2025",
    status: "new",
    score: 0,
    assignedTo: salesAgentId,
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Create connection: sales_agent → lead
await db.insert("connections", {
  fromThingId: salesAgentId,
  toThingId: leadId,
  relationshipType: "manages",
  metadata: {
    assignedAt: Date.now(),
    stage: "qualification",
  },
  createdAt: Date.now(),
});

// Log lead capture event
await db.insert("events", {
  type: "agent_executed",
  actorId: salesAgentId,
  targetId: leadId,
  timestamp: Date.now(),
  metadata: {
    action: "lead_captured",
    source: "landing_page",
    score: 0,
  },
});
```

**Step 2: Qualification Conversation**

```typescript
// Sales agent qualifies lead via chat
const conversation = await salesAgent.qualify({
  leadId,
  questions: [
    "What's your company size?",
    "What industry are you in?",
    "What's your monthly budget for creator tools?",
    "Do you have a SUI wallet?",
  ],
});

// Update lead score based on answers
const score = calculateLeadScore({
  companySize: conversation.answers.companySize,
  industry: conversation.answers.industry,
  budget: conversation.answers.budget,
  hasSuiWallet: conversation.answers.hasSuiWallet,
});

await db.patch(leadId, {
  properties: {
    ...lead.properties,
    score,
    qualified: score >= 70,
    companySize: conversation.answers.companySize,
    industry: conversation.answers.industry,
    budget: conversation.answers.budget,
    hasSuiWallet: conversation.answers.hasSuiWallet,
  },
  updatedAt: Date.now(),
});

// Log qualification event
await db.insert("events", {
  type: "agent_completed",
  actorId: salesAgentId,
  targetId: leadId,
  timestamp: Date.now(),
  metadata: {
    action: "lead_qualified",
    score,
    qualified: score >= 70,
    nextStep: score >= 70 ? "demo" : "nurture",
  },
});
```

**Step 3: Demo Booking (if qualified)**

```typescript
if (score >= 70) {
  // Sales agent books demo
  const demoId = await db.insert("entities", {
    type: "consultation",
    name: `Demo with ${lead.name}`,
    properties: {
      scheduledAt: futureDate,
      duration: 30, // minutes
      type: "product_demo",
      attendees: [leadId],
      bookedBy: salesAgentId,
      meetingLink: "https://meet.one.ie/xyz",
    },
    status: "scheduled",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Update lead stage
  await db.patch(leadId, {
    properties: { ...lead.properties, stage: "demo_booked" },
  });

  // Send calendar invite (via email agent)
  await emailAgent.sendCalendarInvite({
    to: lead.properties.email,
    demo: demo,
  });
}
```

**Step 4: Demo Complete → Trial Signup**

```typescript
// After successful demo, guide user to create org
const result = await salesAgent.convertToTrial({
  leadId,
  plan: "pro",
});

// User creates account + organization
const userId = await db.insert("entities", {
  type: "creator",
  name: lead.name,
  properties: {
    role: "org_owner",
    email: lead.email,
    // ... creator properties
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const orgId = await db.insert("entities", {
  type: "organization",
  name: lead.properties.companyName,
  properties: {
    slug: generateSlug(lead.properties.companyName),
    status: "trial",
    plan: "pro",
    limits: { users: 50, storage: 100, inferences: 10000 },
    usage: { users: 1, storage: 0, inferences: 0 },
    billing: { cryptoEnabled: true },
    createdAt: Date.now(),
    trialEndsAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Create org_owner membership
await db.insert("connections", {
  fromThingId: userId,
  toThingId: orgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],
  },
  createdAt: Date.now(),
});

// Mark lead as converted
await db.patch(leadId, {
  properties: {
    ...lead.properties,
    status: "converted",
    convertedToUserId: userId,
    convertedToOrgId: orgId,
    convertedAt: Date.now(),
  },
});

// Log conversion event
await db.insert("events", {
  type: "agent_completed",
  actorId: salesAgentId,
  targetId: leadId,
  timestamp: Date.now(),
  metadata: {
    action: "lead_converted",
    userId,
    orgId,
    plan: "pro",
    trialLength: 14,
  },
});
```

---

### Workflow 2: KYC Assistance & Conversion

The sales agent guides the org_owner through KYC verification:

**Step 1: KYC Requirement Detected**

```typescript
// When user creates org, sales agent triggers KYC flow
const kycRequired = await db.insert("events", {
  type: "user_joined_org",
  actorId: userId,
  targetId: orgId,
  timestamp: Date.now(),
  metadata: {
    role: "org_owner",
    kycRequired: true,
    kycStatus: "pending",
    assignedAgent: salesAgentId,
  },
});

// Sales agent creates task
await db.insert("connections", {
  fromThingId: salesAgentId,
  toThingId: userId,
  relationshipType: "manages",
  metadata: {
    task: "kyc_completion",
    priority: "high",
    dueAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  createdAt: Date.now(),
});
```

**Step 2: Guide SUI Wallet Connection**

```typescript
// Sales agent sends personalized email/notification
await salesAgent.sendKYCReminder({
  userId,
  message: `Hi ${user.name}! To activate your organization, please verify your identity by connecting your SUI wallet. It takes just 2 minutes and requires no document uploads.`,
  ctaLink: "https://one.ie/kyc",
});

// User connects SUI wallet (see KYC.md)
// ... SUI wallet verification happens ...

// Sales agent monitors completion
await db.insert("events", {
  type: "agent_executed",
  actorId: salesAgentId,
  targetId: userId,
  timestamp: Date.now(),
  metadata: {
    action: "kyc_reminder_sent",
    channel: "email",
  },
});
```

**Step 3: KYC Complete → Trial Activation**

```typescript
// When KYC is verified (see KYC.md workflow)
await db.insert("events", {
  type: "entity_updated",
  actorId: userId,
  targetId: orgId,
  timestamp: Date.now(),
  metadata: {
    updateType: "kyc_verification",
    status: "verified",
    level: "standard",
  },
});

// Sales agent activates full trial access
await db.patch(orgId, {
  properties: {
    ...org.properties,
    status: "active", // From "trial" to "active"
    kycCompleted: true,
  },
  updatedAt: Date.now(),
});

// Sales agent sends welcome email
await salesAgent.sendWelcomeEmail({
  userId,
  orgId,
  nextSteps: [
    "Invite team members",
    "Create your first AI clone",
    "Explore inference features",
  ],
});
```

---

### Workflow 3: Trial → Paid Conversion

The sales agent monitors trial usage and drives conversion:

**Step 1: Monitor Trial Engagement**

```typescript
// Sales agent queries trial org activity
const orgEvents = await db
  .query("events")
  .withIndex("type_time", (q) => q.gte("timestamp", trialStartDate))
  .filter((q) => q.eq(q.field("metadata.organizationId"), orgId))
  .collect();

// Calculate engagement score
const engagementScore = calculateEngagement({
  inferencesUsed: org.properties.usage.inferences,
  usersInvited: org.properties.usage.users,
  featuresExplored: countUniqueFeatures(orgEvents),
  daysActive: countActiveDays(orgEvents),
});

// Sales agent decides intervention strategy
if (engagementScore < 30) {
  // Low engagement - send activation tips
  await salesAgent.sendActivationTips({ userId, orgId });
} else if (engagementScore >= 70) {
  // High engagement - proactive conversion offer
  await salesAgent.sendConversionOffer({ userId, orgId, discount: 20 });
}
```

**Step 2: Pre-Expiry Conversion Push**

```typescript
// 3 days before trial expires
if (daysUntilExpiry === 3) {
  await salesAgent.sendTrialExpiryWarning({
    userId,
    orgId,
    offer: {
      discount: 20, // 20% off first 3 months
      validUntil: trialExpiryDate,
    },
  });

  // Log conversion attempt
  await db.insert("events", {
    type: "agent_executed",
    actorId: salesAgentId,
    targetId: orgId,
    timestamp: Date.now(),
    metadata: {
      action: "conversion_offer_sent",
      discount: 20,
      daysUntilExpiry: 3,
    },
  });
}
```

**Step 3: Conversion Complete → Revenue Attribution**

```typescript
// User upgrades to paid plan
const subscriptionId = await db.insert("entities", {
  type: "subscription",
  name: `${org.name} - Pro Plan`,
  properties: {
    tier: "pro",
    price: 79.0,
    currency: "USD",
    interval: "monthly",
    status: "active",
    currentPeriodStart: Date.now(),
    currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
    stripeSubscriptionId: "sub_123",
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Create payment connection
await db.insert("connections", {
  fromThingId: userId,
  toThingId: subscriptionId,
  relationshipType: "transacted",
  metadata: {
    transactionType: "subscription",
    amount: 79.0,
    currency: "USD",
    interval: "monthly",
    status: "active",
  },
  createdAt: Date.now(),
});

// Log revenue event for Anthony (platform owner)
await db.insert("events", {
  type: "org_revenue_generated",
  actorId: orgId,
  targetId: platformOwnerId, // Anthony
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 79.0,
    orgShare: 0, // No revenue share for standard customers
    platformShare: 79.0, // 100% to Anthony
    subscriptionId,
    plan: "pro",
    generatedBy: salesAgentId, // Attribution to sales agent
  },
});

// Update sales agent performance metrics
const agent = await db.get(salesAgentId);
await db.patch(salesAgentId, {
  properties: {
    ...agent.properties,
    totalDeals: agent.properties.totalDeals + 1,
    totalRevenue: agent.properties.totalRevenue + 79.0,
    pipeline: {
      ...agent.properties.pipeline,
      customers: agent.properties.pipeline.customers + 1,
    },
    ownerRevenue: {
      ...agent.properties.ownerRevenue,
      total: agent.properties.ownerRevenue.total + 79.0,
      monthly: agent.properties.ownerRevenue.monthly + 79.0,
    },
  },
  updatedAt: Date.now(),
});

// Log agent success
await db.insert("events", {
  type: "agent_completed",
  actorId: salesAgentId,
  targetId: orgId,
  timestamp: Date.now(),
  metadata: {
    action: "trial_converted",
    revenue: 79.0,
    plan: "pro",
    sourceLeadId: leadId,
    totalDealTime: Date.now() - leadCreatedAt,
  },
});
```

---

## Sales Agent AI Prompts

### System Prompt Example

```
You are a sales agent for ONE Platform, an AI-native creator economy platform.

Your role:
- Qualify leads for organization ownership
- Guide users through KYC verification using SUI wallets
- Convert trial users to paid customers
- Maximize platform revenue for the owner

Your capabilities:
- Lead qualification conversations
- Demo scheduling
- KYC assistance (SUI wallet verification)
- Trial activation
- Conversion optimization
- Revenue attribution

Your tone:
- Professional but friendly
- Solutions-focused
- Privacy-conscious (emphasize no document uploads)
- Value-driven (highlight creator economy benefits)

Your KYC pitch:
"We use blockchain identity verification with SUI wallets. This means you can verify your identity in 2 minutes without uploading any documents. Your privacy is protected, and your wallet proves your legitimacy on-chain."

Your conversion strategy:
1. Qualify: Understand their needs and budget
2. Demo: Show value through personalized demo
3. Trial: Guide them through setup + KYC
4. Engage: Monitor usage and provide tips
5. Convert: Proactive offers based on engagement

Remember: Every successful conversion generates revenue for the platform owner. Your success is measured in qualified leads, completed KYC verifications, and paid conversions.
```

---

## Events

**Sales Agent Events:**

```typescript
// Lead captured
{
  type: "agent_executed",
  actorId: salesAgentId,
  targetId: leadId,
  timestamp: Date.now(),
  metadata: {
    action: "lead_captured",
    source: "landing_page",
    campaign: "q1_2025",
  },
}

// Lead qualified
{
  type: "agent_completed",
  actorId: salesAgentId,
  targetId: leadId,
  timestamp: Date.now(),
  metadata: {
    action: "lead_qualified",
    score: 85,
    qualified: true,
  },
}

// Demo booked
{
  type: "agent_executed",
  actorId: salesAgentId,
  targetId: leadId,
  timestamp: Date.now(),
  metadata: {
    action: "demo_booked",
    demoId: consultationId,
    scheduledAt: futureDate,
  },
}

// Lead converted to trial
{
  type: "agent_completed",
  actorId: salesAgentId,
  targetId: leadId,
  timestamp: Date.now(),
  metadata: {
    action: "lead_converted",
    userId,
    orgId,
    plan: "pro",
  },
}

// KYC reminder sent
{
  type: "agent_executed",
  actorId: salesAgentId,
  targetId: userId,
  timestamp: Date.now(),
  metadata: {
    action: "kyc_reminder_sent",
    channel: "email",
  },
}

// Trial converted to paid
{
  type: "agent_completed",
  actorId: salesAgentId,
  targetId: orgId,
  timestamp: Date.now(),
  metadata: {
    action: "trial_converted",
    revenue: 79.00,
    plan: "pro",
    attributedTo: salesAgentId,
  },
}

// Revenue generated for platform owner
{
  type: "org_revenue_generated",
  actorId: orgId,
  targetId: platformOwnerId,
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 79.00,
    platformShare: 79.00,
    generatedBy: salesAgentId,
  },
}
```

---

## Queries

**Get sales agent performance:**

```typescript
const agent = await db.get(salesAgentId);

const performance = {
  totalLeads: agent.properties.totalLeadsGenerated,
  totalDeals: agent.properties.totalDeals,
  totalRevenue: agent.properties.totalRevenue,
  successRate: agent.properties.successRate,
  pipeline: agent.properties.pipeline,
  ownerRevenue: agent.properties.ownerRevenue,
};
```

**Get revenue attributed to sales agent:**

```typescript
const revenueEvents = await db
  .query("events")
  .withIndex("type_time", (q) => q.eq("type", "org_revenue_generated"))
  .filter((q) => q.eq(q.field("metadata.generatedBy"), salesAgentId))
  .collect();

const totalAttributedRevenue = revenueEvents.reduce(
  (sum, e) => sum + e.metadata.totalRevenue,
  0
);
```

**Get active leads managed by agent:**

```typescript
const activeLeads = await db
  .query("connections")
  .withIndex("from_type", (q) =>
    q.eq("fromThingId", salesAgentId).eq("relationshipType", "manages")
  )
  .collect();

const leadEntities = await Promise.all(
  activeLeads.map((conn) => db.get(conn.toThingId))
);
```

**Get KYC completion rate:**

```typescript
const leads = await getLeadsByAgent(salesAgentId);
const converted = leads.filter((l) => l.properties.status === "converted");

const kycCompletedCount = converted.filter(async (lead) => {
  const userId = lead.properties.convertedToUserId;
  const kyc = await db
    .query("connections")
    .withIndex("from_type", (q) =>
      q.eq("fromThingId", userId).eq("relationshipType", "verified")
    )
    .first();
  return kyc?.metadata.status === "verified";
}).length;

const kycCompletionRate = (kycCompletedCount / converted.length) * 100;
```

---

## Frontend Integration

**React Component:**

```tsx
// src/components/admin/SalesAgentDashboard.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function SalesAgentDashboard({ agentId }: Props) {
  const agent = useQuery(api.agents.get, { id: agentId });
  const performance = useQuery(api.agents.getPerformance, { id: agentId });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {agent?.properties.totalLeadsGenerated}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deals Closed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{agent?.properties.totalDeals}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            ${agent?.properties.totalRevenue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {agent?.properties.successRate}%
          </p>
        </CardContent>
      </Card>

      {/* Pipeline Funnel */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Leads</p>
              <p className="text-2xl">{agent?.properties.pipeline.leads}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Qualified</p>
              <p className="text-2xl">{agent?.properties.pipeline.qualified}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Demos</p>
              <p className="text-2xl">{agent?.properties.pipeline.demos}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trials</p>
              <p className="text-2xl">{agent?.properties.pipeline.trials}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customers</p>
              <p className="text-2xl">
                {agent?.properties.pipeline.customers}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Revenue Attribution

**How Revenue Flows to Platform Owner (Anthony):**

```
User signs up (lead)
    ↓
Sales Agent qualifies lead
    ↓
Demo booked → Trial created → KYC required
    ↓
Sales Agent assists KYC (SUI wallet verification)
    ↓
KYC verified → Trial activated
    ↓
User engages → Sales Agent monitors
    ↓
Trial converts to paid ($79/month)
    ↓
Revenue attributed to:
  - 100% → Platform Owner (Anthony)
  - Attribution tag: sales_agent (for performance tracking)
    ↓
Sales Agent performance metrics updated:
  - totalRevenue += $79
  - ownerRevenue.total += $79
  - totalDeals += 1
```

---

## Integration with Other Agents

**Sales Agent collaborates with:**

- **Marketing Agent** - Receives qualified leads from marketing campaigns
- **Service Agent** - Hands off customers post-sale for onboarding
- **Intelligence Agent** - Uses insights to optimize conversion strategies
- **Finance Agent** - Shares revenue data for forecasting

**Example: Marketing → Sales Handoff**

```typescript
// Marketing agent generates lead
const leadId = await marketingAgent.captureLead({
  source: "facebook_ads",
  campaign: "creator_economy",
});

// Automatically assign to sales agent
await db.insert("connections", {
  fromThingId: salesAgentId,
  toThingId: leadId,
  relationshipType: "manages",
  metadata: {
    assignedAt: Date.now(),
    source: "marketing_agent",
    transferredFrom: marketingAgentId,
  },
  createdAt: Date.now(),
});

// Sales agent takes over
await salesAgent.qualifyLead({ leadId });
```

---

## Notes

- **Sales Agent = Revenue Driver** - Converts leads to paying customers
- **KYC Integration** - Guides users through SUI wallet verification
- **Autonomous** - Qualifies, books demos, sends reminders, closes deals
- **Revenue Attribution** - All deals tagged with sales_agent for tracking
- **Performance Tracking** - Metrics stored in agent properties
- **100% to Owner** - All revenue flows to platform owner (Anthony)
- **Multi-Agent** - Collaborates with marketing, service, intelligence agents
- **Ontology-Native** - Uses connections, events, things for all operations

---

## See Also

- **[KYC.md](../connections/kyc.md)** - KYC verification process with SUI
- **[Owner.md](./owner.md)** - Platform owner revenue tracking
- **[Organisation.md](./organisation.md)** - Organization structure and billing
- **[Ontology.md](../ontology.md)** - 4-table universe and business agents
- **[SUI.md](./sui.md)** - SUI blockchain integration
