# ONE Platform API Documentation (OpenAPI 3.1.0)

**Version:** 1.0.0
**Last Updated:** 2025-01-15
**Base URL:** `https://your-deployment.convex.cloud`

This document provides complete API documentation for the ONE platform using OpenAPI 3.1.0 specification format.

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
   - [Authentication & User Management](#authentication--user-management)
   - [Entity Operations](#entity-operations)
   - [Connection Operations](#connection-operations)
   - [Event Operations](#event-operations)
   - [Tag Operations](#tag-operations)
3. [Schemas](#schemas)
4. [Error Responses](#error-responses)

---

## OpenAPI Specification

```yaml
openapi: 3.1.0
info:
  title: ONE Platform API
  version: 1.0.0
  description: |
    Complete API for the ONE platform - Creator Economy Platform with AI Clones,
    Token Economics, and Multi-Chain Support.

    ## Architecture
    - **Backend**: Convex (real-time, edge-deployed)
    - **Authentication**: Better Auth with OAuth (GitHub, Google)
    - **Database**: 4-table ontology (entities, connections, events, tags)
    - **Blockchain**: Multi-chain support (Sui, Base, Solana)

    ## Authentication
    All endpoints (except auth endpoints) require a session token in the request.
    Pass the token via query parameter: `?token=your_session_token`

  contact:
    name: ONE Platform Support
    url: https://one.ie
    email: support@one.ie
  license:
    name: Proprietary

servers:
  - url: https://your-deployment.convex.cloud
    description: Production Convex Deployment
  - url: http://localhost:3000
    description: Local Development

tags:
  - name: Authentication
    description: User authentication and session management
  - name: Users
    description: User profile and settings
  - name: Entities
    description: Entity CRUD operations (46 entity types)
  - name: Connections
    description: Relationship management (25 connection types)
  - name: Events
    description: Event logging and history (35 event types)
  - name: Tags
    description: Taxonomy and categorization
  - name: AI Clones
    description: AI clone creation and management
  - name: Tokens
    description: Creator token operations
  - name: Courses
    description: Course creation and enrollment
  - name: Content
    description: Content management and generation
  - name: Analytics
    description: Metrics and insights

paths:
  # ============================================================================
  # AUTHENTICATION ENDPOINTS
  # ============================================================================

  /auth/signUp:
    post:
      tags:
        - Authentication
      summary: Create a new user account
      operationId: signUp
      description: |
        Register a new user with email and password. Optionally sends
        email verification link.

        **Rate Limit:** 3 requests per hour per email
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  format: password
                  minLength: 8
                  example: SecurePass123!
                name:
                  type: string
                  example: John Doe
                sendVerificationEmail:
                  type: boolean
                  default: false
                  description: Send email verification link
                baseUrl:
                  type: string
                  format: uri
                  example: https://one.ie
                  description: Base URL for verification link (required if sendVerificationEmail=true)
      responses:
        '200':
          description: User created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                    description: Session token (valid for 30 days)
                    example: a1b2c3d4e5f6...
                  userId:
                    type: string
                    description: Convex ID of created user
                    example: k17abc123def456
        '400':
          $ref: '#/components/responses/BadRequest'
        '429':
          $ref: '#/components/responses/RateLimitExceeded'
        '500':
          $ref: '#/components/responses/InternalError'

  /auth/signIn:
    post:
      tags:
        - Authentication
      summary: Sign in with email and password
      operationId: signIn
      description: |
        Authenticate user and create session.

        **Rate Limit:** 5 requests per 15 minutes per email
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  format: password
                  example: SecurePass123!
      responses:
        '200':
          description: Signed in successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                    description: Session token (valid for 30 days)
                  userId:
                    type: string
                    description: Convex ID of user
        '400':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '429':
          $ref: '#/components/responses/RateLimitExceeded'

  /auth/signOut:
    post:
      tags:
        - Authentication
      summary: Sign out and invalidate session
      operationId: signOut
      security:
        - sessionToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
              properties:
                token:
                  type: string
                  description: Session token to invalidate
      responses:
        '200':
          description: Signed out successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true

  /auth/signInWithOAuth:
    post:
      tags:
        - Authentication
      summary: Sign in with OAuth provider
      operationId: signInWithOAuth
      description: |
        Authenticate user via OAuth (GitHub, Google). Creates user if doesn't exist.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - provider
                - email
                - providerId
              properties:
                provider:
                  type: string
                  enum: [github, google]
                  example: github
                email:
                  type: string
                  format: email
                  example: user@example.com
                name:
                  type: string
                  example: John Doe
                providerId:
                  type: string
                  description: OAuth provider's user ID
                  example: github_12345
      responses:
        '200':
          description: Signed in successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  userId:
                    type: string

  /auth/getCurrentUser:
    get:
      tags:
        - Authentication
      summary: Get current authenticated user
      operationId: getCurrentUser
      security:
        - sessionToken: []
      parameters:
        - name: token
          in: query
          required: false
          schema:
            type: string
          description: Session token
      responses:
        '200':
          description: User details
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/CurrentUser'
                  - type: 'null'

  /auth/requestPasswordReset:
    post:
      tags:
        - Authentication
      summary: Request password reset link
      operationId: requestPasswordReset
      description: |
        Send password reset email with token. Returns success even if
        user doesn't exist (security).

        **Rate Limit:** 3 requests per hour per email
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - baseUrl
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                baseUrl:
                  type: string
                  format: uri
                  example: https://one.ie
                  description: Base URL for reset link
      responses:
        '200':
          description: Request processed (always returns success)
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
        '429':
          $ref: '#/components/responses/RateLimitExceeded'

  /auth/validateResetToken:
    get:
      tags:
        - Authentication
      summary: Check if password reset token is valid
      operationId: validateResetToken
      parameters:
        - name: token
          in: query
          required: true
          schema:
            type: string
          description: Password reset token
      responses:
        '200':
          description: Token validation result
          content:
            application/json:
              schema:
                type: object
                properties:
                  valid:
                    type: boolean
                    example: true

  /auth/resetPassword:
    post:
      tags:
        - Authentication
      summary: Reset password with token
      operationId: resetPassword
      description: |
        Reset user password using valid reset token. Invalidates all
        existing sessions.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
                - password
              properties:
                token:
                  type: string
                  description: Password reset token
                password:
                  type: string
                  format: password
                  minLength: 8
                  description: New password
      responses:
        '200':
          description: Password reset successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
        '400':
          description: Invalid or expired token

  /auth/verifyEmail:
    post:
      tags:
        - Authentication
      summary: Verify email with token
      operationId: verifyEmail
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
              properties:
                token:
                  type: string
                  description: Email verification token
      responses:
        '200':
          description: Email verified successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
        '400':
          description: Invalid or expired verification token

  /auth/isEmailVerified:
    get:
      tags:
        - Authentication
      summary: Check if user's email is verified
      operationId: isEmailVerified
      security:
        - sessionToken: []
      parameters:
        - name: token
          in: query
          required: false
          schema:
            type: string
          description: Session token
      responses:
        '200':
          description: Email verification status
          content:
            application/json:
              schema:
                type: object
                properties:
                  verified:
                    type: boolean
                    example: true

  /auth/requestMagicLink:
    post:
      tags:
        - Authentication
      summary: Request magic link for passwordless sign in
      operationId: requestMagicLink
      description: |
        Send magic link email for passwordless authentication.
        Link expires in 15 minutes.

        **Rate Limit:** 3 requests per hour per email
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - baseUrl
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                baseUrl:
                  type: string
                  format: uri
                  example: https://one.ie
      responses:
        '200':
          description: Request processed
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
        '429':
          $ref: '#/components/responses/RateLimitExceeded'

  /auth/signInWithMagicLink:
    post:
      tags:
        - Authentication
      summary: Sign in with magic link token
      operationId: signInWithMagicLink
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
              properties:
                token:
                  type: string
                  description: Magic link token
      responses:
        '200':
          description: Signed in successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                    description: Session token
                  userId:
                    type: string
        '400':
          description: Invalid or expired magic link

  /auth/setup2FA:
    post:
      tags:
        - Authentication
      summary: Setup two-factor authentication
      operationId: setup2FA
      security:
        - sessionToken: []
      description: |
        Initialize 2FA setup. Returns TOTP secret and backup codes.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
              properties:
                token:
                  type: string
                  description: Session token
      responses:
        '200':
          description: 2FA setup initiated
          content:
            application/json:
              schema:
                type: object
                properties:
                  secret:
                    type: string
                    description: TOTP secret for authenticator app
                    example: JBSWY3DPEHPK3PXP
                  backupCodes:
                    type: array
                    items:
                      type: string
                    description: 10 backup codes
                    example: [A1B2C3D4, E5F6G7H8, ...]

  /auth/verify2FA:
    post:
      tags:
        - Authentication
      summary: Verify and enable 2FA
      operationId: verify2FA
      security:
        - sessionToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
              properties:
                token:
                  type: string
                  description: Session token
      responses:
        '200':
          description: 2FA enabled successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true

  /auth/disable2FA:
    post:
      tags:
        - Authentication
      summary: Disable two-factor authentication
      operationId: disable2FA
      security:
        - sessionToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - token
                - password
              properties:
                token:
                  type: string
                  description: Session token
                password:
                  type: string
                  format: password
                  description: User password for confirmation
      responses:
        '200':
          description: 2FA disabled successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true

  /auth/get2FAStatus:
    get:
      tags:
        - Authentication
      summary: Get 2FA status for current user
      operationId: get2FAStatus
      security:
        - sessionToken: []
      parameters:
        - name: token
          in: query
          required: false
          schema:
            type: string
          description: Session token
      responses:
        '200':
          description: 2FA status
          content:
            application/json:
              schema:
                type: object
                properties:
                  enabled:
                    type: boolean
                    description: Whether 2FA is currently enabled
                    example: true
                  hasSetup:
                    type: boolean
                    description: Whether 2FA has been set up (even if disabled)
                    example: true

  # ============================================================================
  # ENTITY ENDPOINTS
  # ============================================================================

  /entities/create:
    post:
      tags:
        - Entities
      summary: Create a new entity
      operationId: createEntity
      security:
        - sessionToken: []
      description: |
        Create any of the 46 entity types in the ONE platform.

        **Entity Types:**
        - Core: creator, ai_clone, audience_member
        - Business Agents: 10 types (strategy_agent, marketing_agent, etc.)
        - Content: 7 types (blog_post, video, podcast, etc.)
        - Products: 4 types (digital_product, membership, etc.)
        - And 22 more types...
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateEntityRequest'
            examples:
              creator:
                summary: Create a creator
                value:
                  type: creator
                  name: John Doe
                  properties:
                    email: john@example.com
                    username: johndoe
                    niche: [fitness, nutrition]
                    expertise: [training, coaching]
                    targetAudience: fitness enthusiasts
                  status: active
              token:
                summary: Create a token
                value:
                  type: token
                  name: JOHN Token
                  properties:
                    contractAddress: "0x1234..."
                    blockchain: sui
                    totalSupply: 1000000
                    price: 0.10
                  status: active
      responses:
        '200':
          description: Entity created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  entityId:
                    type: string
                    description: Convex ID of created entity
                    example: k17abc123def456
                  type:
                    type: string
                    example: creator
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /entities/get:
    get:
      tags:
        - Entities
      summary: Get entity by ID
      operationId: getEntity
      security:
        - sessionToken: []
      parameters:
        - name: id
          in: query
          required: true
          schema:
            type: string
          description: Entity ID
          example: k17abc123def456
      responses:
        '200':
          description: Entity details
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/Entity'
                  - type: 'null'

  /entities/list:
    get:
      tags:
        - Entities
      summary: List entities by type
      operationId: listEntities
      security:
        - sessionToken: []
      parameters:
        - name: type
          in: query
          required: true
          schema:
            $ref: '#/components/schemas/EntityType'
          description: Entity type to filter
        - name: status
          in: query
          required: false
          schema:
            type: string
            enum: [active, inactive, draft, published, archived]
          description: Filter by status
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          description: Maximum results to return
      responses:
        '200':
          description: List of entities
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Entity'

  /entities/update:
    post:
      tags:
        - Entities
      summary: Update entity
      operationId: updateEntity
      security:
        - sessionToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - id
              properties:
                id:
                  type: string
                  description: Entity ID
                name:
                  type: string
                  description: Updated name
                properties:
                  type: object
                  description: Updated properties (merged with existing)
                status:
                  type: string
                  enum: [active, inactive, draft, published, archived]
      responses:
        '200':
          description: Entity updated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true

  /entities/delete:
    post:
      tags:
        - Entities
      summary: Soft delete entity
      operationId: deleteEntity
      security:
        - sessionToken: []
      description: |
        Soft delete by setting deletedAt timestamp. Entity remains
        in database but is filtered from queries.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - id
              properties:
                id:
                  type: string
                  description: Entity ID
      responses:
        '200':
          description: Entity deleted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true

  # ============================================================================
  # CONNECTION ENDPOINTS
  # ============================================================================

  /connections/create:
    post:
      tags:
        - Connections
      summary: Create a connection between entities
      operationId: createConnection
      security:
        - sessionToken: []
      description: |
        Create relationship between two entities using one of 25 connection types.

        **Connection Types:**
        - Ownership: owns, created_by
        - AI: clone_of, trained_on, powers
        - Content: authored, generated_by, published_to, part_of, references
        - Community: member_of, following, moderates, participated_in
        - Business: manages, reports_to, collaborates_with, assigned_to
        - Token: holds_tokens, staked_in, earned_from
        - Product: purchased, enrolled_in, completed, teaching
        - And 6 more types...
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateConnectionRequest'
            examples:
              following:
                summary: User follows creator
                value:
                  fromEntityId: k17user123
                  toEntityId: k17creator456
                  relationshipType: following
              tokenHolding:
                summary: User holds tokens
                value:
                  fromEntityId: k17user123
                  toEntityId: k17token456
                  relationshipType: holds_tokens
                  metadata:
                    balance: 1000
                    blockchain: sui
      responses:
        '200':
          description: Connection created
          content:
            application/json:
              schema:
                type: object
                properties:
                  connectionId:
                    type: string
                    example: k17conn789

  /connections/get:
    get:
      tags:
        - Connections
      summary: Get connections for an entity
      operationId: getConnections
      security:
        - sessionToken: []
      parameters:
        - name: entityId
          in: query
          required: true
          schema:
            type: string
          description: Entity ID
        - name: direction
          in: query
          required: false
          schema:
            type: string
            enum: [from, to, both]
            default: both
          description: Connection direction
        - name: relationshipType
          in: query
          required: false
          schema:
            $ref: '#/components/schemas/ConnectionType'
          description: Filter by relationship type
      responses:
        '200':
          description: List of connections
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Connection'

  /connections/delete:
    post:
      tags:
        - Connections
      summary: Delete a connection
      operationId: deleteConnection
      security:
        - sessionToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - id
              properties:
                id:
                  type: string
                  description: Connection ID
      responses:
        '200':
          description: Connection deleted
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true

  # ============================================================================
  # EVENT ENDPOINTS
  # ============================================================================

  /events/log:
    post:
      tags:
        - Events
      summary: Log a new event
      operationId: logEvent
      security:
        - sessionToken: []
      description: |
        Log any of the 35 event types in the ONE platform.

        **Event Types:**
        - Creator: creator_created, creator_updated, content_uploaded
        - AI Clone: 5 types (clone_created, clone_interaction, etc.)
        - Agent: 4 types (agent_created, agent_executed, etc.)
        - Content: 2 consolidated types (content_changed, content_interacted)
        - Token: 7 types (token_deployed, tokens_purchased, etc.)
        - And 20 more types...
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LogEventRequest'
            examples:
              tokenPurchase:
                summary: Log token purchase
                value:
                  type: tokens_purchased
                  actorId: k17user123
                  targetId: k17token456
                  metadata:
                    amount: 100
                    usdAmount: 10
                    blockchain: sui
                    txHash: "0xabc..."
              contentView:
                summary: Log content view
                value:
                  type: content_interacted
                  actorId: k17user123
                  targetId: k17content456
                  metadata:
                    interactionType: viewed
                    duration: 120
                    source: feed
      responses:
        '200':
          description: Event logged
          content:
            application/json:
              schema:
                type: object
                properties:
                  eventId:
                    type: string
                    example: k17event789

  /events/getHistory:
    get:
      tags:
        - Events
      summary: Get event history
      operationId: getEventHistory
      security:
        - sessionToken: []
      parameters:
        - name: entityId
          in: query
          required: false
          schema:
            type: string
          description: Filter by target entity
        - name: actorId
          in: query
          required: false
          schema:
            type: string
          description: Filter by actor entity
        - name: type
          in: query
          required: false
          schema:
            $ref: '#/components/schemas/EventType'
          description: Filter by event type
        - name: startTime
          in: query
          required: false
          schema:
            type: integer
            format: int64
          description: Filter events after this timestamp
        - name: endTime
          in: query
          required: false
          schema:
            type: integer
            format: int64
          description: Filter events before this timestamp
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 1000
            default: 100
      responses:
        '200':
          description: Event history
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Event'

  # ============================================================================
  # TAG ENDPOINTS
  # ============================================================================

  /tags/create:
    post:
      tags:
        - Tags
      summary: Create a new tag
      operationId: createTag
      security:
        - sessionToken: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - entityId
                - key
                - value
              properties:
                entityId:
                  type: string
                  description: Entity to tag
                key:
                  type: string
                  description: Tag category
                  example: skill
                value:
                  type: string
                  description: Tag value
                  example: video-editing
      responses:
        '200':
          description: Tag created
          content:
            application/json:
              schema:
                type: object
                properties:
                  tagId:
                    type: string
                    example: k17tag123

  /tags/get:
    get:
      tags:
        - Tags
      summary: Get tags for an entity
      operationId: getTags
      security:
        - sessionToken: []
      parameters:
        - name: entityId
          in: query
          required: true
          schema:
            type: string
          description: Entity ID
        - name: key
          in: query
          required: false
          schema:
            type: string
          description: Filter by tag category
      responses:
        '200':
          description: Entity tags
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Tag'

  /tags/search:
    get:
      tags:
        - Tags
      summary: Search entities by tag
      operationId: searchByTag
      security:
        - sessionToken: []
      parameters:
        - name: key
          in: query
          required: true
          schema:
            type: string
          description: Tag category
          example: industry
        - name: value
          in: query
          required: true
          schema:
            type: string
          description: Tag value
          example: fitness
      responses:
        '200':
          description: Tagged entities
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Entity'

# ============================================================================
# COMPONENTS
# ============================================================================

components:
  securitySchemes:
    sessionToken:
      type: apiKey
      in: query
      name: token
      description: Session token obtained from sign in/sign up

  schemas:
    # ========================================================================
    # AUTHENTICATION SCHEMAS
    # ========================================================================

    CurrentUser:
      type: object
      properties:
        id:
          type: string
          description: User ID
          example: k17abc123def456
        email:
          type: string
          format: email
          example: user@example.com
        name:
          type: string
          example: John Doe

    # ========================================================================
    # ENTITY SCHEMAS
    # ========================================================================

    EntityType:
      type: string
      enum:
        # Core (3)
        - creator
        - ai_clone
        - audience_member
        # Business Agents (10)
        - strategy_agent
        - research_agent
        - marketing_agent
        - sales_agent
        - service_agent
        - design_agent
        - engineering_agent
        - finance_agent
        - legal_agent
        - intelligence_agent
        # Content (7)
        - blog_post
        - video
        - podcast
        - social_post
        - email
        - course
        - lesson
        # Products (4)
        - digital_product
        - membership
        - consultation
        - nft
        # Community (3)
        - community
        - conversation
        - message
        # Token (2)
        - token
        - token_contract
        # Knowledge (2)
        - knowledge_item
        - embedding
        # Platform (6)
        - website
        - landing_page
        - template
        - livestream
        - recording
        - media_asset
        # Business (7)
        - payment
        - subscription
        - invoice
        - metric
        - insight
        - prediction
        - report
        # Marketing (5)
        - notification
        - email_campaign
        - announcement
        - referral
        - campaign
        - lead

    Entity:
      type: object
      required:
        - _id
        - type
        - name
        - createdAt
        - updatedAt
      properties:
        _id:
          type: string
          description: Convex entity ID
          example: k17abc123def456
        type:
          $ref: '#/components/schemas/EntityType'
        name:
          type: string
          description: Display name
          example: John Doe
        properties:
          type: object
          description: Type-specific properties (JSON)
          additionalProperties: true
        status:
          type: string
          enum: [active, inactive, draft, published, archived]
          example: active
        createdAt:
          type: integer
          format: int64
          description: Unix timestamp (ms)
          example: 1705334400000
        updatedAt:
          type: integer
          format: int64
          description: Unix timestamp (ms)
          example: 1705420800000
        deletedAt:
          type: integer
          format: int64
          description: Soft delete timestamp (if deleted)
          nullable: true

    CreateEntityRequest:
      type: object
      required:
        - type
        - name
      properties:
        type:
          $ref: '#/components/schemas/EntityType'
        name:
          type: string
          minLength: 1
          maxLength: 255
        properties:
          type: object
          description: Type-specific properties
          additionalProperties: true
          default: {}
        status:
          type: string
          enum: [active, inactive, draft, published, archived]
          default: active

    # ========================================================================
    # CONNECTION SCHEMAS
    # ========================================================================

    ConnectionType:
      type: string
      enum:
        # Ownership (2)
        - owns
        - created_by
        # AI (3)
        - clone_of
        - trained_on
        - powers
        # Content (5)
        - authored
        - generated_by
        - published_to
        - part_of
        - references
        # Community (4)
        - member_of
        - following
        - moderates
        - participated_in
        # Business (4)
        - manages
        - reports_to
        - collaborates_with
        - assigned_to
        # Token (3)
        - holds_tokens
        - staked_in
        - earned_from
        # Product (4)
        - purchased
        - enrolled_in
        - completed
        - teaching
        # Consolidated (3)
        - transacted
        - referred
        - notified
        # Media (2)
        - featured_in
        - hosted_on
        # Analytics (3)
        - analyzed_by
        - optimized_by
        - influences

    Connection:
      type: object
      required:
        - _id
        - fromEntityId
        - toEntityId
        - relationshipType
        - createdAt
      properties:
        _id:
          type: string
          description: Connection ID
          example: k17conn789
        fromEntityId:
          type: string
          description: Source entity ID
          example: k17abc123
        toEntityId:
          type: string
          description: Target entity ID
          example: k17def456
        relationshipType:
          $ref: '#/components/schemas/ConnectionType'
        metadata:
          type: object
          description: Relationship-specific data
          additionalProperties: true
          nullable: true
        createdAt:
          type: integer
          format: int64
          description: Unix timestamp (ms)
        deletedAt:
          type: integer
          format: int64
          nullable: true

    CreateConnectionRequest:
      type: object
      required:
        - fromEntityId
        - toEntityId
        - relationshipType
      properties:
        fromEntityId:
          type: string
          description: Source entity ID
        toEntityId:
          type: string
          description: Target entity ID
        relationshipType:
          $ref: '#/components/schemas/ConnectionType'
        metadata:
          type: object
          description: Optional relationship data
          additionalProperties: true

    # ========================================================================
    # EVENT SCHEMAS
    # ========================================================================

    EventType:
      type: string
      enum:
        # Creator (3)
        - creator_created
        - creator_updated
        - content_uploaded
        # AI Clone (5)
        - clone_created
        - clone_interaction
        - clone_generated_content
        - voice_cloned
        - appearance_cloned
        # Agent (4)
        - agent_created
        - agent_executed
        - agent_completed
        - agent_failed
        # Content (2 consolidated)
        - content_changed
        - content_interacted
        # Audience (4)
        - user_joined
        - user_engaged
        - ugc_created
        - comment_posted
        # Course (5)
        - course_created
        - course_enrolled
        - lesson_completed
        - course_completed
        - certificate_earned
        # Token (7)
        - token_deployed
        - tokens_purchased
        - tokens_earned
        - tokens_burned
        - tokens_staked
        - tokens_unstaked
        - governance_vote
        # Business (3)
        - revenue_generated
        - cost_incurred
        - referral_made
        # Growth (4)
        - viral_share
        - referral_converted
        - achievement_unlocked
        - level_up
        # Analytics (5)
        - metric_calculated
        - insight_generated
        - prediction_made
        - optimization_applied
        - report_generated
        # Consolidated (6)
        - payment_processed
        - subscription_updated
        - livestream_status_changed
        - livestream_interaction
        - notification_delivered
        - referral_activity
        - lead_captured

    Event:
      type: object
      required:
        - _id
        - type
        - actorId
        - timestamp
        - metadata
      properties:
        _id:
          type: string
          description: Event ID
          example: k17event789
        type:
          $ref: '#/components/schemas/EventType'
        actorId:
          type: string
          description: Entity that caused the event
          example: k17user123
        targetId:
          type: string
          description: Optional target entity
          nullable: true
          example: k17content456
        timestamp:
          type: integer
          format: int64
          description: Unix timestamp (ms)
          example: 1705334400000
        metadata:
          type: object
          description: Event-specific data
          additionalProperties: true

    LogEventRequest:
      type: object
      required:
        - type
        - actorId
      properties:
        type:
          $ref: '#/components/schemas/EventType'
        actorId:
          type: string
          description: Entity causing the event
        targetId:
          type: string
          description: Optional target entity
          nullable: true
        metadata:
          type: object
          description: Event-specific data
          additionalProperties: true
          default: {}

    # ========================================================================
    # TAG SCHEMAS
    # ========================================================================

    Tag:
      type: object
      required:
        - _id
        - entityId
        - key
        - value
      properties:
        _id:
          type: string
          description: Tag ID
          example: k17tag123
        entityId:
          type: string
          description: Tagged entity ID
          example: k17entity456
        key:
          type: string
          description: Tag category
          example: industry
        value:
          type: string
          description: Tag value
          example: fitness

    # ========================================================================
    # ERROR SCHEMAS
    # ========================================================================

    Error:
      type: object
      required:
        - message
      properties:
        message:
          type: string
          description: Error message
          example: Invalid email or password
        code:
          type: string
          description: Error code
          example: AUTH_FAILED
        details:
          type: object
          description: Additional error details
          additionalProperties: true

  responses:
    BadRequest:
      description: Bad request - invalid parameters
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: Invalid request parameters
            code: BAD_REQUEST

    Unauthorized:
      description: Unauthorized - invalid or missing session token
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: Invalid or expired session token
            code: UNAUTHORIZED

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: Entity not found
            code: NOT_FOUND

    RateLimitExceeded:
      description: Rate limit exceeded
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: Too many requests. Please try again later.
            code: RATE_LIMIT_EXCEEDED

    InternalError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            message: An unexpected error occurred
            code: INTERNAL_ERROR
```

---

## Additional API Notes

### Rate Limiting

The following endpoints have rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/signUp` | 3 requests | 1 hour |
| `/auth/signIn` | 5 requests | 15 minutes |
| `/auth/requestPasswordReset` | 3 requests | 1 hour |
| `/auth/requestMagicLink` | 3 requests | 1 hour |

Rate limits are per email address for authentication endpoints.

### Session Management

- Session tokens are valid for **30 days**
- Tokens are returned in authentication responses
- Pass tokens via query parameter: `?token=your_session_token`
- Sessions are automatically cleaned up on expiration
- Password reset invalidates all existing sessions

### Convex Real-Time Updates

All query endpoints support **real-time subscriptions** when using Convex client libraries:

```typescript
// React example
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const entity = useQuery(api.entities.get, { id: "k17abc123" });
// Automatically updates when entity changes
```

### Error Handling

All endpoints follow consistent error response format:

```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

Common error codes:
- `AUTH_FAILED` - Authentication failed
- `UNAUTHORIZED` - Invalid/expired session token
- `BAD_REQUEST` - Invalid parameters
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

### Pagination

For large result sets, use the `limit` parameter:

```
GET /entities/list?type=creator&limit=50
```

Default limits:
- Entity lists: 20 items
- Event history: 100 items
- Maximum allowed: 1000 items per request

For more results, implement pagination using timestamps or IDs.

### Multi-Chain Support

Token-related endpoints support multiple blockchains:

**Supported Chains:**
- `sui` - Sui blockchain (Move language)
- `base` - Base L2 (Coinbase, EVM-compatible)
- `solana` - Solana blockchain (high-speed)

Specify blockchain in entity properties or connection metadata:

```json
{
  "type": "token",
  "name": "CREATOR Token",
  "properties": {
    "blockchain": "sui",
    "contractAddress": "0x..."
  }
}
```

---

## Webhook Events (Future)

The following events will be available via webhooks in future releases:

- `entity.created`
- `entity.updated`
- `entity.deleted`
- `connection.created`
- `connection.deleted`
- `event.logged`
- `payment.completed`
- `subscription.updated`

---

**API Version:** 1.0.0
**Last Updated:** 2025-01-15
**Maintained By:** ONE Platform Team

**See Also:**
- `API.md` - Complete API reference with code examples
- `Ontology.md` - 4-table ontology specification
- `Schema.md` - Convex schema details
- `AGENTS.md` - Convex development guide
