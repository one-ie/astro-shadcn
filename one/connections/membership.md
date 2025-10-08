# Membership Connections

**Last Updated:** 2025-10-08
**Status:** Complete
**Layer:** Ontology → Connections

---

## Overview

**Membership connections** represent formal relationships between users and organizational structures within the ONE Platform. They enable:

1. **Organization Membership** - Users joining multi-tenant organizations with specific roles
2. **Community Membership** - Following creators, joining communities, participating in conversations
3. **Role-Based Access Control** - Granular permissions based on membership roles
4. **Invitation Flows** - Structured processes for adding members to organizations
5. **Multi-Tenant Routing** - Dashboard access based on organization membership

**Key Principle:** Memberships are bidirectional relationships stored in the `connections` table with rich metadata defining roles, permissions, and invitation context.

---

## Connection Types

The ontology defines **4 membership connection types**:

```typescript
type MembershipConnectionType =
  | 'member_of'        // Organization/community membership (with roles)
  | 'following'        // Creator/audience following relationship
  | 'moderates'        // Moderator role in community/conversation
  | 'participated_in'; // Event/conversation participation
```

### 1. member_of (Organization/Community Membership)

**Purpose:** Links users to organizations or communities with role-based metadata.

**Direction:** User → Organization/Community

**Use Cases:**
- Multi-tenant organization membership (org_owner, org_user)
- Community membership (member, moderator, admin)
- Permission-based access control
- Dashboard routing (platform owner vs org owner vs org user)

**Metadata Structure:**
```typescript
{
  role: 'platform_owner' | 'org_owner' | 'org_user' | 'member' | 'moderator' | 'admin',
  permissions: string[],           // Array of permission strings
  invitedBy?: Id<'entities'>,     // User who invited this member
  invitedAt?: number,              // Invitation timestamp
  joinedAt: number,                // When user joined
  expiresAt?: number,              // Optional membership expiration
}
```

### 2. following (Creator/Audience Relationship)

**Purpose:** Represents audience members following creators for content updates.

**Direction:** Audience Member → Creator

**Use Cases:**
- Newsletter subscriptions
- Content notifications
- Creator analytics (follower count)
- Targeted content distribution

**Metadata Structure:**
```typescript
{
  followedAt: number,              // When follow started
  notificationPreferences?: {
    email: boolean,
    push: boolean,
    inApp: boolean,
  },
  source?: string,                 // How they found the creator
}
```

### 3. moderates (Moderator Role)

**Purpose:** Grants moderation privileges in communities or conversations.

**Direction:** User → Community/Conversation

**Use Cases:**
- Community moderation
- Conversation thread moderation
- Content approval workflows
- User management in communities

**Metadata Structure:**
```typescript
{
  permissions: string[],           // Specific moderation permissions
  assignedBy: Id<'entities'>,     // Who assigned moderator role
  assignedAt: number,              // When role was assigned
  scope?: string,                  // Optional scope restrictions
}
```

### 4. participated_in (Event/Conversation Participation)

**Purpose:** Tracks participation in events, conversations, or collaborative spaces.

**Direction:** User → Event/Conversation

**Use Cases:**
- Conversation tracking
- Event attendance
- Collaborative project participation
- Activity history

**Metadata Structure:**
```typescript
{
  participatedAt: number,          // When participation started
  lastActiveAt: number,            // Most recent activity
  messageCount?: number,           // Number of messages/contributions
  role?: string,                   // Participant role (optional)
}
```

---

## Ontology Mapping

### 4-Table Structure

**Things Involved:**
- `creator` - Platform owner, org owner, org user (with role property)
- `organization` - Multi-tenant organization
- `community` - Community space
- `conversation` - Discussion thread
- `audience_member` - Fan/customer

**Connections Created:**
```typescript
// Organization membership
{
  fromEntityId: userId,            // User entity
  toEntityId: organizationId,      // Organization entity
  relationshipType: 'member_of',
  metadata: {
    role: 'org_owner',
    permissions: ['*'],
    joinedAt: Date.now(),
  }
}

// Creator following
{
  fromEntityId: audienceMemberId,
  toEntityId: creatorId,
  relationshipType: 'following',
  metadata: {
    followedAt: Date.now(),
    notificationPreferences: { email: true }
  }
}

// Community moderation
{
  fromEntityId: userId,
  toEntityId: communityId,
  relationshipType: 'moderates',
  metadata: {
    permissions: ['delete_messages', 'ban_users'],
    assignedBy: adminUserId,
    assignedAt: Date.now(),
  }
}

// Conversation participation
{
  fromEntityId: userId,
  toEntityId: conversationId,
  relationshipType: 'participated_in',
  metadata: {
    participatedAt: Date.now(),
    lastActiveAt: Date.now(),
    messageCount: 5,
  }
}
```

**Events Generated:**
```typescript
// User invited to organization
{
  type: 'user_invited_to_org',
  actorId: inviterId,
  targetId: organizationId,
  metadata: {
    invitedEmail: 'user@example.com',
    role: 'org_user',
  }
}

// User joined organization
{
  type: 'user_joined_org',
  actorId: userId,
  targetId: organizationId,
  metadata: {
    role: 'org_user',
    invitedBy: inviterId,
  }
}

// User started following creator
{
  type: 'content_event',
  actorId: audienceMemberId,
  targetId: creatorId,
  metadata: {
    action: 'followed',
    source: 'website',
  }
}

// Moderator assigned
{
  type: 'user_role_updated',
  actorId: userId,
  targetId: communityId,
  metadata: {
    newRole: 'moderator',
    assignedBy: adminId,
  }
}
```

---

## TypeScript Definitions

### Connection Schema

```typescript
import type { Id } from '../_generated/dataModel';

/**
 * Membership connection in connections table
 */
export interface MembershipConnection {
  _id: Id<'connections'>;
  fromEntityId: Id<'entities'>;     // User
  toEntityId: Id<'entities'>;       // Organization/Community/Creator
  relationshipType: 'member_of' | 'following' | 'moderates' | 'participated_in';
  metadata?: MembershipMetadata;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

/**
 * Membership metadata variants
 */
export type MembershipMetadata =
  | OrganizationMembershipMetadata
  | FollowingMetadata
  | ModerationMetadata
  | ParticipationMetadata;

/**
 * Organization membership metadata
 */
export interface OrganizationMembershipMetadata {
  role: 'platform_owner' | 'org_owner' | 'org_user' | 'member' | 'moderator' | 'admin';
  permissions: string[];
  invitedBy?: Id<'entities'>;
  invitedAt?: number;
  joinedAt: number;
  expiresAt?: number;
}

/**
 * Creator following metadata
 */
export interface FollowingMetadata {
  followedAt: number;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  source?: string;
}

/**
 * Moderation metadata
 */
export interface ModerationMetadata {
  permissions: string[];
  assignedBy: Id<'entities'>;
  assignedAt: number;
  scope?: string;
}

/**
 * Participation metadata
 */
export interface ParticipationMetadata {
  participatedAt: number;
  lastActiveAt: number;
  messageCount?: number;
  role?: string;
}
```

---

## Role-Based Patterns

### Multi-Tenant Organization Roles

The ONE Platform supports **4 primary roles** through the `member_of` connection:

#### 1. Platform Owner
- **User:** Anthony O'Connell (toc@anthonyoconnell.com)
- **Role:** `platform_owner` (set in creator entity `properties.role`)
- **Access:** Global dashboard, all organizations, revenue tracking
- **Connections:** Member of platform administration organization
- **Properties:**
```typescript
{
  type: 'creator',
  properties: {
    role: 'platform_owner',
    email: 'toc@anthonyoconnell.com',
    // ... other properties
  }
}
```

#### 2. Organization Owner
- **Role:** `org_owner` (set in connection metadata)
- **Access:** Full control over their organization, can invite users, manage billing
- **Permissions:** `['*']` (all permissions within org)
- **Connection:**
```typescript
{
  fromEntityId: userId,
  toEntityId: orgId,
  relationshipType: 'member_of',
  metadata: {
    role: 'org_owner',
    permissions: ['*'],
    joinedAt: Date.now(),
  }
}
```

#### 3. Organization User
- **Role:** `org_user` (set in connection metadata)
- **Access:** Limited to assigned permissions
- **Permissions:** Granular array of strings
- **Connection:**
```typescript
{
  fromEntityId: userId,
  toEntityId: orgId,
  relationshipType: 'member_of',
  metadata: {
    role: 'org_user',
    permissions: ['create_agents', 'create_content', 'view_analytics'],
    invitedBy: orgOwnerId,
    invitedAt: Date.now(),
    joinedAt: Date.now(),
  }
}
```

#### 4. Customer
- **Role:** `customer` (set in creator entity `properties.role`)
- **Access:** Limited to their own resources, no organization context
- **Properties:**
```typescript
{
  type: 'audience_member',
  properties: {
    role: 'customer',
    email: 'customer@example.com',
  }
}
```

### Permission Patterns

**Permission strings** are stored in connection metadata and checked by middleware:

```typescript
// Common permissions
const PERMISSIONS = {
  // Organization management
  'manage_org': 'Update organization settings',
  'manage_billing': 'Manage subscriptions and billing',
  'manage_users': 'Invite/remove organization members',

  // Resource creation
  'create_agents': 'Create AI agents',
  'create_content': 'Create content (posts, videos, courses)',
  'create_tokens': 'Create tokens and token contracts',

  // Resource management
  'edit_agents': 'Modify AI agents',
  'edit_content': 'Modify content',
  'delete_resources': 'Delete any resource',

  // Analytics
  'view_analytics': 'View analytics dashboard',
  'export_data': 'Export organization data',

  // Special
  '*': 'All permissions (admin)',
};
```

---

## Code Examples

### 1. Create Organization Membership

```typescript
// convex/mutations/organizations.ts
import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    creatorId: v.id('entities'),
    plan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Create organization entity
    const orgId = await ctx.db.insert('entities', {
      type: 'organization',
      name: args.name,
      properties: {
        slug: args.slug,
        plan: args.plan || 'starter',
        settings: {
          limits: { users: 10, agents: 3 },
          features: { aiClone: false },
        },
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 2. Add creator as org_owner
    await ctx.db.insert('connections', {
      fromEntityId: args.creatorId,
      toEntityId: orgId,
      relationshipType: 'member_of',
      metadata: {
        role: 'org_owner',
        permissions: ['*'],
        joinedAt: Date.now(),
      },
      createdAt: Date.now(),
    });

    // 3. Log event
    await ctx.db.insert('events', {
      type: 'organization_created',
      actorId: args.creatorId,
      targetId: orgId,
      timestamp: Date.now(),
      metadata: {
        name: args.name,
        plan: args.plan || 'starter',
      },
    });

    return { orgId, slug: args.slug };
  },
});
```

### 2. Invite User to Organization

```typescript
// convex/mutations/organizations.ts
export const inviteUser = mutation({
  args: {
    orgId: v.id('entities'),
    email: v.string(),
    role: v.union(v.literal('org_user'), v.literal('admin')),
    inviterId: v.id('entities'),
  },
  handler: async (ctx, args) => {
    // 1. Check inviter has permission
    const inviterMembership = await ctx.db
      .query('connections')
      .withIndex('from_type', (q) =>
        q.eq('fromEntityId', args.inviterId).eq('relationshipType', 'member_of')
      )
      .filter((q) => q.eq(q.field('toEntityId'), args.orgId))
      .first();

    if (!inviterMembership || inviterMembership.metadata?.role !== 'org_owner') {
      throw new Error('Insufficient permissions');
    }

    // 2. Create invitation entity
    const inviteId = await ctx.db.insert('entities', {
      type: 'invitation',
      name: `Invitation for ${args.email}`,
      properties: {
        email: args.email,
        orgId: args.orgId,
        role: args.role,
        token: crypto.randomUUID(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        status: 'pending',
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Log event
    await ctx.db.insert('events', {
      type: 'user_invited_to_org',
      actorId: args.inviterId,
      targetId: args.orgId,
      timestamp: Date.now(),
      metadata: {
        invitedEmail: args.email,
        role: args.role,
        inviteId,
      },
    });

    // 4. TODO: Send invitation email (via internal action)

    return { inviteId };
  },
});
```

### 3. Accept Organization Invitation

```typescript
// convex/mutations/organizations.ts
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
    userId: v.id('entities'),
  },
  handler: async (ctx, args) => {
    // 1. Find invitation
    const invite = await ctx.db
      .query('entities')
      .withIndex('by_type', (q) => q.eq('type', 'invitation'))
      .filter((q) => q.eq(q.field('properties.token'), args.token))
      .first();

    if (!invite) {
      throw new Error('Invalid invitation');
    }

    if (invite.properties.status !== 'pending') {
      throw new Error('Invitation already used');
    }

    if (invite.properties.expiresAt < Date.now()) {
      throw new Error('Invitation expired');
    }

    // 2. Create membership connection
    const permissions =
      invite.properties.role === 'admin'
        ? ['*']
        : ['create_agents', 'create_content', 'view_analytics'];

    await ctx.db.insert('connections', {
      fromEntityId: args.userId,
      toEntityId: invite.properties.orgId,
      relationshipType: 'member_of',
      metadata: {
        role: invite.properties.role,
        permissions,
        invitedBy: invite.properties.inviterId,
        invitedAt: invite.createdAt,
        joinedAt: Date.now(),
      },
      createdAt: Date.now(),
    });

    // 3. Mark invitation as accepted
    await ctx.db.patch(invite._id, {
      properties: {
        ...invite.properties,
        status: 'accepted',
        acceptedAt: Date.now(),
        acceptedBy: args.userId,
      },
    });

    // 4. Log event
    await ctx.db.insert('events', {
      type: 'user_joined_org',
      actorId: args.userId,
      targetId: invite.properties.orgId,
      timestamp: Date.now(),
      metadata: {
        role: invite.properties.role,
        invitedBy: invite.properties.inviterId,
      },
    });

    return { success: true, orgId: invite.properties.orgId };
  },
});
```

### 4. Check User Permissions

```typescript
// convex/queries/organizations.ts
import { v } from 'convex/values';
import { query } from '../_generated/server';

export const checkPermission = query({
  args: {
    userId: v.id('entities'),
    orgId: v.id('entities'),
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get user entity (check for platform_owner role)
    const user = await ctx.db.get(args.userId);
    if (user?.properties.role === 'platform_owner') {
      return true; // Platform owner has all permissions everywhere
    }

    // 2. Get membership connection
    const membership = await ctx.db
      .query('connections')
      .withIndex('from_type', (q) =>
        q.eq('fromEntityId', args.userId).eq('relationshipType', 'member_of')
      )
      .filter((q) => q.eq(q.field('toEntityId'), args.orgId))
      .first();

    if (!membership) {
      return false; // Not a member
    }

    // 3. Check permissions
    const permissions = membership.metadata?.permissions || [];
    return permissions.includes('*') || permissions.includes(args.permission);
  },
});

export const getUserRole = query({
  args: {
    userId: v.id('entities'),
    orgId: v.id('entities'),
  },
  handler: async (ctx, args) => {
    // Check for platform_owner first
    const user = await ctx.db.get(args.userId);
    if (user?.properties.role === 'platform_owner') {
      return 'platform_owner';
    }

    // Get membership
    const membership = await ctx.db
      .query('connections')
      .withIndex('from_type', (q) =>
        q.eq('fromEntityId', args.userId).eq('relationshipType', 'member_of')
      )
      .filter((q) => q.eq(q.field('toEntityId'), args.orgId))
      .first();

    return membership?.metadata?.role || null;
  },
});
```

### 5. List Organization Members

```typescript
// convex/queries/organizations.ts
export const listMembers = query({
  args: {
    orgId: v.id('entities'),
  },
  handler: async (ctx, args) => {
    // 1. Get all member_of connections for this org
    const memberships = await ctx.db
      .query('connections')
      .withIndex('to_type', (q) =>
        q.eq('toEntityId', args.orgId).eq('relationshipType', 'member_of')
      )
      .collect();

    // 2. Get user entities
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.fromEntityId);
        return {
          userId: membership.fromEntityId,
          name: user?.name,
          email: user?.properties.email,
          role: membership.metadata?.role,
          permissions: membership.metadata?.permissions,
          joinedAt: membership.metadata?.joinedAt,
          invitedBy: membership.metadata?.invitedBy,
        };
      })
    );

    return members;
  },
});
```

---

## Multi-Tenant Dashboard Routing

### Dashboard Access Matrix

| Role              | Dashboard Route           | Access Level                          |
|-------------------|---------------------------|---------------------------------------|
| `platform_owner`  | `/admin/dashboard`        | All orgs, global analytics, revenue   |
| `org_owner`       | `/org/:slug/dashboard`    | Full org control, billing, users      |
| `org_user`        | `/org/:slug/dashboard`    | Limited by permissions                |
| `customer`        | `/dashboard`              | Personal resources only               |

### Route Protection Pattern

```typescript
// src/middleware/auth.ts
import { defineMiddleware } from 'astro:middleware';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export const onRequest = defineMiddleware(async (context, next) => {
  const session = context.locals.session;
  if (!session) {
    return context.redirect('/login');
  }

  const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
  const user = await convex.query(api.queries.users.get, { id: session.userId });

  // Platform owner can access anything
  if (user.properties.role === 'platform_owner') {
    context.locals.role = 'platform_owner';
    return next();
  }

  // Extract org slug from URL
  const orgSlug = context.params.org;
  if (!orgSlug) {
    // Customer accessing personal dashboard
    context.locals.role = 'customer';
    return next();
  }

  // Get organization
  const org = await convex.query(api.queries.organizations.getBySlug, {
    slug: orgSlug,
  });

  if (!org) {
    return context.redirect('/404');
  }

  // Check membership
  const role = await convex.query(api.queries.organizations.getUserRole, {
    userId: session.userId,
    orgId: org._id,
  });

  if (!role) {
    return context.redirect('/forbidden');
  }

  // Set context
  context.locals.role = role;
  context.locals.org = org;

  return next();
});
```

### Frontend Permission Checks

```typescript
// src/components/admin/PermissionGate.tsx
import { useOrganization } from '@/lib/organization-context';

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission } = useOrganization();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage
<PermissionGate permission="manage_billing">
  <BillingSettings />
</PermissionGate>
```

---

## Event Tracking

### Organization Events

```typescript
// User invited
{
  type: 'user_invited_to_org',
  actorId: inviterId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    invitedEmail: 'user@example.com',
    role: 'org_user',
    inviteToken: 'inv_xyz',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }
}

// User joined
{
  type: 'user_joined_org',
  actorId: userId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    role: 'org_user',
    invitedBy: inviterId,
  }
}

// User removed
{
  type: 'user_removed_from_org',
  actorId: adminId,
  targetId: organizationId,
  timestamp: Date.now(),
  metadata: {
    removedUserId: userId,
    reason: 'voluntary_leave',
  }
}

// Role updated
{
  type: 'user_role_updated',
  actorId: adminId,
  targetId: userId,
  timestamp: Date.now(),
  metadata: {
    orgId: organizationId,
    oldRole: 'org_user',
    newRole: 'org_owner',
  }
}
```

### Community Events

```typescript
// User followed creator
{
  type: 'content_event',
  actorId: audienceMemberId,
  targetId: creatorId,
  timestamp: Date.now(),
  metadata: {
    action: 'followed',
    source: 'website',
  }
}

// User joined community
{
  type: 'community_joined',
  actorId: userId,
  targetId: communityId,
  timestamp: Date.now(),
  metadata: {
    source: 'invitation',
  }
}

// Moderator assigned
{
  type: 'moderator_assigned',
  actorId: adminId,
  targetId: communityId,
  timestamp: Date.now(),
  metadata: {
    moderatorUserId: userId,
    permissions: ['delete_messages', 'ban_users'],
  }
}
```

---

## Query Patterns

### Get User's Organizations

```typescript
export const getUserOrganizations = query({
  args: { userId: v.id('entities') },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('connections')
      .withIndex('from_type', (q) =>
        q.eq('fromEntityId', args.userId).eq('relationshipType', 'member_of')
      )
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.toEntityId);
        return {
          ...org,
          role: membership.metadata?.role,
          permissions: membership.metadata?.permissions,
        };
      })
    );

    return organizations.filter(Boolean);
  },
});
```

### Get Organization Members by Role

```typescript
export const getMembersByRole = query({
  args: {
    orgId: v.id('entities'),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('connections')
      .withIndex('to_type', (q) =>
        q.eq('toEntityId', args.orgId).eq('relationshipType', 'member_of')
      )
      .filter((q) => q.eq(q.field('metadata.role'), args.role))
      .collect();

    const members = await Promise.all(
      memberships.map((m) => ctx.db.get(m.fromEntityId))
    );

    return members.filter(Boolean);
  },
});
```

### Check Multi-Org Membership

```typescript
export const isMultiOrgUser = query({
  args: { userId: v.id('entities') },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('connections')
      .withIndex('from_type', (q) =>
        q.eq('fromEntityId', args.userId).eq('relationshipType', 'member_of')
      )
      .collect();

    return memberships.length > 1;
  },
});
```

---

## Best Practices

### 1. Always Check Role Before Creating Connections

```typescript
// ✅ Good: Verify inviter has permission
const inviterMembership = await ctx.db
  .query('connections')
  .withIndex('from_type', (q) =>
    q.eq('fromEntityId', inviterId).eq('relationshipType', 'member_of')
  )
  .filter((q) => q.eq(q.field('toEntityId'), orgId))
  .first();

if (inviterMembership?.metadata?.role !== 'org_owner') {
  throw new Error('Insufficient permissions');
}

// ❌ Bad: No permission check
await ctx.db.insert('connections', { ... });
```

### 2. Use Specific Permissions, Not Just Roles

```typescript
// ✅ Good: Check specific permission
const hasPermission =
  permissions.includes('*') || permissions.includes('manage_users');

// ❌ Bad: Check role directly in business logic
if (role === 'org_owner') { ... }
```

### 3. Log All Membership Changes

```typescript
// ✅ Good: Log every membership event
await ctx.db.insert('events', {
  type: 'user_joined_org',
  actorId: userId,
  targetId: orgId,
  timestamp: Date.now(),
  metadata: { role, invitedBy },
});

// ❌ Bad: Silent membership changes
await ctx.db.insert('connections', { ... });
```

### 4. Support Multi-Organization Users

```typescript
// ✅ Good: Users can be members of multiple orgs
const orgs = await getUserOrganizations({ userId });
const currentOrg = orgs.find(o => o._id === currentOrgId);

// ❌ Bad: Assume one org per user
const org = await getOrganization({ userId });
```

---

## Migration from Legacy Systems

### Step 1: Create Organization Entities

```typescript
const defaultOrg = await ctx.db.insert('entities', {
  type: 'organization',
  name: 'Default Organization',
  properties: { slug: 'default' },
  status: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

### Step 2: Create Membership Connections

```typescript
const users = await ctx.db.query('users').collect();

for (const user of users) {
  await ctx.db.insert('connections', {
    fromEntityId: user._id,
    toEntityId: defaultOrg,
    relationshipType: 'member_of',
    metadata: {
      role: user.isAdmin ? 'org_owner' : 'org_user',
      permissions: user.isAdmin ? ['*'] : ['create_content'],
      joinedAt: user.createdAt,
    },
    createdAt: Date.now(),
  });
}
```

### Step 3: Update Queries to Filter by Organization

```typescript
// Before: Global query
const content = await ctx.db.query('entities')
  .withIndex('by_type', q => q.eq('type', 'blog_post'))
  .collect();

// After: Org-scoped query
const orgContent = await ctx.db.query('connections')
  .withIndex('from_type', q =>
    q.eq('fromEntityId', orgId).eq('relationshipType', 'owns')
  )
  .collect();

const content = await Promise.all(
  orgContent.map(c => ctx.db.get(c.toEntityId))
);
```

---

## Summary

**Membership connections** are the foundation of ONE Platform's multi-tenant architecture:

✅ **Organization membership** with role-based permissions
✅ **Creator following** for audience engagement
✅ **Community moderation** with granular permissions
✅ **Event participation** tracking
✅ **Multi-org support** for complex workflows
✅ **Permission-based UI rendering** in frontend
✅ **Invitation flows** with email verification
✅ **Dashboard routing** based on role context

**Key Takeaway:** Use connection metadata to store rich membership context (roles, permissions, invitation history) while keeping the ontology clean and scalable.

---

**Related Documentation:**
- [Ontology.md](../ontology.md) - Complete 4-table specification
- [Multitenant.md](../multitenant.md) - Multi-tenant architecture patterns
- [Owner.md](../things/owner.md) - Platform owner role and revenue tracking
- [Organisation.md](../things/organisation.md) - Organization entity details
