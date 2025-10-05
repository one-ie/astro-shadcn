# Development Process Tests

**Purpose:** Test if our ontology-driven development process can handle real-world feature requests and identify gaps/improvements.

**Goal:** Ensure the process makes code generation BETTER as the codebase grows.

---

## Test 1: Allow Customers to Mint Their Own Token

### Feature Request

"I want to allow customers to mint their own token"

### Step 1: Map to Ontology

**Entities Involved:**

- `creator` (or `audience_member`) - the customer minting the token
- `token_contract` - the smart contract template
- `token` - the actual token instance created

**Connections Created:**

- customer → token (relationshipType: "owns")
- token → token_contract (relationshipType: "created_from")
- creator → token (relationshipType: "manages") - if they get admin rights

**Events Logged:**

- `token_deployed` (entityId: tokenId, actorId: customerId, metadata: { contractAddress, blockchain, totalSupply })
- `revenue_generated` (entityId: platformId, metadata: { amount: deploymentFee, source: "token_deployment" })

**Tags Added:**

- Tags from customer's niche (e.g., "fitness", "education")
- "status:active"

### Step 2: Service Design

```typescript
// convex/services/tokens/minting.ts
export class TokenMintingService extends Effect.Service<TokenMintingService>()(
  'TokenMintingService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const blockchain = yield* BlockchainProvider;
      const stripe = yield* StripeProvider;

      return {
        mintToken: (args: {
          customerId: Id<'entities'>;
          tokenName: string;
          tokenSymbol: string;
          totalSupply: number;
          utility: string[];
          blockchain: 'base' | 'ethereum' | 'polygon';
        }) =>
          Effect.gen(function* () {
            // 1. Validate customer
            const customer = yield* Effect.tryPromise(() =>
              db.get(args.customerId)
            );
            if (!customer)
              return yield* Effect.fail({ _tag: 'CustomerNotFound' });

            // 2. Charge deployment fee
            const payment = yield* stripe.charge({
              amount: 9900, // $99
              currency: 'usd',
              metadata: {
                customerId: args.customerId,
                service: 'token_deployment',
              },
            });

            // 3. Deploy smart contract
            const deployment = yield* blockchain.deployToken({
              name: args.tokenName,
              symbol: args.tokenSymbol,
              totalSupply: args.totalSupply,
              blockchain: args.blockchain,
            });

            // 4. Create token_contract entity
            const contractId = yield* Effect.tryPromise(() =>
              db.insert('entities', {
                type: 'token_contract',
                name: `${args.tokenName} Contract`,
                properties: {
                  contractAddress: deployment.contractAddress,
                  blockchain: args.blockchain,
                  standard: 'ERC20',
                  deployer: args.customerId,
                },
                status: 'active',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            // 5. Create token entity
            const tokenId = yield* Effect.tryPromise(() =>
              db.insert('entities', {
                type: 'token',
                name: args.tokenName,
                properties: {
                  contractAddress: deployment.contractAddress,
                  blockchain: args.blockchain,
                  standard: 'ERC20',
                  totalSupply: args.totalSupply,
                  circulatingSupply: args.totalSupply,
                  price: 0,
                  marketCap: 0,
                  utility: args.utility,
                  burnRate: 0,
                  holders: 1,
                  transactions24h: 0,
                  volume24h: 0,
                },
                status: 'active',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            // 6. Create ownership connections
            yield* Effect.all([
              Effect.tryPromise(() =>
                db.insert('connections', {
                  fromEntityId: args.customerId,
                  toEntityId: tokenId,
                  relationshipType: 'owns',
                  createdAt: Date.now(),
                })
              ),
              Effect.tryPromise(() =>
                db.insert('connections', {
                  fromEntityId: tokenId,
                  toEntityId: contractId,
                  relationshipType: 'created_from',
                  createdAt: Date.now(),
                })
              ),
              Effect.tryPromise(() =>
                db.insert('connections', {
                  fromEntityId: args.customerId,
                  toEntityId: tokenId,
                  relationshipType: 'holds_tokens',
                  metadata: { balance: args.totalSupply },
                  createdAt: Date.now(),
                })
              ),
            ]);

            // 7. Log events
            yield* Effect.all([
              Effect.tryPromise(() =>
                db.insert('events', {
                  entityId: tokenId,
                  eventType: 'token_deployed',
                  timestamp: Date.now(),
                  actorType: 'user',
                  actorId: args.customerId,
                  metadata: {
                    contractAddress: deployment.contractAddress,
                    blockchain: args.blockchain,
                    totalSupply: args.totalSupply,
                    txHash: deployment.transactionHash,
                  },
                })
              ),
              Effect.tryPromise(() =>
                db.insert('events', {
                  entityId: 'platform', // Platform revenue tracking
                  eventType: 'revenue_generated',
                  timestamp: Date.now(),
                  metadata: {
                    amount: 99,
                    source: 'token_deployment',
                    paymentId: payment.id,
                    customerId: args.customerId,
                  },
                })
              ),
            ]);

            return {
              tokenId,
              contractAddress: deployment.contractAddress,
              transactionHash: deployment.transactionHash,
            };
          }).pipe(
            Effect.retry({ times: 3 }),
            Effect.timeout('2 minutes'),
            Effect.onError((error) =>
              Effect.gen(function* () {
                // Rollback payment if blockchain deployment fails
                if (payment) yield* stripe.refund(payment.id);
              })
            )
          ),
      };
    }),
    dependencies: [
      ConvexDatabase.Default,
      BlockchainProvider.Default,
      StripeProvider.Default,
    ],
  }
) {}
```

### Assessment

**✅ WORKS - Ontology supports this:**

- Customer entity already exists
- Token/token_contract entity types defined
- Ownership connections clear
- Event logging comprehensive

**⚠️ GAPS FOUND:**

1. **Missing Entity Type:** `token_template`
   - Users should pick from pre-made templates (basic, governance, NFT, etc.)
   - **Fix:** Add to ontology: `"token_template"` entity type

2. **Missing Connection Type:** `"deployed_from"`
   - Need to track which template was used
   - **Fix:** Add to ontology: `"deployed_from"` connection type

3. **Missing Events:**
   - `token_template_selected`
   - `token_customization_saved`
   - **Fix:** Add to event types

4. **Missing Properties in Token:**
   - `tokenomics` (distribution, vesting, unlock schedules)
   - `governance` (voting power, proposal thresholds)
   - **Fix:** Add to token property schema in docs/Ontology.md

**🔧 IMPROVEMENTS:**

1. **Add Token Builder Wizard Flow:**

   ```typescript
   // New workflow needed
   convex/workflows/token-creation.ts
   - Step 1: Select template
   - Step 2: Customize parameters
   - Step 3: Preview & simulate
   - Step 4: Pay & deploy
   - Step 5: Verify deployment
   ```

2. **Add Validation Service:**

   ```typescript
   // New service needed
   convex/services/tokens/validation.ts
   - Validate token name uniqueness
   - Check symbol format (2-5 chars)
   - Verify total supply range
   - Test contract simulation
   ```

---

## Test 2: Allow Customers to Create Their Own Website

### Feature Request

"I want to allow customers to create their own website"

### Step 1: Map to Ontology

**Entities Involved:**

- `creator` (or `audience_member`) - the customer
- `website` - NEW ENTITY TYPE (not in ontology!)
- `website_template` - NEW ENTITY TYPE
- `website_page` - NEW ENTITY TYPE
- `website_component` - NEW ENTITY TYPE

**Connections Created:**

- customer → website (relationshipType: "owns")
- website → template (relationshipType: "built_from") - NEW CONNECTION TYPE
- website → pages (relationshipType: "contains") - NEW CONNECTION TYPE
- page → components (relationshipType: "contains")

**Events Logged:**

- `website_created`
- `website_published`
- `page_added`
- `component_customized`
- `domain_connected` - NEW EVENT TYPE

**Tags Added:**

- Template tags ("landing-page", "portfolio", "course-site")
- Industry tags (inherited from creator)

### Assessment

**❌ MAJOR GAP - Ontology incomplete for websites:**

**Missing Entity Types:**

1. `"website"` - The website instance
2. `"website_template"` - Pre-built templates
3. `"website_page"` - Individual pages
4. `"website_component"` - Reusable components (hero, CTA, pricing, etc.)
5. `"website_theme"` - Color scheme, fonts, styling
6. `"domain"` - Custom domain configuration

**Missing Connection Types:**

1. `"built_from"` - website built from template
2. `"contains"` - website contains pages, page contains components
3. `"uses_theme"` - website uses theme

**Missing Event Types:**

1. `"website_created"`
2. `"website_published"`
3. `"website_unpublished"`
4. `"page_added"`
5. `"page_removed"`
6. `"page_reordered"`
7. `"component_added"`
8. `"component_customized"`
9. `"theme_changed"`
10. `"domain_connected"`
11. `"domain_verified"`

**Missing Properties:**

**Website Properties:**

```typescript
{
  domain?: string,
  customDomain?: string,
  isPublished: boolean,
  publishedUrl?: string,
  seoTitle?: string,
  seoDescription?: string,
  favicon?: string,
  analytics?: {
    googleAnalyticsId?: string,
    plausibleDomain?: string
  },
  totalPages: number,
  totalVisitors: number,
  lastPublishedAt?: number,
  deploymentStatus: "draft" | "building" | "deployed" | "failed"
}
```

**Website Page Properties:**

```typescript
{
  slug: string,
  title: string,
  order: number,
  isHomepage: boolean,
  seoTitle?: string,
  seoDescription?: string,
  components: Array<{
    type: string,
    config: any,
    order: number
  }>,
  publishedVersion?: number
}
```

**🔧 REQUIRED ADDITIONS TO ONTOLOGY:**

```typescript
// Add to docs/Ontology.md

type EntityType =
  // ... existing types

  // WEBSITE BUILDER
  | 'website' // Customer's website
  | 'website_template' // Template library
  | 'website_page' // Individual page
  | 'website_component' // Reusable component
  | 'website_theme' // Design system
  | 'domain'; // Domain config

type ConnectionType =
  // ... existing types

  // WEBSITE RELATIONSHIPS
  | 'built_from' // Website built from template
  | 'contains' // Website/page contains children
  | 'uses_theme' // Website uses theme
  | 'hosted_on'; // Website hosted on platform

type EventType =
  // ... existing types

  // WEBSITE EVENTS
  | 'website_created'
  | 'website_published'
  | 'website_unpublished'
  | 'page_added'
  | 'page_removed'
  | 'page_reordered'
  | 'component_added'
  | 'component_customized'
  | 'theme_changed'
  | 'domain_connected'
  | 'domain_verified'
  | 'website_visited';
```

**Service Design After Ontology Update:**

```typescript
// convex/services/website/builder.ts
export class WebsiteBuilderService extends Effect.Service<WebsiteBuilderService>()(
  'WebsiteBuilderService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const cloudflare = yield* CloudflareProvider;

      return {
        createWebsite: (args: {
          customerId: Id<'entities'>;
          templateId: Id<'entities'>;
          websiteName: string;
        }) =>
          Effect.gen(function* () {
            // 1. Get template
            const template = yield* Effect.tryPromise(() =>
              db.get(args.templateId)
            );

            // 2. Create website entity
            const websiteId = yield* Effect.tryPromise(() =>
              db.insert('entities', {
                type: 'website',
                name: args.websiteName,
                properties: {
                  domain: `${slugify(args.websiteName)}.one.ie`,
                  isPublished: false,
                  totalPages: 0,
                  totalVisitors: 0,
                  deploymentStatus: 'draft',
                },
                status: 'draft',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            // 3. Clone template pages
            const templatePages = yield* Effect.tryPromise(() =>
              db
                .query('connections')
                .withIndex('from_type', (q) =>
                  q
                    .eq('fromEntityId', args.templateId)
                    .eq('relationshipType', 'contains')
                )
                .collect()
            );

            for (const templatePage of templatePages) {
              const page = yield* Effect.tryPromise(() =>
                db.get(templatePage.toEntityId)
              );

              const newPageId = yield* Effect.tryPromise(() =>
                db.insert('entities', {
                  type: 'website_page',
                  name: page.name,
                  properties: {
                    slug: page.properties.slug,
                    title: page.properties.title,
                    order: page.properties.order,
                    isHomepage: page.properties.isHomepage,
                    components: page.properties.components,
                  },
                  status: 'draft',
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                })
              );

              yield* Effect.tryPromise(() =>
                db.insert('connections', {
                  fromEntityId: websiteId,
                  toEntityId: newPageId,
                  relationshipType: 'contains',
                  createdAt: Date.now(),
                })
              );
            }

            // 4. Create connections
            yield* Effect.all([
              Effect.tryPromise(() =>
                db.insert('connections', {
                  fromEntityId: args.customerId,
                  toEntityId: websiteId,
                  relationshipType: 'owns',
                  createdAt: Date.now(),
                })
              ),
              Effect.tryPromise(() =>
                db.insert('connections', {
                  fromEntityId: websiteId,
                  toEntityId: args.templateId,
                  relationshipType: 'built_from',
                  createdAt: Date.now(),
                })
              ),
            ]);

            // 5. Log event
            yield* Effect.tryPromise(() =>
              db.insert('events', {
                entityId: websiteId,
                eventType: 'website_created',
                timestamp: Date.now(),
                actorType: 'user',
                actorId: args.customerId,
                metadata: {
                  templateId: args.templateId,
                  templateName: template.name,
                },
              })
            );

            return { websiteId };
          }),
      };
    }),
  }
) {}
```

---

## Test 3: Allow Customers to Create Their Own Playbook

### Feature Request

"I want to allow customers to create their own playbook"

### Step 1: Map to Ontology

**Entities Involved:**

- `creator` - the customer
- `playbook` - NEW ENTITY TYPE (not in ontology!)
- `playbook_step` - NEW ENTITY TYPE
- `playbook_template` - NEW ENTITY TYPE
- `playbook_execution` - NEW ENTITY TYPE (tracking runs)

**What is a Playbook?**
A playbook is an automated workflow/process that:

- Has multiple steps
- Each step can be manual or automated
- Steps can branch based on conditions
- Can integrate with external tools (n8n, Zapier, etc.)
- Tracks execution history

**Connections Created:**

- customer → playbook (relationshipType: "owns")
- playbook → steps (relationshipType: "contains")
- playbook → template (relationshipType: "built_from")
- playbook → executions (relationshipType: "executed_as")

**Events Logged:**

- `playbook_created`
- `playbook_step_added`
- `playbook_executed`
- `playbook_step_completed`
- `playbook_step_failed`

### Assessment

**❌ MAJOR GAP - Playbooks not in ontology:**

**Missing Entity Types:**

1. `"playbook"` - The automated workflow
2. `"playbook_template"` - Pre-built playbooks
3. `"playbook_step"` - Individual step in workflow
4. `"playbook_execution"` - Runtime instance
5. `"integration"` - External tool connection (n8n, Zapier, Make)

**Missing Connection Types:**

1. `"contains"` - Already exists but needs playbook context
2. `"built_from"` - Already exists
3. `"executed_as"` - playbook → execution instance
4. `"depends_on"` - step depends on previous step
5. `"connected_to"` - playbook connected to integration

**Missing Event Types:**

1. `"playbook_created"`
2. `"playbook_published"`
3. `"playbook_executed"`
4. `"playbook_step_started"`
5. `"playbook_step_completed"`
6. `"playbook_step_failed"`
7. `"playbook_completed"`
8. `"playbook_failed"`
9. `"integration_connected"`
10. `"integration_triggered"`

**Missing Properties:**

**Playbook Properties:**

```typescript
{
  description: string,
  category: "marketing" | "sales" | "operations" | "customer_success",
  trigger: {
    type: "manual" | "scheduled" | "event" | "webhook",
    config: any
  },
  steps: number,
  totalExecutions: number,
  successRate: number,
  averageRuntime: number,
  isPublished: boolean,
  version: number
}
```

**Playbook Step Properties:**

```typescript
{
  order: number,
  name: string,
  description: string,
  type: "manual" | "api_call" | "ai_generation" | "email" | "wait" | "condition",
  config: {
    // For API calls
    method?: "GET" | "POST" | "PUT" | "DELETE",
    url?: string,
    headers?: Record<string, string>,
    body?: any,

    // For AI generation
    model?: string,
    prompt?: string,

    // For conditions
    condition?: string,
    trueStepId?: Id<"entities">,
    falseStepId?: Id<"entities">,

    // For wait
    duration?: number
  },
  retries: number,
  timeout: number
}
```

**🔧 REQUIRED ADDITIONS:**

```typescript
// Add to docs/Ontology.md

type EntityType =
  // ... existing types

  // PLAYBOOK AUTOMATION
  | 'playbook' // Automated workflow
  | 'playbook_template' // Template library
  | 'playbook_step' // Workflow step
  | 'playbook_execution' // Runtime instance
  | 'integration' // External tool (n8n, Zapier)
  | 'webhook'; // Webhook endpoint

type ConnectionType =
  // ... existing types

  // PLAYBOOK RELATIONSHIPS
  | 'executed_as' // Playbook → execution
  | 'depends_on' // Step depends on step
  | 'connected_to' // Playbook → integration
  | 'triggered_by'; // Execution triggered by event
```

---

## Test 4: Connect to ElizaOS, n8n

### Feature Request

"I want to connect to ElizaOS, n8n"

### Step 1: Map to Ontology

**Entities Involved:**

- `integration` - NEW ENTITY TYPE
- `webhook` - NEW ENTITY TYPE
- `api_credential` - NEW ENTITY TYPE
- AI agents (strategy, marketing, etc.) - existing

**What is ElizaOS?**

- Multi-agent system
- Each agent has specific role
- Agents can be triggered by events
- Agents communicate via messages

**What is n8n?**

- Workflow automation tool
- Nodes connected in workflows
- Can trigger on events, schedules, webhooks
- Can call our APIs

**Connections Created:**

- creator → integration (relationshipType: "configured")
- integration → webhook (relationshipType: "listens_to")
- playbook → integration (relationshipType: "connected_to")
- ai_agent → integration (relationshipType: "integrated_with")

**Events Logged:**

- `integration_connected`
- `integration_configured`
- `webhook_received`
- `external_workflow_triggered`
- `agent_message_sent`
- `agent_message_received`

### Assessment

**⚠️ PARTIAL GAP - Integration entities needed:**

**Missing Entity Types:**

1. `"integration"` - External tool connection
2. `"webhook"` - Webhook endpoint
3. `"api_credential"` - Stored credentials (encrypted)
4. `"external_agent"` - ElizaOS agent reference

**Missing Connection Types:**

1. `"configured"` - User configured integration
2. `"listens_to"` - Integration listens to webhook
3. `"integrated_with"` - Our agent ↔ external agent
4. `"syncs_to"` - Data syncs to external system

**Missing Event Types:**

1. `"integration_connected"`
2. `"integration_disconnected"`
3. `"webhook_received"`
4. `"webhook_failed"`
5. `"external_workflow_triggered"`
6. `"agent_message_sent"`
7. `"agent_message_received"`
8. `"sync_started"`
9. `"sync_completed"`

**Integration Properties:**

```typescript
{
  provider: "elizaos" | "n8n" | "zapier" | "make" | "custom",
  apiEndpoint: string,
  apiKey?: string, // Encrypted
  webhookUrl?: string,
  isActive: boolean,
  lastSyncAt?: number,
  totalSyncs: number,
  failureCount: number,
  config: {
    // ElizaOS specific
    agentIds?: string[],
    chatRoomId?: string,

    // n8n specific
    workflowId?: string,
    webhookPath?: string
  }
}
```

---

## Test 5: Bidirectional ElizaOS Plugin Compatibility

### Feature Request

"I want to become compatible with ElizaOS plugins - both exposing our agents as ElizaOS plugins AND using ElizaOS plugins in our system"

### Step 1: Map to Ontology

**Two-Way Plugin System:**

#### Direction 1: Expose Our Agents as ElizaOS Plugins

**Use Case:** ElizaOS users can install and use our AI agents (strategy, marketing, sales, etc.) in their ElizaOS instances.

**Entities Involved:**

- `plugin` - Our agent wrapped as ElizaOS plugin
- `plugin_manifest` - ElizaOS-compatible manifest
- Our AI agents (strategy, marketing, etc.) - existing
- `plugin_permission` - Permissions our plugin requires

**Connections Created:**

- plugin → ai_agent (relationshipType: "wraps")
- external_user → plugin (relationshipType: "installed") - tracked externally
- plugin → permission (relationshipType: "requires")

**Events Logged:**

- `plugin_published` (to ElizaOS registry)
- `plugin_installed` (by external ElizaOS user)
- `plugin_executed` (usage tracking)
- `plugin_api_called` (API usage)

#### Direction 2: Use ElizaOS Plugins in Our System

**Use Case:** Our customers can install ElizaOS plugins to extend their ONE platform capabilities.

**Entities Involved:**

- `external_plugin` - NEW ENTITY TYPE - ElizaOS plugin we're consuming
- `plugin_instance` - NEW ENTITY TYPE - Installed instance for a customer
- `plugin_configuration` - NEW ENTITY TYPE - Customer-specific config
- Our AI agents (existing) - may interact with external plugins

**Connections Created:**

- customer → plugin_instance (relationshipType: "installed")
- plugin_instance → external_plugin (relationshipType: "instance_of")
- plugin_instance → configuration (relationshipType: "configured_with")
- ai_agent → plugin_instance (relationshipType: "uses") - our agent uses external plugin
- playbook → plugin_instance (relationshipType: "integrated_with")

**Events Logged:**

- `external_plugin_discovered` (found in ElizaOS registry)
- `external_plugin_installed` (customer installed it)
- `external_plugin_configured`
- `external_plugin_executed`
- `external_plugin_failed`
- `plugin_data_synced` (data exchange)
- `permission_granted` (customer grants permissions)

**Tags Added:**

- Plugin categories ("ai", "automation", "analytics", "communication")
- ElizaOS compatibility version

### Assessment

**❌ MAJOR GAP - Bidirectional plugin system not designed:**

#### Missing Entity Types (Our Plugins → ElizaOS)

1. `"plugin"` - Plugin wrapper for our agents
2. `"plugin_manifest"` - Plugin metadata/config
3. `"plugin_permission"` - Permissions required
4. `"plugin_registry_entry"` - Our listing in ElizaOS registry

#### Missing Entity Types (ElizaOS Plugins → Our System)

1. `"external_plugin"` - ElizaOS plugin reference
2. `"plugin_instance"` - Installed instance per customer
3. `"plugin_configuration"` - Customer-specific settings
4. `"plugin_marketplace"` - Browse/discover external plugins
5. `"plugin_subscription"` - Paid plugin subscriptions
6. `"plugin_execution_log"` - Execution history/debugging
7. `"plugin_review"` - Customer reviews/ratings

#### Missing Connection Types

1. `"wraps"` - Our plugin wraps our agent
2. `"installed"` - User/customer installed plugin
3. `"instance_of"` - Instance of external plugin
4. `"configured_with"` - Instance configured with settings
5. `"requires"` - Plugin requires permission
6. `"implements"` - Plugin implements ElizaOS interface
7. `"uses"` - Our agent uses external plugin
8. `"integrated_with"` - Playbook integrated with plugin
9. `"subscribes_to"` - Customer subscribes to paid plugin
10. `"listed_in"` - Plugin listed in registry
11. `"depends_on"` - Plugin depends on another plugin

#### Missing Event Types (Outbound - Our Plugins)

1. `"plugin_published"` - Published to ElizaOS registry
2. `"plugin_version_released"` - New version released
3. `"plugin_api_called"` - External user called our plugin
4. `"plugin_usage_tracked"` - Usage metrics
5. `"plugin_revenue_generated"` - Revenue from plugin usage

#### Missing Event Types (Inbound - ElizaOS Plugins)

1. `"external_plugin_discovered"` - Found in marketplace
2. `"external_plugin_installed"` - Customer installed
3. `"external_plugin_configured"` - Configuration saved
4. `"external_plugin_executed"` - Plugin executed
5. `"external_plugin_failed"` - Execution failed
6. `"external_plugin_updated"` - Plugin updated to new version
7. `"external_plugin_uninstalled"` - Customer removed plugin
8. `"plugin_permission_requested"` - Plugin asks for permission
9. `"plugin_permission_granted"` - Customer grants permission
10. `"plugin_permission_revoked"` - Customer revokes permission
11. `"plugin_data_imported"` - Data imported from plugin
12. `"plugin_data_exported"` - Data exported to plugin
13. `"plugin_subscription_started"` - Paid plugin subscription
14. `"plugin_subscription_renewed"`
15. `"plugin_subscription_cancelled"`
16. `"plugin_review_submitted"` - Customer reviewed plugin

**Plugin Properties:**

```typescript
{
  pluginId: string,
  version: string,
  name: string,
  description: string,
  author: Id<"entities">,
  category: string[],
  elizaCompatible: boolean,
  elizaVersion: string,
  manifestUrl: string,
  iconUrl?: string,
  permissions: string[],
  endpoints: Array<{
    method: string,
    path: string,
    description: string
  }>,
  pricing: {
    model: "free" | "paid" | "freemium",
    price?: number
  },
  installs: number,
  rating: number
}
```

---

## Summary of Gaps & Required Improvements

### Critical Ontology Additions Needed

#### New Entity Types (28 new types total)

```typescript
// WEBSITE BUILDER (6 types)
| "website"
| "website_template"
| "website_page"
| "website_component"
| "website_theme"
| "domain"

// PLAYBOOK AUTOMATION (4 types)
| "playbook"
| "playbook_template"
| "playbook_step"
| "playbook_execution"

// INTEGRATIONS (4 types)
| "integration"
| "webhook"
| "api_credential"
| "external_agent"

// PLUGIN SYSTEM - BIDIRECTIONAL (14 types)
// Outbound (Our Plugins → ElizaOS)
| "plugin"                    // Our agent as plugin
| "plugin_manifest"           // Plugin metadata
| "plugin_permission"         // Required permissions
| "plugin_registry_entry"     // ElizaOS registry listing

// Inbound (ElizaOS Plugins → Our System)
| "external_plugin"           // ElizaOS plugin reference
| "plugin_instance"           // Customer installation
| "plugin_configuration"      // Customer config
| "plugin_marketplace"        // Plugin browsing
| "plugin_subscription"       // Paid subscriptions
| "plugin_execution_log"      // Execution history
| "plugin_review"             // Customer reviews
```

#### New Connection Types (22 new types total)

```typescript
// WEBSITE (4 types)
| "built_from"
| "contains"
| "uses_theme"
| "hosted_on"

// PLAYBOOK (4 types)
| "executed_as"
| "depends_on"
| "connected_to"
| "triggered_by"

// INTEGRATION (4 types)
| "configured"
| "listens_to"
| "integrated_with"
| "syncs_to"

// PLUGIN - BIDIRECTIONAL (10 types)
| "wraps"                     // Plugin wraps agent
| "installed"                 // Customer installed
| "instance_of"               // Instance of external plugin
| "configured_with"           // Instance configuration
| "requires"                  // Requires permission
| "implements"                // Implements interface
| "uses"                      // Agent uses plugin
| "subscribes_to"             // Paid subscription
| "listed_in"                 // Listed in registry
| "depends_on"                // Plugin dependency
```

#### New Event Types (66+ new types total)

```typescript
// WEBSITE EVENTS (12)
| "website_created" | "website_published" | "website_unpublished"
| "page_added" | "page_removed" | "page_reordered"
| "component_added" | "component_customized"
| "theme_changed" | "domain_connected" | "domain_verified"
| "website_visited"

// PLAYBOOK EVENTS (10)
| "playbook_created" | "playbook_published"
| "playbook_executed" | "playbook_step_started"
| "playbook_step_completed" | "playbook_step_failed"
| "playbook_completed" | "playbook_failed"
| "integration_connected" | "integration_triggered"

// INTEGRATION EVENTS (9)
| "integration_connected" | "integration_disconnected"
| "webhook_received" | "webhook_failed"
| "external_workflow_triggered"
| "agent_message_sent" | "agent_message_received"
| "sync_started" | "sync_completed"

// PLUGIN EVENTS - BIDIRECTIONAL (35+)
// Outbound (Our Plugins → ElizaOS) (5)
| "plugin_published"          // Published to registry
| "plugin_version_released"   // New version
| "plugin_api_called"         // External API call
| "plugin_usage_tracked"      // Usage metrics
| "plugin_revenue_generated"  // Revenue tracking

// Inbound (ElizaOS Plugins → Our System) (30)
| "external_plugin_discovered"
| "external_plugin_installed"
| "external_plugin_configured"
| "external_plugin_executed"
| "external_plugin_failed"
| "external_plugin_updated"
| "external_plugin_uninstalled"
| "plugin_permission_requested"
| "plugin_permission_granted"
| "plugin_permission_revoked"
| "plugin_data_imported"
| "plugin_data_exported"
| "plugin_subscription_started"
| "plugin_subscription_renewed"
| "plugin_subscription_cancelled"
| "plugin_review_submitted"
// ... and more for plugin lifecycle management
```

**Summary:**
- **28 new entity types** (was 17, now includes bidirectional plugin system)
- **22 new connection types** (was 15, now includes bidirectional relationships)
- **66+ new event types** (was 40, now includes comprehensive plugin events)

### Process Improvements

#### 1. Add Pre-Implementation Ontology Check

**Current Process:**

```
Read docs → Map to ontology → Design service → Implement
```

**Improved Process:**

```
Read docs → Map to ontology → CHECK GAPS → Update ontology → Design service → Implement
```

Add to CLAUDE.md:

```markdown
#### Step 1.5: Ontology Gap Analysis (NEW STEP)

Before designing services, verify ontology completeness:

- [ ] All entity types exist in ontology
- [ ] All connection types defined
- [ ] All event types defined
- [ ] All properties documented

If gaps found:

1. Document gap in `docs/ontology-gaps.md`
2. Propose additions with rationale
3. Get approval before proceeding
4. Update `docs/Ontology.md`
5. Regenerate types (`npx convex dev`)
6. THEN proceed to service design
```

#### 2. Add Ontology Versioning

**Problem:** Ontology will grow, need to track changes

**Solution:** Add to Ontology.md:

```markdown
## Ontology Version History

### v1.1.0 (2025-01-XX)

**Added:** Website builder support

- Entity types: website, website_template, website_page, website_component, website_theme, domain
- Connection types: built_from, contains, uses_theme, hosted_on
- Event types: website_created, website_published, etc.

### v1.0.0 (2025-01-15)

**Initial release**

- Core entities: creator, ai_clone, audience_member, agents (10), content types, products
- Core connections: owns, clone_of, trained_on, etc.
- Core events: creator_created, clone_interaction, etc.
```

#### 3. Add Ontology Validation Service

**New service needed:**

```typescript
// convex/services/core/ontology-validator.ts
export class OntologyValidator extends Effect.Service<OntologyValidator>()(
  'OntologyValidator',
  {
    effect: Effect.gen(function* () {
      return {
        validateEntity: (entity: any) => {
          // Check if entity type is valid
          // Check if properties match schema
          // Return typed error if invalid
        },

        validateConnection: (connection: any) => {
          // Check if relationship type is valid
          // Check if entities exist
          // Check if relationship makes sense semantically
        },

        validateEvent: (event: any) => {
          // Check if event type is valid
          // Check if metadata matches schema
        },
      };
    }),
  }
) {}
```

#### 4. Add Feature Complexity Score

Add to development process:

```markdown
### Feature Complexity Assessment

Before implementing, score feature complexity:

**Score 1 (Simple):** Uses existing ontology, <3 services, <5 files

- Example: Add new AI agent type

**Score 3 (Medium):** Adds 1-3 entity types, 3-7 services, 5-15 files

- Example: Token minting feature

**Score 5 (Complex):** Adds 4+ entity types, 8+ services, 15+ files, external integrations

- Example: Website builder, Playbook system

**Score 7+ (Major):** Requires ontology expansion, new patterns, architectural changes

- Example: Plugin system, Multi-tenant support

For Score 5+: Require architecture review before implementation
```

### Strengths of Current Process

**✅ What Works Well:**

1. **4-Table Ontology is Flexible:** Can model complex features
2. **Entity Properties (JSON):** Allows feature-specific data without schema changes
3. **Connection Metadata:** Supports rich relationship data
4. **Event Logging:** Comprehensive audit trail
5. **Effect.ts Services:** Clean separation of concerns
6. **Type Safety:** Catches errors at compile time
7. **Pattern Library:** Speeds up similar features

**✅ What Makes It Better As Codebase Grows:**

1. **Composable Services:** New features reuse existing services
2. **Consistent Patterns:** AI learns from past implementations
3. **Type-Driven:** New code must match existing types
4. **Event Sourcing:** Can rebuild state from events
5. **Clear Boundaries:** Each service has single responsibility

### Final Recommendations

#### Immediate Actions

1. **Update docs/Ontology.md** with all missing types (website, playbook, integration, plugin)
2. **Add `docs/ontology-gaps.md`** for tracking proposed additions
3. **Add Ontology Gap Analysis step** to CLAUDE.md development process
4. **Create OntologyValidator service** for runtime validation
5. **Version the ontology** with changelog

#### Medium-Term

1. **Build ontology visualization tool** - Interactive diagram showing all entities/connections
2. **Add ontology migration system** - Handle schema evolution gracefully
3. **Create ontology test suite** - Validate all patterns work together
4. **Document anti-patterns** - What NOT to do with ontology

#### Long-Term

1. **AI-assisted ontology expansion** - AI suggests new types based on feature requests
2. **Ontology analytics** - Track which types are most used, identify redundancy
3. **Cross-platform ontology** - Same ontology for web, mobile, API

---

## Conclusion

**Does the development process work?**

**YES**, but with **critical gaps** that would block implementation of these features.

**Is it good enough?**

**Not yet**. Needs immediate updates for:

- Website builder entities
- Playbook/workflow entities
- Integration entities
- Plugin system entities

**Will it make code better as codebase grows?**

**YES**, because:

1. Ontology forces consistency
2. Services compose rather than duplicate
3. Types catch breaking changes
4. Patterns become clearer over time
5. AI learns from successful implementations

**Action Required:**

Update Ontology.md NOW before implementing any of these features. The process is sound, but the ontology needs expansion to cover these use cases.

**Score: 7/10**

- Process architecture: ✅ Excellent
- Current ontology coverage: ⚠️ Needs expansion
- Scalability: ✅ Proven pattern
- AI-friendliness: ✅ Very good
