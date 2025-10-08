# Convex Components

A comprehensive list of available Convex components from <https://www.convex.dev/components>

## Durable Functions

### 1. Workpool

**Description:** Workpools give critical tasks priority by organizing async operations into separate, customizable queues.

**Use Cases:**

- Task prioritization
- Queue management
- Async operation organization

### 2. Crons

**Description:** Use cronspec to run functions on a repeated schedule.

**Use Cases:**

- Scheduled tasks
- Periodic jobs
- Time-based automation

### 3. Workflow

**Description:** Simplify programming long running code flows. Workflows execute durably with configurable retries and delays.

**Use Cases:**

- Multi-step processes
- Long-running operations
- Complex business logic flows

### 4. Action Retrier

**Description:** Add reliability to an unreliable external service. Retry idempotent calls a set number of times.

**Use Cases:**

- API call reliability
- External service integration
- Fault tolerance

## Database Components

### 5. Sharded Counter

**Description:** Scalable counter that can increment and decrement with high throughput.

**Use Cases:**

- View counters
- Like/vote counting
- High-throughput metrics

### 6. Migrations

**Description:** Framework for long running data migrations of live data.

**Use Cases:**

- Schema changes
- Data transformations
- Database updates

### 7. Aggregate

**Description:** Keep track of sums and counts in a denormalized and scalable way.

**Use Cases:**

- Analytics
- Statistics tracking
- Summary data

### 8. Geospatial

**Description:** Efficiently query points on a map within a selected region of the globe.

**Use Cases:**

- Location-based features
- Map queries
- Geographic search

### 9. RAG (Retrieval-Augmented Generation)

**Description:** Retrieval-Augmented Generation (RAG) for use with your AI products and Agents.

**Use Cases:**

- AI chatbots
- Semantic search
- Knowledge bases

### 10. Presence

**Description:** Track user presence in real-time.

**Use Cases:**

- Online status
- Active users tracking
- Real-time collaboration

## Integrations

### 11. Cloudflare R2

**Description:** Store and serve files from Cloudflare R2.

**Use Cases:**

- File storage
- Media hosting
- Asset management

### 12. Resend

**Description:** Send reliable transactional emails to your users with Resend.

**Use Cases:**

- Transactional emails
- User notifications
- Email campaigns

### 13. Collaborative Text Editor Sync

**Description:** Add a collaborative editor sync engine for the popular ProseMirror-based Tiptap and BlockNote rich text editors.

**Use Cases:**

- Real-time collaborative editing
- Document collaboration
- Rich text editing

### 14. Polar

**Description:** Add subscriptions and billing to your Convex app with Polar.

**Use Cases:**

- Subscription management
- Payment processing
- Billing automation


### 16. Twilio SMS

**Description:** Easily send and receive SMS via Twilio.

**Use Cases:**

- SMS notifications
- Two-factor authentication
- Text messaging

### 17. LaunchDarkly Feature Flags

**Description:** Feature flag management with LaunchDarkly integration.

**Use Cases:**

- Feature toggles
- A/B testing
- Gradual rollouts

## Installation Guide

To install a Convex component, use the following command:

```bash
npx convex deploy --install <component-name>
```

Or add to your `convex.json` configuration file.

## Recommended Components for This Project

Based on the current project setup with authentication and real-time features:

1. **Presence** - Track online users in real-time
2. **Crons** - Schedule periodic tasks (e.g., cleanup, notifications)
3. **Resend** - Email notifications for auth flows
4. **Action Retrier** - Improve reliability of external API calls
5. **Aggregate** - Track usage statistics and metrics

## Next Steps

1. Review component documentation at <https://www.convex.dev/components>
2. Determine which components are needed for the project
3. Install selected components using `npx convex deploy --install <component-name>`
4. Configure components according to project requirements
5. Integrate components into existing features
