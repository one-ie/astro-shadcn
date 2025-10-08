# ONE Platform - File System Map

**Version:** 1.0.0  
**Last Updated:** 2025-01-15  
**Purpose:** Exact location for every file type - AI agents use this to know where to place generated code

---

## How AI Agents Use This Map

**Before creating ANY file:**
1. Find the file type in this map
2. Use the exact path shown
3. Follow naming conventions precisely
4. Update this map if creating new directories

**Never:**
- Create files in random locations
- Invent new directory structures
- Use different naming conventions
- Skip updating this map

---

## Complete Directory Tree

```
one/
│
├── .ai/                                    # AI AGENT CONTEXT (never commit secrets)
│   ├── agents/                             # Agent specifications
│   │   ├── frontend-agent.md               # Astro/React specialist
│   │   ├── backend-agent.md                # Convex/Effect.ts specialist
│   │   ├── auth-agent.md                   # Auth specialist
│   │   ├── blockchain-agent.md             # Web3 specialist
│   │   ├── ai-ml-agent.md                  # AI/ML specialist
│   │   └── ingestor-agent.md               # Migration specialist
│   │
│   ├── context/                            # System context
│   │   ├── ontology.md                     # ✅ CREATED - 4-table data model
│   │   ├── architecture.md                 # ✅ CREATED - System design + FP
│   │   ├── patterns.md                     # ✅ CREATED - Code patterns
│   │   ├── file-map.md                     # ✅ THIS FILE
│   │   └── dependencies.md                 # Package versions & APIs
│   │
│   ├── specs/                              # Feature specifications
│   │   ├── auth-flow.md                    # Authentication system
│   │   ├── ai-clone-creation.md            # AI clone pipeline
│   │   ├── token-economics.md              # Token system
│   │   ├── elevate-journey.md              # ELEVATE workflow
│   │   ├── content-generation.md           # Content automation
│   │   ├── viral-loops.md                  # Growth mechanisms
│   │   ├── course-builder.md               # AI course generation
│   │   └── analytics-dashboard.md          # Analytics & insights
│   │
│   ├── prompts/                            # Reusable prompts
│   │   ├── new-feature.md                  # Feature creation template
│   │   ├── fix-bug.md                      # Bug fixing workflow
│   │   ├── refactor.md                     # Refactoring guide
│   │   ├── test-generation.md              # Test creation
│   │   └── documentation.md                # Doc generation
│   │
│   └── rules.md                            # ✅ CREATED - Golden rules
│
├── docs/                                   # HUMAN DOCUMENTATION
│   │
│   ├── # CORE DOCUMENTATION
│   ├── Strategy.md                         # ✅ Platform vision & business strategy
│   ├── Ontology.md                         # ✅ 4-table data model (25 connections, 35 events)
│   ├── Architecture.md                     # ✅ Technical architecture & FP patterns
│   ├── Rules.md                            # ✅ Golden rules for development
│   ├── Patterns.md                         # ✅ Code patterns & best practices
│   ├── Files.md                            # ✅ THIS FILE - File system map
│   ├── Workflow.md                         # ✅ Ontology-driven development flow
│   ├── Documentation-Map.md                # ✅ Visual map of how all docs work together
│   │
│   ├── # DSL DOCUMENTATION
│   ├── DSL.md                              # ✅ DSL overview & introduction
│   ├── ONE DSL.md                          # ✅ Technical DSL (JSON-like, 25+35 types)
│   ├── ONE DSL English.md                  # ✅ Plain English DSL (compiles to Technical)
│   │
│   ├── # PROTOCOL DOCUMENTATION
│   ├── README-Protocols.md                 # ✅ Protocol overview
│   ├── A2A.md                              # ✅ Agent-to-Agent protocol
│   ├── ACP.md                              # ✅ Agentic Commerce Protocol
│   ├── AP2.md                              # ✅ Agent Payments Protocol (mandates)
│   ├── ACPayments.md                       # ✅ Agentic Commerce Payments
│   ├── X402.md                             # ✅ HTTP Micropayments (402 status)
│   ├── AGUI.md                             # ✅ Generative UI (CopilotKit)
│   │
│   ├── # INTEGRATION DOCUMENTATION
│   ├── ElizaOS.md                          # ✅ ElizaOS integration (external AI agents)
│   ├── CopilotKit.md                       # ✅ CopilotKit/AG-UI integration (generative UI)
│   ├── PromptKit.md                        # ✅ PromptKit integration (AI UI components)
│   ├── MCP.md                              # ✅ Model Context Protocol
│   ├── N8N.md                              # ✅ n8n workflow automation
│   ├── Agent-Communications.md             # ✅ Agent communication patterns
│   │
│   ├── # IMPLEMENTATION GUIDES
│   ├── Implementation.md                   # ✅ Implementation patterns
│   ├── Implementation Examples.md          # ✅ Code examples
│   ├── Specifications.md                   # ✅ Technical specifications
│   ├── Components.md                       # ✅ Convex components + Effect.ts integration
│   ├── Schema.md                           # ✅ Database schema details
│   │
│   ├── # SERVICE LAYER DOCUMENTATION
│   ├── Service Layer.md                    # ✅ Effect.ts service layer architecture
│   ├── Service Providers.md                # ✅ External service providers (OpenAI, ElevenLabs, Stripe, Blockchain)
│   ├── Service Providers - New.md          # ✅ New providers (D-ID, HeyGen, Uniswap, Alchemy, Twilio, AWS, Cloudflare Stream)
│   │
│   ├── # WORKFLOW & TOOLS
│   ├── Workflow Examples.md                # ✅ Development workflow examples
│   ├── CLI.md                              # ✅ CLI tool documentation
│   ├── CLI Code.md                         # ✅ CLI implementation
│   ├── CLI Compiler Code.md                # ✅ CLI compiler implementation
│   ├── Agent Ingestor.md                   # ✅ Migration agent documentation
│   │
│   ├── # DIAGRAMS & VISUALS
│   ├── Architecture Diagram.md             # ✅ Architecture visualizations
│   ├── Creator Diagram.md                  # ✅ Creator flow diagrams
│   │
│   ├── # API DOCUMENTATION
│   ├── API.md                              # ✅ API reference
│   ├── API-docs.md                         # ✅ Detailed API documentation
│   │
│   └── # MIGRATION & UPDATES
│       ├── OntologyUpdates.md              # ✅ Ontology evolution log
│       └── Effects Provider.md             # ✅ Effect.ts provider patterns (deprecated - see Service Layer.md)
│
├── src/                                    # FRONTEND SOURCE
│   │
│   ├── components/                         # React components
│   │   │
│   │   ├── ui/                             # shadcn/ui primitives (50+)
│   │   │   ├── button.tsx                  # Button component
│   │   │   ├── card.tsx                    # Card component
│   │   │   ├── dialog.tsx                  # Dialog/modal
│   │   │   ├── input.tsx                   # Input field
│   │   │   ├── label.tsx                   # Label
│   │   │   ├── select.tsx                  # Select dropdown
│   │   │   ├── checkbox.tsx                # Checkbox
│   │   │   ├── radio-group.tsx             # Radio buttons
│   │   │   ├── switch.tsx                  # Toggle switch
│   │   │   ├── slider.tsx                  # Slider
│   │   │   ├── progress.tsx                # Progress bar
│   │   │   ├── alert.tsx                   # Alert messages
│   │   │   ├── badge.tsx                   # Badge/tag
│   │   │   ├── avatar.tsx                  # Avatar image
│   │   │   ├── skeleton.tsx                # Loading skeleton
│   │   │   ├── toast.tsx                   # Toast notifications
│   │   │   ├── tooltip.tsx                 # Tooltips
│   │   │   ├── popover.tsx                 # Popover
│   │   │   ├── dropdown-menu.tsx           # Dropdown menu
│   │   │   ├── context-menu.tsx            # Context menu
│   │   │   ├── menubar.tsx                 # Menu bar
│   │   │   ├── navigation-menu.tsx         # Navigation
│   │   │   ├── breadcrumb.tsx              # Breadcrumbs
│   │   │   ├── tabs.tsx                    # Tab panels
│   │   │   ├── accordion.tsx               # Accordion
│   │   │   ├── collapsible.tsx             # Collapsible
│   │   │   ├── sheet.tsx                   # Side sheet
│   │   │   ├── drawer.tsx                  # Drawer
│   │   │   ├── hover-card.tsx              # Hover card
│   │   │   ├── table.tsx                   # Data table
│   │   │   ├── calendar.tsx                # Date picker
│   │   │   ├── command.tsx                 # Command palette
│   │   │   ├── separator.tsx               # Separator line
│   │   │   ├── scroll-area.tsx             # Scroll container
│   │   │   ├── textarea.tsx                # Text area
│   │   │   ├── form.tsx                    # Form wrapper
│   │   │   └── [more shadcn components]    # 50+ total
│   │   │
│   │   ├── prompt-kit/                     # 🤖 PROMPT KIT AI COMPONENTS
│   │   │   ├── # Chat Components
│   │   │   ├── message.tsx                 # AI message component
│   │   │   ├── prompt-input.tsx            # Auto-resize AI input
│   │   │   ├── chat-container.tsx          # Auto-scroll chat
│   │   │   ├── response-stream.tsx         # Streaming responses
│   │   │   │
│   │   │   ├── # Agent Components
│   │   │   ├── reasoning.tsx               # Show agent thinking
│   │   │   ├── tool.tsx                    # Display function calls
│   │   │   ├── agent-card.tsx              # Agent info card
│   │   │   │
│   │   │   ├── # Generative UI Components (CopilotKit-inspired)
│   │   │   ├── generative-ui-renderer.tsx  # Render agent UI messages
│   │   │   ├── dynamic-chart.tsx           # Agent-generated charts
│   │   │   ├── dynamic-table.tsx           # Agent-generated tables
│   │   │   ├── dynamic-form.tsx            # Agent-generated forms
│   │   │   ├── dynamic-card.tsx            # Agent-generated cards
│   │   │   │
│   │   │   ├── # Context Components
│   │   │   ├── context-provider.tsx        # AG-UI context sharing
│   │   │   ├── context-viewer.tsx          # View shared context
│   │   │   │
│   │   │   └── # Action Components
│   │   │       ├── action-trigger.tsx      # Human-in-the-loop actions
│   │   │       ├── action-approval.tsx     # Approve agent actions
│   │   │       └── multi-agent-panel.tsx   # Multi-agent coordination
│   │   │
│   │   └── features/                       # Feature-specific components
│   │       │
│   │       ├── auth/                       # 🔐 AUTHENTICATION
│   │       │   ├── SignInForm.tsx          # Sign in form
│   │       │   ├── SignUpForm.tsx          # Sign up form
│   │       │   ├── PasswordReset.tsx       # Password reset
│   │       │   ├── EmailVerification.tsx   # Email verify
│   │       │   ├── MagicLinkForm.tsx       # Magic link auth
│   │       │   ├── TwoFactorSetup.tsx      # 2FA setup
│   │       │   ├── TwoFactorVerify.tsx     # 2FA verify
│   │       │   ├── OAuthButtons.tsx        # OAuth buttons (GitHub, Google)
│   │       │   ├── SessionManager.tsx      # Session display
│   │       │   └── AuthGuard.tsx           # Auth wrapper
│   │       │
│   │       ├── creators/                   # 👤 CREATOR FEATURES
│   │       │   ├── CreatorOnboarding.tsx   # Multi-step onboarding
│   │       │   ├── CreatorProfile.tsx      # Public profile display
│   │       │   ├── CreatorDashboard.tsx    # Main dashboard
│   │       │   ├── CreatorWebsite.tsx      # Auto-generated website
│   │       │   ├── ContentUploader.tsx     # Upload videos/content
│   │       │   ├── SocialConnector.tsx     # Connect social accounts
│   │       │   ├── AICloneStatus.tsx       # Clone training status
│   │       │   ├── RevenueChart.tsx        # Revenue analytics
│   │       │   ├── AudienceInsights.tsx    # Audience analytics
│   │       │   ├── SettingsForm.tsx        # Settings
│   │       │   └── BrandCustomizer.tsx     # Brand colors/theme
│   │       │
│   │       ├── ai-clone/                   # 🤖 AI CLONE FEATURES (Feature #1)
│   │       │   ├── # Clone Creation
│   │       │   ├── CloneWizard.tsx         # Multi-step clone creation
│   │       │   ├── VideoUploader.tsx       # Upload training videos (3+ required)
│   │       │   ├── VoiceCloner.tsx         # Voice cloning interface
│   │       │   ├── AppearanceCloner.tsx    # Appearance cloning UI
│   │       │   ├── PersonalityBuilder.tsx  # Build personality from content
│   │       │   ├── TrainingProgress.tsx    # Training status & progress
│   │       │   ├── KnowledgeBaseManager.tsx # Manage RAG knowledge
│   │       │   │
│   │       │   ├── # Clone Interaction
│   │       │   ├── CloneChat.tsx           # Chat with AI clone
│   │       │   ├── CloneChatMessage.tsx    # Chat message component
│   │       │   ├── CloneVoiceChat.tsx      # Voice chat interface (future)
│   │       │   ├── CloneVideoCall.tsx      # Video call with clone (future)
│   │       │   ├── VoicePlayer.tsx         # Voice playback
│   │       │   ├── CloneEmbed.tsx          # Embeddable clone widget
│   │       │   │
│   │       │   ├── # Clone Management
│   │       │   ├── CloneEditor.tsx         # Edit clone settings
│   │       │   ├── PersonalityEditor.tsx   # Edit personality traits
│   │       │   ├── ResponseEditor.tsx      # Edit common responses
│   │       │   ├── CloneAnalytics.tsx      # Clone usage analytics
│   │       │   └── CloneSettings.tsx       # Clone configuration
│   │       │
│   │       ├── tokens/                     # 💰 TOKEN ECONOMY (Feature #8)
│   │       │   ├── # Token Purchase
│   │       │   ├── TokenPurchase.tsx       # Buy tokens UI
│   │       │   ├── TokenCheckout.tsx       # Checkout flow
│   │       │   ├── PaymentMethods.tsx      # Payment options (Stripe, crypto)
│   │       │   ├── PurchaseConfirm.tsx     # Confirm purchase
│   │       │   │
│   │       │   ├── # Token Display
│   │       │   ├── TokenBalance.tsx        # Balance display
│   │       │   ├── TokenChart.tsx          # Price chart
│   │       │   ├── TokenStats.tsx          # Token statistics
│   │       │   ├── TokenHolders.tsx        # Holder leaderboard
│   │       │   ├── TransactionHistory.tsx  # TX history
│   │       │   │
│   │       │   ├── # Token Staking
│   │       │   ├── StakingInterface.tsx    # Stake tokens UI
│   │       │   ├── StakingRewards.tsx      # Rewards display
│   │       │   ├── UnstakeModal.tsx        # Unstake flow
│   │       │   │
│   │       │   ├── # Token Economics
│   │       │   ├── TokenLaunchWizard.tsx   # Launch creator token
│   │       │   ├── TokenomicsConfig.tsx    # Configure economics
│   │       │   ├── BurnMechanism.tsx       # Burn display/trigger
│   │       │   ├── RewardCalculator.tsx    # Reward estimation
│   │       │   └── TokenGovernance.tsx     # Governance voting
│   │       │
│   │       ├── courses/                    # 📚 AI-POWERED LMS (Feature #5)
│   │       │   ├── # Course Creation
│   │       │   ├── CourseWizard.tsx        # AI-assisted course builder
│   │       │   ├── CourseOutlineGen.tsx    # AI outline generation
│   │       │   ├── LessonBuilder.tsx       # Build single lesson
│   │       │   ├── QuizBuilder.tsx         # Build quizzes
│   │       │   ├── AssignmentBuilder.tsx   # Build assignments
│   │       │   ├── CertificateDesigner.tsx # Design certificates
│   │       │   │
│   │       │   ├── # Course Display
│   │       │   ├── CourseCatalog.tsx       # Browse courses
│   │       │   ├── CourseCard.tsx          # Course card
│   │       │   ├── CourseDetail.tsx        # Course details
│   │       │   ├── EnrollmentButton.tsx    # Enroll with tokens
│   │       │   │
│   │       │   ├── # Learning Experience
│   │       │   ├── LessonPlayer.tsx        # Watch/read lesson
│   │       │   ├── VideoPlayer.tsx         # Video lessons
│   │       │   ├── InteractiveLecture.tsx  # Interactive content
│   │       │   ├── QuizInterface.tsx       # Take quiz
│   │       │   ├── AssignmentSubmit.tsx    # Submit assignment
│   │       │   ├── AITutor.tsx             # AI clone teaches
│   │       │   ├── ProgressTracker.tsx     # Progress bar
│   │       │   ├── GamificationBadges.tsx  # Achievements
│   │       │   ├── CertificateDisplay.tsx  # Earned certificate
│   │       │   └── NextLessonSuggest.tsx   # AI suggestions
│   │       │
│   │       ├── community/                  # 💬 LIVING COMMUNITY (Feature #6)
│   │       │   ├── # Messaging
│   │       │   ├── MessageList.tsx         # Message feed
│   │       │   ├── MessageComposer.tsx     # Compose message
│   │       │   ├── MessageItem.tsx         # Single message
│   │       │   ├── ThreadView.tsx          # Message threads
│   │       │   ├── DirectMessages.tsx      # DMs
│   │       │   ├── CloneResponses.tsx      # AI clone replies
│   │       │   │
│   │       │   ├── # Members
│   │       │   ├── MemberList.tsx          # All members
│   │       │   ├── MemberCard.tsx          # Member card
│   │       │   ├── MemberProfile.tsx       # Member profile
│   │       │   ├── FollowersList.tsx       # Followers
│   │       │   ├── TopContributors.tsx     # Leaderboard
│   │       │   │
│   │       │   ├── # Activity
│   │       │   ├── ActivityFeed.tsx        # Real-time feed
│   │       │   ├── LiveEvents.tsx          # Live events
│   │       │   ├── Polls.tsx               # Community polls
│   │       │   ├── QandA.tsx               # Q&A forum
│   │       │   ├── Announcements.tsx       # Creator announcements
│   │       │   │
│   │       │   ├── # Moderation
│   │       │   ├── ModerationQueue.tsx     # Moderation queue
│   │       │   ├── ReportContent.tsx       # Report system
│   │       │   ├── BanUser.tsx             # Ban/mute users
│   │       │   └── AIModeration.tsx        # AI moderation
│   │       │
│   │       ├── elevate/                    # 🚀 ELEVATE JOURNEY (9 Steps)
│   │       │   ├── JourneyMap.tsx          # Full journey map
│   │       │   ├── StepCard.tsx            # Single step card
│   │       │   ├── ProgressRing.tsx        # Progress visualization
│   │       │   ├── AchievementBadge.tsx    # Achievement badges
│   │       │   │
│   │       │   ├── # Step Components
│   │       │   ├── Step1Hook.tsx           # Hook: Business analysis
│   │       │   ├── Step2Gift.tsx           # Gift: Free insights
│   │       │   ├── Step3Identify.tsx       # Identify: €100 payment
│   │       │   ├── Step4Engage.tsx         # Engage: Workshop access
│   │       │   ├── Step5Ascend.tsx         # Ascend: Advanced training
│   │       │   ├── Step6Deliver.tsx        # Deliver: Implementation
│   │       │   ├── Step7Nurture.tsx        # Nurture: Ongoing support
│   │       │   ├── Step8Refer.tsx          # Refer: Referral program
│   │       │   ├── Step9Rebuild.tsx        # Rebuild: Optimization
│   │       │   │
│   │       │   ├── PaymentGate.tsx         # Payment checkpoint
│   │       │   ├── WaitingRoom.tsx         # Timed waiting
│   │       │   └── CompletionCert.tsx      # Journey completion
│   │       │
│   │       ├── content/                    # 📝 CONTENT AUTOMATION (Feature #2)
│   │       │   ├── # Content Creation
│   │       │   ├── ContentWizard.tsx       # AI content generation wizard
│   │       │   ├── ContentEditor.tsx       # Edit content
│   │       │   ├── AIWriter.tsx            # AI writing assistant
│   │       │   ├── ContentScheduler.tsx    # Schedule posts
│   │       │   ├── CalendarView.tsx        # Content calendar
│   │       │   │
│   │       │   ├── # Content Display
│   │       │   ├── ContentGrid.tsx         # Content grid
│   │       │   ├── ContentCard.tsx         # Content card
│   │       │   ├── ContentPreview.tsx      # Preview
│   │       │   ├── ContentStats.tsx        # Performance stats
│   │       │   │
│   │       │   ├── # Social Distribution
│   │       │   ├── SocialPublisher.tsx     # Publish to all platforms
│   │       │   ├── PlatformSelector.tsx    # Select platforms
│   │       │   ├── PostCustomizer.tsx      # Customize per platform
│   │       │   ├── HashtagSuggest.tsx      # AI hashtag suggestions
│   │       │   │
│   │       │   ├── # Content Templates
│   │       │   ├── TemplateLibrary.tsx     # Content templates
│   │       │   ├── TemplateEditor.tsx      # Edit templates
│   │       │   └── BrandGuidelines.tsx     # Brand consistency
│   │       │
│   │       ├── ugc/                        # 🎨 USER-GENERATED CONTENT (Feature #4)
│   │       │   ├── UGCCreator.tsx          # Create UGC with AI
│   │       │   ├── UGCGallery.tsx          # Browse UGC
│   │       │   ├── UGCCard.tsx             # UGC display card
│   │       │   ├── ShareUGC.tsx            # Share UGC (earn tokens)
│   │       │   ├── UGCRewards.tsx          # Token rewards for UGC
│   │       │   ├── FeaturedUGC.tsx         # Featured content
│   │       │   ├── UGCModeration.tsx       # Moderate UGC
│   │       │   └── ViralTracker.tsx        # Track viral spread
│   │       │
│   │       ├── livestream/                 # 📹 LIVESTREAM (AI + Human Mix)
│   │       │   ├── LivestreamStudio.tsx    # Livestream control room
│   │       │   ├── StreamPlayer.tsx        # Watch stream
│   │       │   ├── ChatOverlay.tsx         # Live chat
│   │       │   ├── CloneMixer.tsx          # Mix AI clone + human
│   │       │   ├── DonationWidget.tsx      # Donations (tokens)
│   │       │   ├── ViewerList.tsx          # Live viewers
│   │       │   ├── StreamSchedule.tsx      # Schedule streams
│   │       │   └── StreamAnalytics.tsx     # Stream stats
│   │       │
│   │       ├── analytics/                  # 📊 ANALYTICS & BUSINESS OS (Feature #7)
│   │       │   ├── # Dashboard
│   │       │   ├── AnalyticsDashboard.tsx  # Main dashboard
│   │       │   ├── MetricCard.tsx          # Metric display
│   │       │   ├── KPIOverview.tsx         # Key metrics
│   │       │   │
│   │       │   ├── # Charts
│   │       │   ├── GrowthChart.tsx         # Growth over time
│   │       │   ├── RevenueChart.tsx        # Revenue analytics
│   │       │   ├── TokenChart.tsx          # Token metrics
│   │       │   ├── EngagementChart.tsx     # Engagement metrics
│   │       │   ├── FunnelVisualization.tsx # Conversion funnel
│   │       │   │
│   │       │   ├── # Insights
│   │       │   ├── AIInsights.tsx          # AI-generated insights
│   │       │   ├── PredictionsPanel.tsx    # AI predictions
│   │       │   ├── RecommendationsPanel.tsx # AI recommendations
│   │       │   ├── AnomalyDetection.tsx    # Detect anomalies
│   │       │   │
│   │       │   ├── # Reports
│   │       │   ├── ReportBuilder.tsx       # Build custom reports
│   │       │   ├── ExportReports.tsx       # Export data
│   │       │   ├── ScheduledReports.tsx    # Auto-send reports
│   │       │   │
│   │       │   └── # Real-time
│   │       │       ├── RealtimeFeed.tsx    # Live activity feed
│   │       │       └── AlertsPanel.tsx     # Important alerts
│   │       │
│   │       ├── viral/                      # 🔥 VIRAL MECHANICS
│   │       │   ├── ShareRewards.tsx        # Share to earn tokens
│   │       │   ├── ReferralDashboard.tsx   # Referral tracking
│   │       │   ├── ViralLoop.tsx           # Viral loop mechanics
│   │       │   ├── SocialProof.tsx         # Success stories
│   │       │   ├── Leaderboard.tsx         # Top referrers
│   │       │   └── InviteFlow.tsx          # Invite friends
│   │       │
│   │       ├── wallet/                     # 👛 WALLET & CRYPTO
│   │       │   ├── WalletConnect.tsx       # Connect wallet
│   │       │   ├── WalletDisplay.tsx       # Show balances
│   │       │   ├── TransactionList.tsx     # TX history
│   │       │   ├── SendTokens.tsx          # Send tokens
│   │       │   ├── ReceiveTokens.tsx       # Receive QR
│   │       │   └── SwapTokens.tsx          # Swap tokens (DEX)
│   │       │
│   │       └── notifications/              # 🔔 NOTIFICATIONS
│   │           ├── NotificationCenter.tsx  # All notifications
│   │           ├── NotificationBell.tsx    # Bell icon + badge
│   │           ├── NotificationItem.tsx    # Single notification
│   │           ├── EmailPreferences.tsx    # Email settings
│   │           ├── PushSettings.tsx        # Push notification settings
│   │           └── InAppNotif.tsx          # In-app toasts
│   │
│   ├── layouts/                            # Astro layouts
│   │   ├── Layout.astro                    # Base layout
│   │   ├── Dashboard.astro                 # Dashboard layout
│   │   ├── Marketing.astro                 # Marketing layout
│   │   └── Auth.astro                      # Auth layout
│   │
│   ├── pages/                              # 📄 ASTRO PAGES (File-based routing)
│   │   │
│   │   │   # ═══════════════════════════════════════════════════════════════════
│   │   │   # PAGES ORGANIZED BY THE 8 CORE PLATFORM FEATURES
│   │   │   # Based on Strategy.md vision - complete creator operating system
│   │   │   # ═══════════════════════════════════════════════════════════════════
│   │   │
│   │   ├── # ═══ MARKETING & PUBLIC PAGES ═══
│   │   │
│   │   ├── index.astro                     # ✅ Marketing homepage (/)
│   │   ├── pricing.astro                   # Pricing page (/pricing)
│   │   ├── features.astro                  # Features overview (/features)
│   │   ├── about.astro                     # About page (/about)
│   │   ├── contact.astro                   # Contact page (/contact)
│   │   ├── demo.astro                      # Interactive demo (/demo)
│   │   ├── blog/                           # Blog section
│   │   │   ├── index.astro                 # Blog list (/blog)
│   │   │   └── [...slug].astro             # Blog post (/blog/[slug])
│   │   ├── legal/                          # Legal pages
│   │   │   ├── terms.astro                 # Terms of service (/legal/terms)
│   │   │   ├── privacy.astro               # Privacy policy (/legal/privacy)
│   │   │   └── cookies.astro               # Cookie policy (/legal/cookies)
│   │   ├── 404.astro                       # ✅ 404 page
│   │   ├── 500.astro                       # 500 error page
│   │   │
│   │   ├── # ═══ AUTHENTICATION & ONBOARDING ═══
│   │   │
│   │   ├── signin.astro                    # ✅ Sign in page (/signin)
│   │   ├── signup.astro                    # ✅ Sign up page (/signup)
│   │   ├── forgot-password.astro           # ✅ Forgot password (/forgot-password)
│   │   ├── reset-password.astro            # ✅ Reset password (/reset-password)
│   │   ├── verify-email.astro              # ✅ Email verification (/verify-email)
│   │   ├── request-magic-link.astro        # ✅ Magic link request (/request-magic-link)
│   │   ├── mail.astro                      # ✅ Magic link verify (/mail)
│   │   ├── onboard.astro                   # ✅ Creator onboarding (/onboard)
│   │   ├── auth/                           # Auth pages directory
│   │   │   ├── signin.astro                # ✅ Alt sign in (/auth/signin)
│   │   │   ├── signup.astro                # ✅ Alt sign up (/auth/signup)
│   │   │   └── verify-2fa.astro            # 2FA verification (/auth/verify-2fa)
│   │   │
│   │   ├── # ═══ CREATOR DASHBOARD & MANAGEMENT ═══
│   │   │
│   │   ├── dashboard.astro                 # ✅ Main dashboard (/dashboard)
│   │   ├── settings.astro                  # ✅ Settings (/settings)
│   │   │
│   │   ├── creator/                        # Creator-specific pages
│   │   │   ├── dashboard.astro             # Creator dashboard (/creator/dashboard)
│   │   │   ├── profile.astro               # Creator profile edit (/creator/profile)
│   │   │   ├── settings.astro              # Creator settings (/creator/settings)
│   │   │   ├── analytics.astro             # Analytics overview (/creator/analytics)
│   │   │   ├── revenue.astro               # Revenue dashboard (/creator/revenue)
│   │   │   │
│   │   │   ├── # Feature #1: AI Clone Management
│   │   │   ├── clone/
│   │   │   │   ├── index.astro             # Clone overview (/creator/clone)
│   │   │   │   ├── setup.astro             # Clone setup wizard (/creator/clone/setup)
│   │   │   │   ├── voice.astro             # Voice cloning (/creator/clone/voice)
│   │   │   │   ├── appearance.astro        # Appearance cloning (/creator/clone/appearance)
│   │   │   │   ├── personality.astro       # Personality config (/creator/clone/personality)
│   │   │   │   ├── training.astro          # Training status (/creator/clone/training)
│   │   │   │   ├── knowledge.astro         # Knowledge base (RAG) (/creator/clone/knowledge)
│   │   │   │   ├── test.astro              # Test clone chat (/creator/clone/test)
│   │   │   │   └── analytics.astro         # Clone analytics (/creator/clone/analytics)
│   │   │   │
│   │   │   ├── # Feature #2: Content Automation
│   │   │   ├── content/
│   │   │   │   ├── index.astro             # Content overview (/creator/content)
│   │   │   │   ├── create.astro            # Create content (/creator/content/create)
│   │   │   │   ├── generate.astro          # AI content gen (/creator/content/generate)
│   │   │   │   ├── calendar.astro          # Content calendar (/creator/content/calendar)
│   │   │   │   ├── schedule.astro          # Schedule posts (/creator/content/schedule)
│   │   │   │   ├── library.astro           # Content library (/creator/content/library)
│   │   │   │   ├── templates.astro         # Content templates (/creator/content/templates)
│   │   │   │   ├── analytics.astro         # Content analytics (/creator/content/analytics)
│   │   │   │   └── social.astro            # Social accounts (/creator/content/social)
│   │   │   │
│   │   │   ├── # Feature #3: Interactive Avatar (Livestream)
│   │   │   ├── livestream/
│   │   │   │   ├── index.astro             # Livestream overview (/creator/livestream)
│   │   │   │   ├── setup.astro             # Stream setup (/creator/livestream/setup)
│   │   │   │   ├── studio.astro            # Live studio (/creator/livestream/studio)
│   │   │   │   ├── mixer.astro             # AI+Human mixer (/creator/livestream/mixer)
│   │   │   │   ├── chat.astro              # Live chat mgmt (/creator/livestream/chat)
│   │   │   │   ├── recordings.astro        # Stream recordings (/creator/livestream/recordings)
│   │   │   │   └── analytics.astro         # Stream analytics (/creator/livestream/analytics)
│   │   │   │
│   │   │   ├── # Feature #5: AI-Powered LMS (Courses)
│   │   │   ├── courses/
│   │   │   │   ├── index.astro             # Courses overview (/creator/courses)
│   │   │   │   ├── create.astro            # Create course (/creator/courses/create)
│   │   │   │   ├── generate.astro          # AI course gen (/creator/courses/generate)
│   │   │   │   ├── builder/
│   │   │   │   │   └── [id].astro          # Course builder (/creator/courses/builder/[id])
│   │   │   │   ├── edit/
│   │   │   │   │   └── [id].astro          # Edit course (/creator/courses/edit/[id])
│   │   │   │   ├── students.astro          # Student mgmt (/creator/courses/students)
│   │   │   │   ├── analytics.astro         # Course analytics (/creator/courses/analytics)
│   │   │   │   └── certificates.astro      # Certificate mgmt (/creator/courses/certificates)
│   │   │   │
│   │   │   ├── # Feature #6: Living Community
│   │   │   ├── community/
│   │   │   │   ├── index.astro             # Community overview (/creator/community)
│   │   │   │   ├── members.astro           # Manage members (/creator/community/members)
│   │   │   │   ├── moderation.astro        # Moderation queue (/creator/community/moderation)
│   │   │   │   ├── channels.astro          # Manage channels (/creator/community/channels)
│   │   │   │   ├── events.astro            # Community events (/creator/community/events)
│   │   │   │   ├── analytics.astro         # Community analytics (/creator/community/analytics)
│   │   │   │   └── settings.astro          # Community settings (/creator/community/settings)
│   │   │   │
│   │   │   ├── # Feature #8: Token Economy
│   │   │   ├── token/
│   │   │   │   ├── index.astro             # Token overview (/creator/token)
│   │   │   │   ├── launch.astro            # Launch token wizard (/creator/token/launch)
│   │   │   │   ├── economics.astro         # Token economics config (/creator/token/economics)
│   │   │   │   ├── holders.astro           # Token holders (/creator/token/holders)
│   │   │   │   ├── distribution.astro      # Token distribution (/creator/token/distribution)
│   │   │   │   ├── staking.astro           # Staking config (/creator/token/staking)
│   │   │   │   ├── governance.astro        # Governance (/creator/token/governance)
│   │   │   │   ├── analytics.astro         # Token analytics (/creator/token/analytics)
│   │   │   │   └── transactions.astro      # Transaction history (/creator/token/transactions)
│   │   │   │
│   │   │   ├── # Feature #7: Business OS (10 AI Agents)
│   │   │   ├── agents/
│   │   │   │   ├── index.astro             # Agents overview (/creator/agents)
│   │   │   │   ├── ceo.astro               # Strategy agent (/creator/agents/ceo)
│   │   │   │   ├── cmo.astro               # Marketing agent (/creator/agents/cmo)
│   │   │   │   ├── cso.astro               # Sales agent (/creator/agents/cso)
│   │   │   │   ├── cxo.astro               # Service agent (/creator/agents/cxo)
│   │   │   │   ├── cdo.astro               # Design agent (/creator/agents/cdo)
│   │   │   │   ├── cto.astro               # Engineering agent (/creator/agents/cto)
│   │   │   │   ├── cfo.astro               # Finance agent (/creator/agents/cfo)
│   │   │   │   ├── clo.astro               # Legal agent (/creator/agents/clo)
│   │   │   │   ├── cio.astro               # Intelligence agent (/creator/agents/cio)
│   │   │   │   └── analytics.astro         # Analytics agent (/creator/agents/analytics)
│   │   │   │
│   │   │   ├── # Feature #4: UGC Engine
│   │   │   ├── ugc/
│   │   │   │   ├── index.astro             # UGC overview (/creator/ugc)
│   │   │   │   ├── templates.astro         # UGC templates (/creator/ugc/templates)
│   │   │   │   ├── submissions.astro       # Review submissions (/creator/ugc/submissions)
│   │   │   │   ├── featured.astro          # Featured UGC (/creator/ugc/featured)
│   │   │   │   ├── rewards.astro           # UGC rewards config (/creator/ugc/rewards)
│   │   │   │   └── analytics.astro         # UGC analytics (/creator/ugc/analytics)
│   │   │   │
│   │   │   ├── # Viral Growth
│   │   │   ├── growth/
│   │   │   │   ├── index.astro             # Growth overview (/creator/growth)
│   │   │   │   ├── referrals.astro         # Referral program (/creator/growth/referrals)
│   │   │   │   ├── viral.astro             # Viral loops config (/creator/growth/viral)
│   │   │   │   ├── incentives.astro        # Growth incentives (/creator/growth/incentives)
│   │   │   │   └── analytics.astro         # Growth analytics (/creator/growth/analytics)
│   │   │   │
│   │   │   └── # ELEVATE Journey
│   │   │       ├── elevate/
│   │   │           ├── index.astro         # ELEVATE overview (/creator/elevate)
│   │   │           ├── journey.astro       # Journey editor (/creator/elevate/journey)
│   │   │           ├── steps.astro         # Step config (/creator/elevate/steps)
│   │   │           ├── participants.astro  # Journey participants (/creator/elevate/participants)
│   │   │           └── analytics.astro     # Journey analytics (/creator/elevate/analytics)
│   │   │
│   │   ├── # ═══ PUBLIC CREATOR PROFILES ═══
│   │   │
│   │   ├── [username]/                     # Public creator profile (dynamic route)
│   │   │   ├── index.astro                 # Creator homepage (/[username])
│   │   │   ├── about.astro                 # About creator (/[username]/about)
│   │   │   ├── content.astro               # Content gallery (/[username]/content)
│   │   │   ├── courses.astro               # Courses catalog (/[username]/courses)
│   │   │   ├── community.astro             # Join community (/[username]/community)
│   │   │   ├── token.astro                 # Buy token (/[username]/token)
│   │   │   └── chat.astro                  # Chat with AI clone (/[username]/chat)
│   │   │
│   │   ├── # ═══ FAN/AUDIENCE EXPERIENCE ═══
│   │   │
│   │   ├── chat/                           # Chat with AI clones
│   │   │   ├── index.astro                 # Chat overview (/chat)
│   │   │   └── [cloneId].astro             # Chat with clone (/chat/[cloneId])
│   │   │
│   │   ├── courses/                        # Course marketplace & learning
│   │   │   ├── index.astro                 # Browse courses (/courses)
│   │   │   ├── [id].astro                  # Course details (/courses/[id])
│   │   │   ├── enroll/
│   │   │   │   └── [id].astro              # Enroll in course (/courses/enroll/[id])
│   │   │   ├── learn/
│   │   │   │   └── [id].astro              # Take course (/courses/learn/[id])
│   │   │   ├── my-courses.astro            # My enrolled courses (/courses/my-courses)
│   │   │   ├── progress.astro              # Learning progress (/courses/progress)
│   │   │   └── certificates.astro          # My certificates (/courses/certificates)
│   │   │
│   │   ├── community/                      # Community features
│   │   │   ├── index.astro                 # Community home (/community)
│   │   │   ├── [creatorId]/                # Creator community
│   │   │   │   ├── index.astro             # Community feed (/community/[creatorId])
│   │   │   │   ├── channels/
│   │   │   │   │   └── [channelId].astro   # Channel view (/community/[creatorId]/channels/[channelId])
│   │   │   │   ├── events.astro            # Community events (/community/[creatorId]/events)
│   │   │   │   └── members.astro           # Community members (/community/[creatorId]/members)
│   │   │   └── my-communities.astro        # My communities (/community/my-communities)
│   │   │
│   │   ├── tokens/                         # Token marketplace
│   │   │   ├── index.astro                 # Token marketplace (/tokens)
│   │   │   ├── [symbol]/                   # Token details
│   │   │   │   ├── index.astro             # Token overview (/tokens/[symbol])
│   │   │   │   ├── buy.astro               # Buy token (/tokens/[symbol]/buy)
│   │   │   │   ├── stake.astro             # Stake tokens (/tokens/[symbol]/stake)
│   │   │   │   ├── chart.astro             # Price chart (/tokens/[symbol]/chart)
│   │   │   │   └── holders.astro           # Token holders (/tokens/[symbol]/holders)
│   │   │   ├── portfolio.astro             # My token portfolio (/tokens/portfolio)
│   │   │   ├── wallet.astro                # Wallet mgmt (/tokens/wallet)
│   │   │   └── transactions.astro          # Transaction history (/tokens/transactions)
│   │   │
│   │   ├── ugc/                            # User-generated content
│   │   │   ├── index.astro                 # UGC gallery (/ugc)
│   │   │   ├── create.astro                # Create UGC (/ugc/create)
│   │   │   ├── my-content.astro            # My UGC (/ugc/my-content)
│   │   │   ├── rewards.astro               # UGC rewards (/ugc/rewards)
│   │   │   └── [id].astro                  # View UGC (/ugc/[id])
│   │   │
│   │   ├── livestream/                     # Livestream viewing
│   │   │   ├── index.astro                 # Browse streams (/livestream)
│   │   │   ├── [streamId].astro            # Watch stream (/livestream/[streamId])
│   │   │   └── schedule.astro              # Stream schedule (/livestream/schedule)
│   │   │
│   │   ├── elevate/                        # ELEVATE journey (fan experience)
│   │   │   ├── index.astro                 # ELEVATE overview (/elevate)
│   │   │   ├── join.astro                  # Join journey (/elevate/join)
│   │   │   ├── journey/
│   │   │   │   └── [id].astro              # Journey progress (/elevate/journey/[id])
│   │   │   └── completed.astro             # Completed journeys (/elevate/completed)
│   │   │
│   │   ├── wallet/                         # Wallet & crypto
│   │   │   ├── index.astro                 # Wallet overview (/wallet)
│   │   │   ├── connect.astro               # Connect wallet (/wallet/connect)
│   │   │   ├── balance.astro               # Token balances (/wallet/balance)
│   │   │   ├── send.astro                  # Send tokens (/wallet/send)
│   │   │   ├── receive.astro               # Receive tokens (/wallet/receive)
│   │   │   └── history.astro               # Transaction history (/wallet/history)
│   │   │
│   │   ├── notifications/                  # Notifications
│   │   │   ├── index.astro                 # All notifications (/notifications)
│   │   │   └── settings.astro              # Notification settings (/notifications/settings)
│   │   │
│   │   └── # ═══ API ROUTES ═══
│   │       │
│   │       └── api/                        # API endpoints
│   │           ├── auth/
│   │           │   └── [...all].ts         # ✅ Better Auth handler
│   │           ├── trpc/
│   │           │   └── [trpc].ts           # tRPC endpoint (if using)
│   │           ├── webhooks/
│   │           │   ├── stripe.ts           # Stripe webhooks
│   │           │   ├── coinbase.ts         # Coinbase webhooks
│   │           │   └── resend.ts           # Resend webhooks
│   │           └── convex/
│   │               └── sync.ts             # Convex sync endpoint
│   │
│   ├── lib/                                # Frontend utilities
│   │   ├── auth-client.ts                  # Better Auth client
│   │   ├── convex-client.ts                # Convex setup
│   │   ├── utils.ts                        # cn() + helpers
│   │   ├── hooks.ts                        # Custom hooks
│   │   ├── validators.ts                   # Zod schemas
│   │   └── constants.ts                    # Constants
│   │
│   ├── styles/                             # Styles
│   │   ├── global.css                      # Global + Tailwind
│   │   └── themes/
│   │       ├── light.css                   # Light theme vars
│   │       └── dark.css                    # Dark theme vars
│   │
│   └── types/                              # Frontend types
│       ├── index.ts                        # Shared types
│       ├── entities.ts                     # Entity types
│       ├── auth.ts                         # Auth types
│       └── api.ts                          # API types
│
├── convex/                                 # 🔷 CONVEX BACKEND (Effect.ts-Powered Architecture)
│   │
│   │   # ═══════════════════════════════════════════════════════════════════════════════
│   │   # EFFECT.TS ARCHITECTURE: How Effect.ts Covers the Entire Application
│   │   # ═══════════════════════════════════════════════════════════════════════════════
│   │   #
│   │   # The ONE Platform uses Effect.ts as the CORE architecture pattern. Here's how:
│   │   #
│   │   # 📊 THREE-LAYER ARCHITECTURE:
│   │   #
│   │   # Layer 1: CONVEX API (Thin Wrappers)
│   │   # ├── mutations/  → Write operations (user-facing API)
│   │   # ├── queries/    → Read operations (user-facing API)
│   │   # └── actions/    → External calls (user-facing API)
│   │   #
│   │   # Layer 2: EFFECT.TS SERVICES (Business Logic - 100% of app logic lives here)
│   │   # ├── core/        → Database, Auth, Storage, Cache, Queue
│   │   # ├── ai/          → AI Clone, Content Gen, Chat, RAG
│   │   # ├── business/    → 10 AI C-Suite Agents (CEO, CMO, CFO, etc.)
│   │   # ├── community/   → Messages, Moderation, Engagement
│   │   # ├── tokens/      → Purchase, Staking, Economics, Governance
│   │   # ├── courses/     → Builder, Generation, Progress, Gamification
│   │   # ├── content/     → Creation, Automation, Distribution
│   │   # ├── ugc/         → UGC creation, rewards, viral mechanics
│   │   # ├── livestream/  → Streaming, AI+Human mixing, chat, donations
│   │   # ├── elevate/     → 9-step journey orchestration
│   │   # ├── analytics/   → Metrics, Insights, Predictions, Reports
│   │   # ├── viral/       → Referrals, Share-to-earn, Viral loops
│   │   # ├── entities/    → CRUD for all 56 entity types
│   │   # ├── connections/ → Manage 25 connection types
│   │   # ├── events/      → Log, track, replay 35 event types
│   │   # └── protocols/   → A2A, ACP, AP2, X402, AG-UI, MCP integration
│   │   #
│   │   # Layer 3: EXTERNAL PROVIDERS (Effect.ts Wrappers - 26 providers)
│   │   # ├── AI/LLM (5)       → OpenAI, Anthropic, ElevenLabs, D-ID, HeyGen
│   │   # ├── Blockchain (4)   → Base, Alchemy, Uniswap, WalletConnect
│   │   # ├── Payment (2)      → Stripe (fiat), Coinbase (crypto)
│   │   # ├── Communication (4) → Resend, SendGrid, Twilio, Pusher
│   │   # ├── Media/Storage (2) → AWS S3, Cloudflare Stream
│   │   # ├── Integration (3)   → ElizaOS, CopilotKit, n8n
│   │   # └── Social Media (6)  → Twitter, Instagram, YouTube, TikTok, LinkedIn, Facebook
│   │   #
│   │   # 🎯 EFFECT.TS BENEFITS:
│   │   #
│   │   # 1. Type-Safe Errors:
│   │   #    - NO try/catch blocks
│   │   #    - Every error is typed (InsufficientContentError, VoiceCloneFailedError, etc.)
│   │   #    - Pattern matching on error types
│   │   #
│   │   # 2. Dependency Injection:
│   │   #    - Services declare their dependencies explicitly
│   │   #    - Easy to mock for testing (MockAICloneService, MockStripeProvider, etc.)
│   │   #    - Compose services into larger workflows
│   │   #
│   │   # 3. Composability:
│   │   #    - Services combine like LEGO blocks
│   │   #    - Parallel execution: Effect.all([...], { concurrency: 5 })
│   │   #    - Sequential execution: Effect.gen chaining
│   │   #    - Retries, timeouts, circuit breakers built-in
│   │   #
│   │   # 4. Platform Agnostic:
│   │   #    - Services are pure functions (no Convex-specific code)
│   │   #    - Can run in: Convex, Node.js, Cloudflare Workers, Deno, Bun
│   │   #    - Easy to migrate if needed
│   │   #
│   │   # 5. Testability:
│   │   #    - Mock any dependency
│   │   #    - Test services in isolation
│   │   #    - Integration tests compose real services
│   │   #
│   │   # 6. Observability:
│   │   #    - Built-in logging: Effect.logInfo, Effect.logError
│   │   #    - Tracing: Effect.withSpan for distributed tracing
│   │   #    - Metrics: Track execution time, errors, retries
│   │   #
│   │   # 🔄 EXECUTION FLOW EXAMPLE (Token Purchase):
│   │   #
│   │   # 1. User clicks "Buy 100 Tokens"
│   │   # 2. Frontend calls: useMutation(api.tokens.purchase)
│   │   # 3. Convex mutation validates args
│   │   # 4. Mutation calls: TokenService.purchaseTokens(...)
│   │   # 5. TokenService orchestrates:
│   │   #    a) Charge payment (StripeProvider)
│   │   #    b) Mint tokens (BaseProvider)
│   │   #    c) Update balance (ConvexDatabase)
│   │   #    d) Log event (EventService)
│   │   # 6. All operations atomic (succeed together or fail together)
│   │   # 7. Automatic rollback on error
│   │   # 8. Return result to user
│   │   #
│   │   # 📚 KEY PRINCIPLES:
│   │   #
│   │   # - ALL business logic in services/ (100% Effect.ts)
│   │   # - Convex functions are THIN WRAPPERS (validate → call service → return)
│   │   # - NO business logic in mutations/queries/actions
│   │   # - Services are pure, testable, composable
│   │   # - Explicit types everywhere (no `any`, typed errors)
│   │   #
│   │   # ═══════════════════════════════════════════════════════════════════════════════
│   │   # STATUS: PLANNED (not yet implemented - this is the blueprint)
│   │   # ═══════════════════════════════════════════════════════════════════════════════
│   │
│   ├── schema/                             # 📊 DATABASE SCHEMA (PLANNED)
│   │   ├── index.ts                        # Main schema export (TODO)
│   │   ├── entities.ts                     # Entities table definition (TODO)
│   │   ├── connections.ts                  # Connections table definition (TODO)
│   │   ├── events.ts                       # Events table definition (TODO)
│   │   ├── tags.ts                         # Tags table definitions (TODO)
│   │   └── types.ts                        # Property type definitions (TODO)
│   │
│   ├── services/                           # 🎯 EFFECT.TS SERVICES (PLANNED - Core Architecture)
│   │   │
│   │   │   # ═══════════════════════════════════════════════════════════
│   │   │   # EFFECT.TS SERVICE LAYER OVERVIEW
│   │   │   # ═══════════════════════════════════════════════════════════
│   │   │   # This is the CORE of the ONE Platform architecture.
│   │   │   # ALL business logic lives here as pure Effect.ts services.
│   │   │   # Convex functions are THIN WRAPPERS that call these services.
│   │   │   #
│   │   │   # Pattern (REPLICATE EXACTLY):
│   │   │   #
│   │   │   # export class ServiceName extends Effect.Service<ServiceName>()(
│   │   │   #   "ServiceName",
│   │   │   #   {
│   │   │   #     effect: Effect.gen(function* () {
│   │   │   #       const db = yield* ConvexDatabase;
│   │   │   #       const provider = yield* ExternalProvider;
│   │   │   #
│   │   │   #       return {
│   │   │   #         operation: (args) => Effect.gen(function* () {
│   │   │   #           // Pure functional logic
│   │   │   #           // Explicit error handling
│   │   │   #           // Composable operations
│   │   │   #         })
│   │   │   #       };
│   │   │   #     }),
│   │   │   #     dependencies: [ConvexDatabase.Default, Provider.Default]
│   │   │   #   }
│   │   │   # ) {}
│   │   │   #
│   │   │   # Benefits:
│   │   │   # - Pure functions (testable)
│   │   │   # - Typed errors (no exceptions)
│   │   │   # - Dependency injection (composable)
│   │   │   # - Platform agnostic (can run anywhere)
│   │   │   # ═══════════════════════════════════════════════════════════
│   │   │
│   │   ├── index.ts                        # Service exports + MainLayer composition (TODO)
│   │   │
│   │   ├── core/                           # 🔧 CORE INFRASTRUCTURE SERVICES
│   │   │   │
│   │   │   │   # Database, Auth, Storage, Cache, Queue - foundational services
│   │   │   │   # These provide the base layer for all other services
│   │   │   │
│   │   │   ├── database.ts                 # ConvexDatabase service (CRUD, queries, transactions)
│   │   │   ├── auth.ts                     # Auth service (Better Auth wrapper, session mgmt)
│   │   │   ├── storage.ts                  # File storage service (R2/S3 integration)
│   │   │   ├── cache.ts                    # Caching layer service (Redis-like operations)
│   │   │   └── queue.ts                    # Job queue service (background tasks)
│   │   │
│   │   ├── ai/                             # 🤖 AI SERVICES (Feature #1 - AI Clone Technology)
│   │   │   │
│   │   │   │   # AI Clone Creation, Training, and Interaction Services
│   │   │   │   # Depends on: OpenAI, Anthropic, ElevenLabs, D-ID, HeyGen providers
│   │   │   │
│   │   │   ├── clone.ts                    # AI clone orchestration (create, train, deploy)
│   │   │   ├── voice-clone.ts              # Voice cloning via ElevenLabs (3+ samples)
│   │   │   ├── appearance-clone.ts         # Appearance cloning via D-ID/HeyGen
│   │   │   ├── personality.ts              # Personality extraction from creator content
│   │   │   ├── rag.ts                      # RAG knowledge base (embeddings + vector search)
│   │   │   ├── training.ts                 # Clone training pipeline (async workflows)
│   │   │   │
│   │   │   │   # Content Generation Services (Feature #2)
│   │   │   │
│   │   │   ├── content-generation.ts       # AI content creation (GPT-4, Claude)
│   │   │   ├── content-strategy.ts         # Content strategy planning
│   │   │   ├── social-optimization.ts      # Social media post optimization
│   │   │   ├── hashtag-generation.ts       # AI hashtag suggestions
│   │   │   │
│   │   │   │   # Conversational AI Services
│   │   │   │
│   │   │   ├── chat.ts                     # Chat interactions with AI clone
│   │   │   ├── context-manager.ts          # Conversation context tracking
│   │   │   └── response-generation.ts      # Streaming response generation
│   │   │
│   │   ├── business/                       # 💼 BUSINESS AGENTS SERVICES (10 AI C-Suite Agents)
│   │   │   │
│   │   │   │   # Autonomous AI agents that run a creator's entire business
│   │   │   │   # Each agent has specialized expertise and can collaborate
│   │   │   │   # Depends on: Convex Agent component, OpenAI, Anthropic
│   │   │   │
│   │   │   ├── orchestrator.ts             # Multi-agent orchestration & coordination
│   │   │   ├── strategy.ts                 # Strategy Agent (CEO) - vision, goals, OKRs
│   │   │   ├── marketing.ts                # Marketing Agent (CMO) - campaigns, SEO, brand
│   │   │   ├── sales.ts                    # Sales Agent (CSO) - funnels, conversion, follow-up
│   │   │   ├── service.ts                  # Service Agent (CXO) - customer success, support
│   │   │   ├── design.ts                   # Design Agent (CDO) - branding, assets, UX
│   │   │   ├── engineering.ts              # Engineering Agent (CTO) - automation, optimization
│   │   │   ├── finance.ts                  # Finance Agent (CFO) - revenue, forecasting, costs
│   │   │   ├── legal.ts                    # Legal Agent (CLO) - compliance, contracts, IP
│   │   │   ├── intelligence.ts             # Intelligence Agent (CIO) - analytics, insights
│   │   │   └── analytics.ts                # Analytics Agent - data analysis, reporting
│   │   │
│   │   ├── community/                      # 💬 COMMUNITY SERVICES (Feature #6 - Living Community)
│   │   │   │
│   │   │   │   # Real-time community features with AI clone participation
│   │   │   │   # Depends on: Pusher (real-time), OpenAI (moderation)
│   │   │   │
│   │   │   ├── messages.ts                 # Message handling (create, edit, delete, reactions)
│   │   │   ├── moderation.ts               # AI + human moderation (content filtering)
│   │   │   ├── engagement.ts               # Engagement tracking (likes, shares, comments)
│   │   │   ├── notifications.ts            # Notification dispatch (push, email, in-app)
│   │   │   ├── threads.ts                  # Thread management (conversations, replies)
│   │   │   └── direct-messages.ts          # DM handling (private messaging)
│   │   │
│   │   ├── tokens/                         # 💰 TOKEN SERVICES (Feature #8 - Token Economy)
│   │   │   │
│   │   │   │   # Creator token economy - purchase, stake, govern, earn
│   │   │   │   # Depends on: Base blockchain, Uniswap, Stripe, Coinbase
│   │   │   │
│   │   │   ├── purchase.ts                 # Token purchase (fiat → crypto, atomic txs)
│   │   │   ├── rewards.ts                  # Reward distribution (engagement rewards)
│   │   │   ├── staking.ts                  # Staking logic (lock tokens, earn yield)
│   │   │   ├── economics.ts                # Token economics (bonding curves, supply)
│   │   │   ├── burn.ts                     # Burn mechanism (deflationary pressure)
│   │   │   ├── governance.ts               # Governance voting (DAO features)
│   │   │   └── distribution.ts             # Token distribution (airdrops, rewards)
│   │   │
│   │   ├── courses/                        # 📚 COURSE SERVICES (Feature #5 - AI-Powered LMS)
│   │   │   │
│   │   │   │   # AI-generated courses with personalized learning paths
│   │   │   │   # Depends on: OpenAI (content gen), ConvexDatabase (progress)
│   │   │   │
│   │   │   ├── builder.ts                  # Course builder (manual + AI-assisted)
│   │   │   ├── generation.ts               # AI course generation (full course from topic)
│   │   │   ├── enrollment.ts               # Enrollment logic (token-gated access)
│   │   │   ├── progress.ts                 # Progress tracking (completion, time spent)
│   │   │   ├── assessment.ts               # Quiz/assignment grading (AI + manual)
│   │   │   ├── personalization.ts          # Personalized learning paths (adaptive)
│   │   │   ├── certificates.ts             # Certificate issuance (NFT certificates)
│   │   │   └── gamification.ts             # Gamification logic (badges, streaks, XP)
│   │   │
│   │   ├── content/                        # 📝 CONTENT SERVICES (Feature #2 - Content Automation)
│   │   │   │
│   │   │   │   # AI-powered content creation and multi-platform distribution
│   │   │   │   # Depends on: OpenAI, social media providers (6), AWS S3
│   │   │   │
│   │   │   ├── creation.ts                 # Content creation (AI-assisted writing, images)
│   │   │   ├── automation.ts               # Automated publishing (scheduled posts)
│   │   │   ├── scheduling.ts               # Content calendar scheduling (optimal timing)
│   │   │   ├── distribution.ts             # Multi-platform distribution (X, IG, YT, etc.)
│   │   │   ├── optimization.ts             # Content optimization (SEO, hashtags, CTR)
│   │   │   └── templates.ts                # Template management (reusable formats)
│   │   │
│   │   ├── ugc/                            # 🎨 UGC SERVICES (Feature #4 - User-Generated Content)
│   │   │   │
│   │   │   │   # UGC creation tools + viral mechanics + token rewards
│   │   │   │   # Depends on: OpenAI (generation), TokenService (rewards)
│   │   │   │
│   │   │   ├── creation.ts                 # UGC creation tools (AI templates, meme gen)
│   │   │   ├── moderation.ts               # UGC moderation (AI + human review)
│   │   │   ├── rewards.ts                  # UGC token rewards (share-to-earn)
│   │   │   ├── viral.ts                    # Viral mechanics (amplification loops)
│   │   │   └── featured.ts                 # Featured UGC selection (trending algorithm)
│   │   │
│   │   ├── livestream/                     # 📹 LIVESTREAM SERVICES (Feature #3 - Interactive Avatar)
│   │   │   │
│   │   │   │   # Live streaming with AI clone + human hybrid interaction
│   │   │   │   # Depends on: Cloudflare Stream, Pusher, AI clone services
│   │   │   │
│   │   │   ├── streaming.ts                # Stream management (RTMP, WebRTC, recording)
│   │   │   ├── clone-mixer.ts              # Mix AI clone + human (hybrid streams)
│   │   │   ├── chat.ts                     # Live chat (real-time messaging)
│   │   │   ├── donations.ts                # Donation handling (token tips, fiat)
│   │   │   └── recording.ts                # Stream recording (VOD generation, clips)
│   │   │
│   │   ├── elevate/                        # 🚀 ELEVATE SERVICES (9-Step Customer Journey)
│   │   │   │
│   │   │   │   # ELEVATE journey orchestration - multi-week workflows
│   │   │   │   # Depends on: Workflow component, payment services
│   │   │   │
│   │   │   ├── journey.ts                  # Journey orchestration (9-step workflow)
│   │   │   ├── step-handler.ts             # Step execution (hook, gift, identify, etc.)
│   │   │   ├── timing.ts                   # Timed waiting logic (delays between steps)
│   │   │   ├── progression.ts              # Progress tracking (completion tracking)
│   │   │   └── completion.ts               # Journey completion (certificate issuance)
│   │   │
│   │   ├── analytics/                      # 📊 ANALYTICS SERVICES (Feature #7 - Business OS)
│   │   │   │
│   │   │   │   # AI-powered analytics, insights, predictions
│   │   │   │   # Depends on: OpenAI (insights), ConvexDatabase (metrics)
│   │   │   │
│   │   │   ├── metrics.ts                  # Metric calculation (KPIs, aggregations)
│   │   │   ├── insights.ts                 # AI insights generation (anomaly detection)
│   │   │   ├── predictions.ts              # Predictive analytics (forecasting)
│   │   │   ├── recommendations.ts          # AI recommendations (optimization suggestions)
│   │   │   ├── reporting.ts                # Report generation (PDF, dashboards)
│   │   │   └── real-time.ts                # Real-time analytics (live metrics)
│   │   │
│   │   ├── viral/                          # 🔥 VIRAL SERVICES (Growth Mechanisms)
│   │   │   │
│   │   │   │   # Viral growth mechanics - referrals, share-to-earn, loops
│   │   │   │   # Depends on: TokenService (rewards), social providers
│   │   │   │
│   │   │   ├── referrals.ts                # Referral tracking (invite codes, attribution)
│   │   │   ├── share-rewards.ts            # Share-to-earn logic (token rewards for shares)
│   │   │   ├── viral-loops.ts              # Viral loop mechanics (k-factor optimization)
│   │   │   └── social-proof.ts             # Success story tracking (testimonials, wins)
│   │   │
│   │   ├── entities/                       # 📦 ENTITY SERVICES (Ontology CRUD Operations)
│   │   │   │
│   │   │   │   # Type-safe CRUD for each entity type in the ontology
│   │   │   │   # Depends on: ConvexDatabase service
│   │   │   │
│   │   │   ├── creator.ts                  # Creator CRUD (create, read, update, deactivate)
│   │   │   ├── content.ts                  # Content CRUD (posts, videos, articles)
│   │   │   ├── user.ts                     # User CRUD (audience members)
│   │   │   ├── clone.ts                    # AI clone CRUD (manage clones)
│   │   │   ├── course.ts                   # Course CRUD (lessons, modules, quizzes)
│   │   │   ├── token.ts                    # Token CRUD (creator tokens)
│   │   │   └── community.ts                # Community CRUD (spaces, channels)
│   │   │
│   │   ├── connections/                    # 🔗 CONNECTION SERVICES (Relationship Management)
│   │   │   │
│   │   │   │   # Manage relationships between entities (25 connection types)
│   │   │   │   # Depends on: ConvexDatabase, EventService (logging)
│   │   │   │
│   │   │   ├── follow.ts                   # Follow/unfollow (creator ↔ user)
│   │   │   ├── enrollment.ts               # Course enrollment (user → course)
│   │   │   ├── ownership.ts                # Ownership management (creator → content)
│   │   │   ├── token-holding.ts            # Token balance tracking (user ↔ token)
│   │   │   └── relationships.ts            # Generic relationships (extensible)
│   │   │
│   │   ├── events/                         # 📅 EVENT SERVICES (Event Sourcing & Analytics)
│   │   │   │
│   │   │   │   # Event logging, tracking, replay (35 event types)
│   │   │   │   # Depends on: ConvexDatabase (append-only events table)
│   │   │   │
│   │   │   ├── logging.ts                  # Event logging (create events with metadata)
│   │   │   ├── tracking.ts                 # Event tracking (aggregate, query, filter)
│   │   │   └── replay.ts                   # Event replay/audit (time-travel queries)
│   │   │
│   │   ├── protocols/                      # 🌐 PROTOCOL SERVICES (External Standards)
│   │   │   │
│   │   │   │   # Integration with external protocols (A2A, ACP, AP2, X402, AG-UI, MCP)
│   │   │   │   # All map to ontology via metadata.protocol field
│   │   │   │
│   │   │   ├── a2a.ts                      # A2A protocol handler (agent-to-agent)
│   │   │   ├── acp.ts                      # ACP protocol handler (commerce REST API)
│   │   │   ├── ap2.ts                      # AP2 protocol handler (payment mandates)
│   │   │   ├── x402.ts                     # X402 protocol handler (HTTP micropayments)
│   │   │   ├── ag-ui.ts                    # AG-UI protocol handler (generative UI)
│   │   │   ├── mcp.ts                      # MCP protocol handler (model context)
│   │   │   │
│   │   │   ├── ag-ui/                      # 🎨 AG-UI PROTOCOL IMPLEMENTATION
│   │   │   │   │
│   │   │   │   │   # CopilotKit-inspired generative UI protocol
│   │   │   │   │   # Agents dynamically generate UI components
│   │   │   │   │
│   │   │   │   ├── context-manager.ts      # Context sharing (app state → agent awareness)
│   │   │   │   ├── ui-generator.ts         # Dynamic UI generation (charts, forms, etc.)
│   │   │   │   ├── action-handler.ts       # Human-in-the-loop actions (approvals)
│   │   │   │   ├── agent-coordinator.ts    # Multi-agent coordination (task delegation)
│   │   │   │   └── renderer.ts             # Component renderer (React component generation)
│   │   │
│   │   └── providers/                      # 🔌 EXTERNAL PROVIDERS (Effect.ts Wrappers - 26 Total)
│   │       │
│   │       │   # ═══════════════════════════════════════════════════════════
│   │       │   # ALL EXTERNAL SERVICES WRAPPED WITH EFFECT.TS
│   │       │   # ═══════════════════════════════════════════════════════════
│   │       │   # Every provider follows the same pattern:
│   │       │   # 1. Define typed errors (class XError extends Data.TaggedError)
│   │       │   # 2. Define service interface (class XService extends Context.Tag)
│   │       │   # 3. Implement service layer (XServiceLive = Layer.effect)
│   │       │   # 4. Export for dependency injection
│   │       │   #
│   │       │   # Benefits:
│   │       │   # - Type-safe error handling (no try/catch)
│   │       │   # - Testable (mock any provider)
│   │       │   # - Composable (combine services easily)
│   │       │   # - Retries, timeouts, circuit breakers built-in
│   │       │   # ═══════════════════════════════════════════════════════════
│   │       │
│   │       ├── # ═══ AI/LLM PROVIDERS (5) ═══
│   │       │
│   │       ├── openai.ts                   # OpenAI (GPT-4o, DALL-E 3, text-embedding-3-small, TTS)
│   │       │                               # Services: chat, embeddings, images, audio, moderation
│   │       │
│   │       ├── anthropic.ts                # Anthropic (Claude 3.5 Sonnet, 200K context)
│   │       │                               # Services: chat, tool use, vision, streaming
│   │       │
│   │       ├── elevenlabs.ts               # ElevenLabs (voice cloning, multilingual TTS)
│   │       │                               # Services: cloneVoice, textToSpeech, voiceLibrary
│   │       │
│   │       ├── d-id.ts                     # D-ID (AI video avatars, talking head generation)
│   │       │                               # Services: createAvatar, generateVideo, streaming
│   │       │
│   │       ├── heygen.ts                   # HeyGen (AI video avatars, alternative to D-ID)
│   │       │                               # Services: createAvatar, generateVideo, templates
│   │       │
│   │       ├── # ═══ BLOCKCHAIN PROVIDERS (4 - Base L2 Focus) ═══
│   │       │
│   │       ├── base.ts                     # Base L2 (Coinbase L2, low fees, EVM compatible)
│   │       │                               # Services: deployToken, mint, burn, transfer, balanceOf
│   │       │
│   │       ├── alchemy.ts                  # Alchemy (Base RPC, indexing, NFT API, webhooks)
│   │       │                               # Services: getBalance, getTxs, subscribeToAddress
│   │       │
│   │       ├── uniswap.ts                  # Uniswap V3 (DEX on Base, swaps, liquidity pools)
│   │       │                               # Services: swap, addLiquidity, getPrice, getPool
│   │       │
│   │       ├── wallet-connect.ts           # WalletConnect (multi-wallet connection protocol)
│   │       │                               # Services: connect, sign, sendTransaction
│   │       │
│   │       ├── # ═══ PAYMENT PROVIDERS (2) ═══
│   │       │
│   │       ├── stripe.ts                   # Stripe (FIAT ONLY - USD, EUR, cards, bank transfers)
│   │       │                               # Services: createPaymentIntent, refund, subscriptions
│   │       │
│   │       ├── coinbase.ts                 # Coinbase Commerce (crypto payments, multi-chain)
│   │       │                               # Services: createCharge, getCharge, webhooks
│   │       │
│   │       ├── # ═══ COMMUNICATION PROVIDERS (4) ═══
│   │       │
│   │       ├── resend.ts                   # Resend (PRIMARY - transactional email, templates)
│   │       │                               # Services: sendEmail, sendBatch, getDomains
│   │       │
│   │       ├── sendgrid.ts                 # SendGrid (FALLBACK - marketing email, A/B tests)
│   │       │                               # Services: sendEmail, templates, analytics
│   │       │
│   │       ├── twilio.ts                   # Twilio (SMS, voice calls, 2FA/OTP, programmable)
│   │       │                               # Services: sendSMS, makeCall, verify2FA
│   │       │
│   │       ├── pusher.ts                   # Pusher (real-time WebSockets, presence, private channels)
│   │       │                               # Services: trigger, batch, presence, webhooks
│   │       │
│   │       ├── # ═══ MEDIA/STORAGE PROVIDERS (2) ═══
│   │       │
│   │       ├── aws.ts                      # AWS (S3 general storage + CloudFront CDN)
│   │       │                               # Services: uploadFile, signedUrl, multipart, cdn
│   │       │                               # Use for: images, videos, audio, documents (NOT livestreaming)
│   │       │
│   │       ├── cloudflare-stream.ts        # Cloudflare Stream (LIVESTREAMING ONLY - RTMP, WebRTC)
│   │       │                               # Services: createStream, recordStream, webhooks
│   │       │                               # Use for: live streams ONLY (NOT general storage)
│   │       │
│   │       ├── # ═══ INTEGRATION PROVIDERS (3) ═══
│   │       │
│   │       ├── elizaos.ts                  # ElizaOS (external AI agents via A2A protocol)
│   │       │                               # Services: registerAgent, sendMessage, subscribe
│   │       │
│   │       ├── copilotkit.ts               # CopilotKit (generative UI patterns, context sharing)
│   │       │                               # Services: shareContext, generateUI, actions
│   │       │
│   │       ├── n8n.ts                      # n8n (workflow automation, API orchestration)
│   │       │                               # Services: triggerWorkflow, getExecution, webhooks
│   │       │
│   │       └── # ═══ SOCIAL MEDIA PROVIDERS (6) ═══
│   │           │
│   │           ├── twitter.ts              # Twitter/X API (tweets, threads, media, analytics)
│   │           │                           # Services: tweet, uploadMedia, getMetrics
│   │           │
│   │           ├── instagram.ts            # Instagram Graph API (posts, stories, reels, insights)
│   │           │                           # Services: createPost, uploadStory, getInsights
│   │           │
│   │           ├── youtube.ts              # YouTube Data API (videos, playlists, live, comments)
│   │           │                           # Services: uploadVideo, createPlaylist, getLiveChat
│   │           │
│   │           ├── tiktok.ts               # TikTok API (videos, analytics, user data)
│   │           │                           # Services: uploadVideo, getAnalytics, getUserInfo
│   │           │
│   │           ├── linkedin.ts             # LinkedIn API (posts, articles, pages, analytics)
│   │           │                           # Services: createPost, publishArticle, getPageStats
│   │           │
│   │           └── facebook.ts             # Facebook Graph API (page posts, media, ads, insights)
│   │                                       # Services: createPagePost, uploadMedia, getInsights
│   │
│   ├── mutations/                          # 📝 CONVEX MUTATIONS (Thin Wrappers - Write Operations)
│   │   │
│   │   │   # IMPORTANT: These are THIN WRAPPERS around Effect.ts services
│   │   │   # Pattern: validate args → call service → handle errors
│   │   │   # NO business logic here - all logic in services/
│   │   │
│   │   ├── auth.ts                         # Auth mutations (signup, login, logout, reset password)
│   │   ├── creators.ts                     # Creator mutations (create, update, deactivate)
│   │   ├── clone.ts                        # Clone mutations (create clone, update personality)
│   │   ├── content.ts                      # Content mutations (publish, edit, delete)
│   │   ├── tokens.ts                       # Token mutations (purchase, stake, unstake)
│   │   ├── courses.ts                      # Course mutations (create, publish, enroll)
│   │   ├── community.ts                    # Community mutations (post, comment, react)
│   │   ├── connections.ts                  # Connection mutations (follow, connect, disconnect)
│   │   └── elevate.ts                      # ELEVATE mutations (start journey, complete step)
│   │
│   ├── queries/                            # 🔍 CONVEX QUERIES (Thin Wrappers - Read Operations)
│   │   │
│   │   │   # IMPORTANT: These are THIN WRAPPERS around Effect.ts services
│   │   │   # Pattern: validate args → call service → return data
│   │   │   # NO business logic here - all logic in services/
│   │   │
│   │   ├── auth.ts                         # Auth queries (getCurrentUser, getSession)
│   │   ├── creators.ts                     # Creator queries (getCreator, listCreators)
│   │   ├── clone.ts                        # Clone queries (getClone, getTrainingStatus)
│   │   ├── content.ts                      # Content queries (getContent, listContent, search)
│   │   ├── tokens.ts                       # Token queries (getBalance, getPrice, getHolders)
│   │   ├── courses.ts                      # Course queries (getCourse, listCourses, getProgress)
│   │   ├── community.ts                    # Community queries (getPosts, getMessages, getThreads)
│   │   ├── connections.ts                  # Connection queries (getFollowers, getConnections)
│   │   ├── analytics.ts                    # Analytics queries (getMetrics, getInsights)
│   │   └── search.ts                       # Search queries (searchAll, searchContent, searchUsers)
│   │
│   ├── actions/                            # ⚡ CONVEX ACTIONS (Thin Wrappers - External Calls)
│   │   │
│   │   │   # IMPORTANT: These are THIN WRAPPERS around Effect.ts services
│   │   │   # Actions can call external APIs (OpenAI, Stripe, blockchain, etc.)
│   │   │   # Pattern: validate args → call service → return result
│   │   │   # NO business logic here - all logic in services/
│   │   │
│   │   ├── ai/                             # AI actions (external AI API calls)
│   │   │   ├── clone-voice.ts              # Voice cloning via ElevenLabs
│   │   │   ├── clone-appearance.ts         # Appearance cloning via D-ID/HeyGen
│   │   │   ├── generate-content.ts         # Content generation via OpenAI/Anthropic
│   │   │   ├── chat.ts                     # AI chat interactions
│   │   │   └── analyze.ts                  # Content/personality analysis
│   │   │
│   │   ├── blockchain/                     # Blockchain actions (Base L2 interactions)
│   │   │   ├── deploy-token.ts             # Deploy ERC-20 token contract
│   │   │   ├── mint.ts                     # Mint tokens to address
│   │   │   ├── burn.ts                     # Burn tokens (deflationary)
│   │   │   └── transfer.ts                 # Transfer tokens between addresses
│   │   │
│   │   ├── payments/                       # Payment actions (Stripe, Coinbase)
│   │   │   ├── create-checkout.ts          # Create payment intent/charge
│   │   │   ├── webhook.ts                  # Handle payment webhooks
│   │   │   └── refund.ts                   # Process refunds
│   │   │
│   │   └── emails/                         # Email actions (Resend, SendGrid)
│   │       ├── send-verification.ts        # Email verification
│   │       ├── send-reset.ts               # Password reset
│   │       └── send-notification.ts        # General notifications
│   │
│   ├── workflows/                          # Long-running workflows
│   │   ├── creator-launch.ts               # Creator onboard
│   │   ├── elevate-journey.ts              # ELEVATE flow
│   │   ├── content-pipeline.ts             # Content gen
│   │   ├── token-launch.ts                 # Token deploy
│   │   └── daily-operations.ts             # Daily tasks
│   │
│   ├── crons/                              # Scheduled functions
│   │   ├── daily-content.ts                # Daily content
│   │   ├── update-analytics.ts             # Analytics
│   │   ├── token-economics.ts              # Token metrics
│   │   └── cleanup.ts                      # Cleanup
│   │
│   ├── http/                               # HTTP endpoints
│   │   ├── webhooks.ts                     # Webhook handler
│   │   └── health.ts                       # Health check
│   │
│   ├── lib/                                # Backend utilities
│   │   ├── errors.ts                       # Error classes
│   │   ├── validators.ts                   # Validation
│   │   └── helpers.ts                      # Helpers
│   │
│   ├── # ═══════════════════════════════════════════════════════════════════════
│   │   # CURRENT STATE: Existing Files (Already Implemented)
│   │   # ═══════════════════════════════════════════════════════════════════════
│   │
│   ├── schema.ts                           # ✅ Current schema (4-table ontology: entities, connections, events, tags)
│   ├── auth.ts                             # ✅ Better Auth integration (GitHub, Google OAuth, magic link, 2FA)
│   ├── auth.config.ts                      # ✅ Better Auth configuration
│   ├── http.ts                             # ✅ HTTP endpoint handler (Better Auth routes + API endpoints)
│   ├── convex.config.ts                    # ✅ Convex config + Resend component + MCP integration
│   ├── README.md                           # ✅ Convex setup documentation
│   ├── tsconfig.json                       # ✅ TypeScript configuration for Convex backend
│   │
│   ├── _generated/                         # ✅ Auto-generated Convex files (DO NOT EDIT)
│   │   ├── api.d.ts                        # Generated API type definitions (queries, mutations, actions)
│   │   ├── api.js                          # Generated API runtime code
│   │   ├── dataModel.d.ts                  # Generated data model types from schema.ts
│   │   └── server.d.ts                     # Generated server-side types and utilities
│   │
│   ├── # ═══════════════════════════════════════════════════════════════════════
│   │   # API DOCUMENTATION & SPECIFICATIONS
│   │   # ═══════════════════════════════════════════════════════════════════════
│   │
│   ├── docs/                               # API documentation (lives in /docs/ directory)
│   │   ├── API.md                          # ✅ Complete API reference (Convex, Effect.ts, integrations)
│   │   ├── API-docs.md                     # ✅ OpenAPI 3.1.0 specification (auto-generated)
│   │   ├── AGENTS.md                       # ✅ Agent development guide (Convex patterns)
│   │   ├── Specifications.md               # ✅ Protocol specifications (A2A, ACP, AP2, X402, ACPayments, AGUI)
│   │   └── Integration-Guides.md           # 📋 PLANNED: Integration guides for external services
│   │
│   ├── # ═══════════════════════════════════════════════════════════════════════
│   │   # NEXT STEPS: Implementation Roadmap
│   │   # ═══════════════════════════════════════════════════════════════════════
│   │   #
│   │   # Week 1-2: Foundation
│   │   # - Implement schema/ directory (4 tables: entities, connections, events, tags)
│   │   # - Create ConvexDatabase service (core/database.ts)
│   │   # - Create EntityService, ConnectionService, EventService
│   │   #
│   │   # Week 3-4: Core Services
│   │   # - Implement auth service (core/auth.ts)
│   │   # - Implement storage service (core/storage.ts)
│   │   # - Create basic CRUD mutations/queries
│   │   #
│   │   # Week 5-8: AI Services
│   │   # - Implement OpenAI, Anthropic providers
│   │   # - Create AI clone services (ai/clone.ts, ai/voice-clone.ts)
│   │   # - Implement RAG service (ai/rag.ts)
│   │   #
│   │   # Week 9-12: Platform Features
│   │   # - Token economy services (tokens/)
│   │   # - Course services (courses/)
│   │   # - Community services (community/)
│   │   # - Business agents (business/)
│   │   #
│   │   # Week 13-16: Protocols & Integrations
│   │   # - Protocol services (protocols/a2a.ts, protocols/acp.ts, etc.)
│   │   # - External integrations (ElizaOS, CopilotKit, n8n)
│   │   # - Social media providers
│   │   #
│   │   # Week 17-20: Polish & Scale
│   │   # - Performance optimization
│   │   # - Testing (unit, integration, e2e)
│   │   # - Documentation
│   │   # - Deployment
│   │   # ═══════════════════════════════════════════════════════════════════════
│   │
│   ├── components/                         # 🧩 CONVEX COMPONENTS INTEGRATION (PLANNED)
│   │   ├── # Component Wrappers (Effect.ts services)
│   │   ├── agent.wrapper.ts                # @convex-dev/agent wrapper
│   │   ├── workflow.wrapper.ts             # @convex-dev/workflow wrapper
│   │   ├── rag.wrapper.ts                  # @convex-dev/rag wrapper
│   │   ├── rate-limiter.wrapper.ts         # @convex-dev/rate-limiter wrapper
│   │   ├── retrier.wrapper.ts              # @convex-dev/action-retrier wrapper
│   │   ├── workpool.wrapper.ts             # @convex-dev/workpool wrapper
│   │   ├── streaming.wrapper.ts            # @convex-dev/persistent-text-streaming wrapper
│   │   ├── crons.wrapper.ts                # @convex-dev/crons wrapper
│   │   └── resend.wrapper.ts               # @convex-dev/resend wrapper
│   │
│   ├── confect.ts                          # Confect setup (optional)
│   ├── convex.config.ts                    # Convex config + components registration
│   │
│   └── _generated/                         # Generated (don't edit)
│       ├── api.d.ts                        # API types
│       ├── api.js                          # API runtime
│       ├── dataModel.d.ts                  # Data model
│       └── server.d.ts                     # Server types
│
├── tests/                                  # TESTS
│   ├── unit/                               # Unit tests
│   │   ├── services/                       # Service tests
│   │   │   ├── ai-clone.test.ts
│   │   │   ├── token.test.ts
│   │   │   ├── course.test.ts
│   │   │   └── agents.test.ts
│   │   │
│   │   ├── utils/                          # Utility tests
│   │   │   ├── validators.test.ts
│   │   │   └── helpers.test.ts
│   │   │
│   │   └── components/                     # Component tests
│   │       ├── auth.test.tsx
│   │       └── tokens.test.tsx
│   │
│   ├── integration/                        # Integration tests
│   │   ├── auth-flow.test.ts
│   │   ├── token-purchase.test.ts
│   │   ├── clone-creation.test.ts
│   │   └── content-generation.test.ts
│   │
│   ├── e2e/                                # E2E tests
│   │   ├── creator-onboarding.spec.ts
│   │   ├── audience-journey.spec.ts
│   │   ├── token-flow.spec.ts
│   │   └── elevate-journey.spec.ts
│   │
│   ├── fixtures/                           # Test fixtures
│   │   ├── creators.ts
│   │   ├── content.ts
│   │   ├── tokens.ts
│   │   └── users.ts
│   │
│   └── helpers/                            # Test helpers
│       ├── setup.ts
│       ├── mocks.ts
│       └── factories.ts
│
├── scripts/                                # AUTOMATION SCRIPTS
│   ├── setup/                              # Setup scripts
│   │   ├── init-dev.ts                     # Init dev env
│   │   ├── seed-data.ts                    # Seed data
│   │   └── create-admin.ts                 # Create admin
│   │
│   ├── migration/                          # Migration scripts
│   │   ├── inventory-one-ie.md             # one.ie inventory
│   │   ├── inventory-bullfm.md             # bullfm inventory
│   │   ├── mappings.md                     # Data mappings
│   │   ├── migrate-one-ie.ts               # Migrate one.ie
│   │   ├── migrate-bullfm.ts               # Migrate bullfm
│   │   ├── transform-data.ts               # Transform
│   │   └── verify-migration.ts             # Verify
│   │
│   ├── deploy/                             # Deployment scripts
│   │   ├── pre-deploy.ts                   # Pre-deploy
│   │   ├── deploy.ts                       # Deploy
│   │   └── post-deploy.ts                  # Post-deploy
│   │
│   └── utils/                              # Utility scripts
│       ├── backup-db.ts                    # Backup
│       ├── analyze-performance.ts          # Performance
│       └── generate-types.ts               # Generate types
│
├── public/                                 # STATIC ASSETS
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   ├── hero.png
│   │   └── features/
│   │
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── apple-touch-icon.png
│   │   └── manifest-icon-192.png
│   │
│   └── fonts/
│       └── inter/
│
├── .vscode/                                # VS CODE SETTINGS
│   ├── settings.json                       # Workspace settings
│   ├── extensions.json                     # Extensions
│   ├── tasks.json                          # Tasks
│   └── launch.json                         # Debug config
│
├── .github/                                # GITHUB
│   └── workflows/
│       ├── ci.yml                          # CI pipeline
│       ├── deploy.yml                      # Deploy workflow
│       └── tests.yml                       # Test workflow
│
├── astro.config.mjs                        # Astro config
├── tailwind.config.mjs                     # Tailwind config
├── tsconfig.json                           # TypeScript config
├── package.json                            # Dependencies
├── bun.lockb                               # Lock file
├── .env.example                            # Env template
├── .env.local                              # Local env (gitignored)
├── .gitignore                              # Git ignore
├── .eslintrc.json                          # ESLint config
├── .prettierrc                             # Prettier config
├── vitest.config.ts                        # Test config
└── README.md                               # Root README
```

---

## Naming Conventions

### Files

**Components (React):**
```
PascalCase.tsx
✅ CreatorProfile.tsx
✅ TokenPurchase.tsx
❌ creatorProfile.tsx
❌ creator-profile.tsx
```

**Pages (Astro):**
```
kebab-case.astro or [param].astro
✅ signin.astro
✅ [username].astro
✅ reset-password.astro
❌ SignIn.astro
❌ resetPassword.astro
```

**Services (Effect.ts):**
```
camelCase.ts
✅ clone.ts
✅ content-generation.ts
✅ token-economics.ts
❌ Clone.ts
❌ contentGeneration.ts
```

**Mutations/Queries/Actions:**
```
camelCase.ts (grouped by domain)
✅ creators.ts
✅ tokens.ts
❌ Creators.ts
❌ creator-mutations.ts (redundant)
```

**Tests:**
```
[name].test.ts or [name].spec.ts
✅ token.test.ts (unit)
✅ token-flow.spec.ts (e2e)
❌ tokenTest.ts
```

### Exports

**Components:**
```typescript
// ✅ CORRECT: Named export matching filename
export function CreatorProfile() { }

// ❌ WRONG: Default export or mismatched name
export default function Profile() { }
```

**Services:**
```typescript
// ✅ CORRECT: Class with Service suffix
export class TokenService extends Effect.Service<TokenService>()

// ❌ WRONG: No suffix or different name
export class Token extends Effect.Service<Token>()
```

**Mutations/Queries:**
```typescript
// ✅ CORRECT: Named export
export const create = mutation({ })
export const get = query({ })

// ❌ WRONG: Default export
export default mutation({ })
```

---

## Where Each File Type Goes

### Frontend Components

**shadcn/ui primitives:**
```
Location: src/components/ui/[component].tsx
Example: src/components/ui/button.tsx
Rule: Only shadcn components, no custom logic
```

**Feature components:**
```
Location: src/components/features/[domain]/[Component].tsx
Example: src/components/features/tokens/TokenPurchase.tsx
Rule: Grouped by domain, one component per file
```

### Backend Services

**Effect.ts services:**
```
Location: convex/services/[category]/[service].ts
Example: convex/services/ai/clone.ts
Rule: Business logic only, pure functions
```

**Convex functions:**
```
Mutations: convex/mutations/[domain].ts
Queries: convex/queries/[domain].ts
Actions: convex/actions/[category]/[action].ts
Rule: Thin wrappers around services
```

### Schema

**Schema files:**
```
Location: convex/schema/[table].ts
Example: convex/schema/entities.ts
Rule: One file per table definition
```

**Type definitions:**
```
Location: convex/schema/types.ts
Rule: Property types for entities
```

### Tests

**Unit tests:**
```
Location: tests/unit/[category]/[name].test.ts
Example: tests/unit/services/token.test.ts
Rule: Mirror source structure
```

**Integration tests:**
```
Location: tests/integration/[feature].test.ts
Example: tests/integration/token-purchase.test.ts
Rule: End-to-end feature flows
```

**E2E tests:**
```
Location: tests/e2e/[flow].spec.ts
Example: tests/e2e/creator-onboarding.spec.ts
Rule: Full user journeys with Playwright
```

### Documentation

**AI context:**
```
Location: .ai/context/[topic].md
Rule: For AI agents, technical
```

**Human docs:**
```
Location: docs/[topic].md
Rule: For developers, user-friendly
```

---

## File Creation Checklist

When creating a new file, verify:

- [ ] File is in correct directory per this map
- [ ] Filename follows naming convention
- [ ] Export name matches filename
- [ ] Imports use path aliases (@/)
- [ ] File is added to this map (if new category)
- [ ] Related test file created

---

## Path Aliases

```typescript
// Use these in imports:
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/hooks"

// Never use relative paths:
import { Button } from "../../../components/ui/button"  // ❌ WRONG
```

**Configured in:**
- `tsconfig.json` - TypeScript
- `astro.config.mjs` - Astro

---

## Convex Components Architecture

### Official Convex Components Used

This project uses 9 official Convex components wrapped with Effect.ts for enhanced composition:

#### 1. @convex-dev/agent
```
Location: convex/components/agent.wrapper.ts
Purpose: AI agent orchestration with tools, streaming, RAG
Features:
  - Multi-agent conversations
  - Tool calling
  - Built-in RAG
  - Usage tracking
  - Streaming responses
```

#### 2. @convex-dev/workflow
```
Location: convex/components/workflow.wrapper.ts
Purpose: Durable, long-running workflows
Features:
  - Step-by-step execution
  - Automatic retries
  - Journaling
  - Parallel steps
  - Conditional logic
```

#### 3. @convex-dev/rag
```
Location: convex/components/rag.wrapper.ts
Purpose: Retrieval Augmented Generation
Features:
  - Vector embeddings
  - Semantic search
  - Chunking
  - Namespace isolation
  - Filter support
```

#### 4. @convex-dev/rate-limiter
```
Location: convex/components/rate-limiter.wrapper.ts
Purpose: Token bucket & fixed window rate limiting
Features:
  - Per-user limits
  - Global limits
  - Token reservation
  - Sharding support
```

#### 5. @convex-dev/action-retrier
```
Location: convex/components/retrier.wrapper.ts
Purpose: Persistent action retries with backoff
Features:
  - Exponential backoff
  - Status tracking
  - Completion callbacks
  - Cancellation
```

#### 6. @convex-dev/workpool
```
Location: convex/components/workpool.wrapper.ts
Purpose: Task queue with parallelism control
Features:
  - Concurrent execution limits
  - Priority queues
  - Completion callbacks
  - Status tracking
```

#### 7. @convex-dev/persistent-text-streaming
```
Location: convex/components/streaming.wrapper.ts
Purpose: HTTP streaming for LLM responses
Features:
  - Delta storage
  - WebSocket delivery
  - Client subscriptions
  - Backpressure handling
```

#### 8. @convex-dev/crons
```
Location: convex/components/crons.wrapper.ts
Purpose: Dynamic cron job scheduling
Features:
  - Dynamic registration
  - Cron expressions
  - Interval scheduling
  - Job management
```

#### 9. @convex-dev/resend
```
Location: convex/components/resend.wrapper.ts
Purpose: Email sending via Resend
Features:
  - Email delivery
  - Status tracking
  - Event webhooks
  - Template support
```

### Effect.ts Integration Pattern

All components follow this pattern:

```typescript
// 1. Define Effect Service
class AgentService extends Context.Tag("AgentService")<
  AgentService,
  {
    readonly generateResponse: (...) => Effect.Effect<Result, Error>
  }
>() {}

// 2. Create Service Layer
const AgentServiceLive = Layer.effect(
  AgentService,
  Effect.gen(function* () {
    const agent = new Agent(components.agent, { ... })
    return {
      generateResponse: (...) => Effect.tryPromise({ ... })
    }
  })
)

// 3. Use in Convex functions
export const myAction = action({
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const agentService = yield* AgentService
      const result = yield* agentService.generateResponse(...)
      return result
    }).pipe(
      Effect.provide(AgentServiceLive),
      Effect.runPromise
    )
})
```

### Confect Integration (Optional)

For teams fully invested in Effect.ts:

```
Location: convex/confect.ts
Purpose: Native Effect.ts Convex functions
Features:
  - Effect Schema instead of Validators
  - Option<A> instead of A | null
  - Effect-native database ops
  - Full Effect integration
```

---

## PromptKit & CopilotKit Integration

### PromptKit AI Components

**Purpose:** Production-ready AI/chat UI components built on shadcn/ui

**Location:** `src/components/prompt-kit/`

**Key Components:**
- **Chat:** message.tsx, prompt-input.tsx, chat-container.tsx, response-stream.tsx
- **Agents:** reasoning.tsx, tool.tsx, agent-card.tsx
- **Generative UI:** generative-ui-renderer.tsx, dynamic-chart.tsx, dynamic-table.tsx, dynamic-form.tsx
- **Context:** context-provider.tsx, context-viewer.tsx
- **Actions:** action-trigger.tsx, action-approval.tsx, multi-agent-panel.tsx

**Installation:**
```bash
# Install via shadcn CLI
bunx shadcn@latest add "https://www.prompt-kit.com/c/[COMPONENT_NAME].json"
```

**Features:**
- Auto-scrolling chat containers
- Auto-resizing text inputs
- Streaming response display
- Agent reasoning visualization
- Function call display
- Markdown rendering
- Code syntax highlighting

### CopilotKit/AG-UI Protocol

**Purpose:** Agent-to-frontend communication protocol for generative UI

**Location:** `convex/services/protocols/ag-ui/`

**Architecture:**

```
Frontend (PromptKit Components)
    ↕️ (AG-UI Protocol Messages)
Backend (Effect.ts Services)
    ├── context-manager.ts     # Bidirectional context sharing
    ├── ui-generator.ts        # Dynamic UI component generation
    ├── action-handler.ts      # Human-in-the-loop actions
    ├── agent-coordinator.ts   # Multi-agent orchestration
    └── renderer.ts            # Component rendering logic
```

**Protocol Features:**
1. **Context Sharing** - App state ↔️ Agent awareness
2. **Generative UI** - Agents dynamically create UI components
3. **Human-in-the-Loop** - Action approval/rejection
4. **Multi-Agent** - Coordinate multiple agents
5. **Real-time** - Convex subscriptions for live updates

**Integration Pattern:**

```typescript
// Frontend (PromptKit)
import { GenerativeUIRenderer } from "@/components/prompt-kit/generative-ui-renderer"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function AIChat() {
  const messages = useQuery(api.agui.getMessages, { threadId })

  return (
    <ChatContainer>
      {messages?.map(msg => (
        msg.type === "ui" ? (
          <GenerativeUIRenderer component={msg.component} data={msg.data} />
        ) : (
          <Message content={msg.content} />
        )
      ))}
    </ChatContainer>
  )
}

// Backend (Effect.ts + Convex)
export const generateUI = action({
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const aguiService = yield* AGUIService

      // Generate dynamic UI component
      const uiComponent = yield* aguiService.generateComponent({
        type: "chart",
        data: args.chartData,
        config: { theme: "dark" }
      })

      // Send to frontend
      yield* Effect.tryPromise({
        try: () => ctx.runMutation(api.agui.sendUI, {
          threadId: args.threadId,
          component: uiComponent
        })
      })
    }).pipe(Effect.provide(AGUIServiceLive), Effect.runPromise)
})
```

**Documentation:**
- `docs/PromptKit.md` - Component usage & examples
- `docs/CopilotKit.md` - AG-UI protocol & generative UI patterns
- `docs/AGUI.md` - Complete AG-UI protocol specification

---

## Service Providers Architecture

### Overview

All external service providers are wrapped with **Effect.ts** for type-safe error handling, dependency injection, and composability.

**Total Providers:** 26
- AI/LLM: 5
- Blockchain: 4
- Payment: 2
- Communication: 4
- Media/Storage: 2
- Integration: 3
- Social Media: 6

### Effect.ts Pattern

Every provider follows this pattern:

```typescript
// 1. Define typed errors
export class ProviderError extends Data.TaggedError("ProviderError")<{
  message: string
  cause?: unknown
}> {}

// 2. Define service interface
export class ProviderService extends Context.Tag("ProviderService")<
  ProviderService,
  {
    readonly operation: (...args) => Effect.Effect<Result, Error>
  }
>() {}

// 3. Implement service layer
export const ProviderServiceLive = Layer.effect(
  ProviderService,
  Effect.gen(function* () {
    const apiKey = process.env.PROVIDER_API_KEY
    const client = new ProviderSDK({ apiKey })

    return {
      operation: (...args) =>
        Effect.tryPromise({
          try: () => client.doSomething(args),
          catch: (error) => new ProviderError({ cause: error })
        })
    }
  })
)
```

### Provider Categories

#### **1. AI/LLM Providers (5)**

**OpenAI (`openai.ts`)**
- GPT-4 chat completions
- DALL-E image generation
- Text embeddings (text-embedding-3-small)
- Text-to-Speech (TTS)
- Function calling

**Anthropic (`anthropic.ts`)**
- Claude 3.5 Sonnet
- Long context windows (200K tokens)
- Tool use
- Vision capabilities

**ElevenLabs (`elevenlabs.ts`)**
- Voice cloning (3+ samples required)
- Text-to-Speech
- Voice library
- Multi-lingual support

**D-ID (`d-id.ts`)**
- AI video avatar creation
- Appearance cloning from images
- Talking head videos
- Real-time streaming

**HeyGen (`heygen.ts`)**
- Alternative AI video avatars
- Multi-language support
- Custom avatar training
- Video generation

#### **2. Blockchain Providers (4 - Base L2 Focus)**

**Base (`base.ts`)**
- Primary blockchain (Coinbase L2)
- Low gas fees
- EVM compatible
- Token deployment & transfers

**Alchemy (`alchemy.ts`)**
- Base chain RPC provider
- Transaction indexing
- WebSocket subscriptions
- NFT API
- Enhanced APIs

**Uniswap (`uniswap.ts`)**
- DEX on Base
- Token swaps
- Liquidity pools
- Price discovery
- V3 concentrated liquidity

**WalletConnect (`wallet-connect.ts`)**
- Wallet connection protocol
- Multi-wallet support
- QR code signing
- Session management

#### **3. Payment Providers (2)**

**Stripe (`stripe.ts`)**
- **Fiat payments ONLY** (USD, cards, bank transfers)
- Subscriptions
- Invoicing
- Payment intents
- Webhook handling
- Customer portal

**Coinbase Commerce (`coinbase.ts`)**
- Cryptocurrency payments
- Multiple chains
- Payment tracking
- Webhook events

#### **4. Communication Providers (4)**

**Resend (`resend.ts`)**
- **Primary email provider**
- Transactional emails
- Email verification
- Password reset
- Template support
- High deliverability

**SendGrid (`sendgrid.ts`)**
- **Alternative email provider**
- Marketing emails
- Template engine
- Analytics
- A/B testing

**Twilio (`twilio.ts`)**
- SMS messaging
- Voice calls
- 2FA/OTP
- Programmable messaging
- Call recording

**Pusher (`pusher.ts`)**
- Real-time WebSockets
- Presence channels
- Private channels
- Client events
- Fallback support

#### **5. Media/Storage Providers (2)**

**AWS (`aws.ts`)**
- **S3:** General media storage (images, videos, audio, documents)
- **CloudFront:** Global CDN for fast delivery
- **Signed URLs:** Secure uploads/downloads
- **Multipart uploads:** Large file handling

**Cloudflare Stream (`cloudflare-stream.ts`)**
- **Livestreaming ONLY** (not general storage)
- RTMP/WebRTC ingestion
- Adaptive bitrate streaming
- DVR functionality
- Real-time analytics

#### **6. Integration Providers (3)**

**ElizaOS (`elizaos.ts`)**
- External AI agent integration
- Agent discovery
- Message routing
- Plugin system
- Multi-agent coordination

**CopilotKit (`copilotkit.ts`)**
- Generative UI patterns
- Context sharing
- Action system
- Component rendering

**n8n (`n8n.ts`)**
- Workflow automation
- API orchestration
- Data transformation
- Scheduled tasks
- Webhook triggers

#### **7. Social Media Providers (6)**

**Twitter/X (`twitter.ts`)**
- Post tweets
- Thread creation
- Media uploads
- Analytics
- OAuth authentication

**Instagram (`instagram.ts`)**
- Post images/videos
- Stories
- Reels
- Insights
- Graph API

**YouTube (`youtube.ts`)**
- Video uploads
- Playlist management
- Analytics
- Live streaming
- Comments

**TikTok (`tiktok.ts`)**
- Video uploads
- Analytics
- User data
- Engagement metrics

**LinkedIn (`linkedin.ts`)**
- Post updates
- Article publishing
- Company pages
- Analytics

**Facebook (`facebook.ts`)**
- Page posts
- Media uploads
- Insights
- Ads API

### Architecture Principles

**1. Media Storage Strategy**
- **AWS S3 + CloudFront:** All static media (images, videos, audio, documents)
- **Cloudflare Stream:** Livestreaming ONLY (RTMP, WebRTC, adaptive streaming)

**2. Payment Strategy**
- **Stripe:** All fiat payments (USD, credit cards, bank transfers, subscriptions)
- **Blockchain:** All crypto payments (token purchases, staking, transfers)

**3. Multi-Chain Architecture**
- Each blockchain has dedicated provider
- Unified Effect.ts interface
- Easy to add new chains (Sui, Solana, Ethereum mainnet)
- Chain-specific optimizations

**4. Email Strategy**
- **Resend:** Primary (transactional emails)
- **SendGrid:** Fallback + marketing emails
- Automatic failover

**5. Error Handling**
- All providers use typed errors
- Retry logic with exponential backoff
- Circuit breaker pattern
- Fallback providers

### Documentation

- `docs/Service Layer.md` - Effect.ts service architecture
- `docs/Service Providers.md` - Original providers (OpenAI, ElevenLabs, Stripe, Blockchain)
- `docs/Service Providers - New.md` - New providers (D-ID, HeyGen, Uniswap, Alchemy, Twilio, AWS, Cloudflare)

## Special Directories

### Don't Edit

```
convex/_generated/     # Auto-generated by Convex
node_modules/          # Dependencies
dist/                  # Build output
.astro/                # Astro cache
```

### Don't Commit

```
.env.local             # Local environment
.DS_Store              # macOS
*.log                  # Log files
coverage/              # Test coverage
```

---

## Migration Notes

**From one.ie and bullfm:**

Old structure → New structure mapping:

```
one.ie/components/Auth/         → src/components/features/auth/
one.ie/pages/dashboard/         → src/pages/dashboard.astro
one.ie/lib/api/                 → convex/mutations/ + queries/
one.ie/models/                  → convex/schema/
one.ie/utils/                   → src/lib/

bullfm/components/              → src/components/features/[domain]/
bullfm/api/                     → convex/actions/
```

**Ingestor agent will handle this mapping automatically.**

---

## Summary

**Key principles:**
1. Everything has a specific place
2. Naming is consistent and predictable
3. Structure mirrors functionality
4. AI agents know exactly where to put files
5. No ambiguity, no guessing

**When in doubt:**
- Read this file
- Find similar existing file
- Follow the same pattern
- Update this file if creating new structure

**This map is the source of truth for file locations.**

---

## Effect.ts Architecture Summary

### How Effect.ts Covers the Entire ONE Platform

The ONE Platform is built on a **pure Effect.ts service layer** that covers 100% of application logic:

#### 🎯 Coverage Breakdown

**1. Core Infrastructure (5 services)**
- Database operations (CRUD, queries, transactions)
- Authentication (Better Auth integration, sessions)
- File storage (R2/S3 uploads, signed URLs)
- Caching (Redis-like operations)
- Job queues (background tasks)

**2. Platform Features (78 services across 12 domains)**
- AI Clone Technology: 12 services
- Content Automation: 6 services
- Interactive Avatar (Livestream): 5 services
- User-Generated Content: 5 services
- AI-Powered LMS: 8 services
- Living Community: 6 services
- Business OS (Analytics): 6 services
- Token Economy: 7 services
- ELEVATE Journey: 5 services
- Viral Mechanisms: 4 services
- Business Agents: 11 services (10 C-suite + orchestrator)
- Ontology Operations: 3 services (entities, connections, events)

**3. External Integrations (26 providers)**
- AI/LLM: 5 providers (OpenAI, Anthropic, ElevenLabs, D-ID, HeyGen)
- Blockchain: 4 providers (Base, Alchemy, Uniswap, WalletConnect)
- Payments: 2 providers (Stripe for fiat, Coinbase for crypto)
- Communication: 4 providers (Resend, SendGrid, Twilio, Pusher)
- Media/Storage: 2 providers (AWS S3, Cloudflare Stream)
- Integration: 3 providers (ElizaOS, CopilotKit, n8n)
- Social Media: 6 providers (Twitter, Instagram, YouTube, TikTok, LinkedIn, Facebook)

**4. Protocol Implementations (6 protocols)**
- A2A (Agent-to-Agent)
- ACP (Agentic Commerce)
- AP2 (Agent Payments Protocol)
- X402 (HTTP Micropayments)
- AG-UI (Generative UI)
- MCP (Model Context Protocol)

**Total Effect.ts Services: 115+**
- 5 core infrastructure services
- 78 platform feature services
- 26 external provider wrappers
- 6 protocol implementations

#### 🏗️ Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: CONVEX API (Thin Wrappers)                    │
│  - mutations/ (write operations)                        │
│  - queries/ (read operations)                           │
│  - actions/ (external calls)                            │
│                                                          │
│  Pattern: validate args → call service → return result  │
│  NO business logic here                                 │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  LAYER 2: EFFECT.TS SERVICES (Business Logic)           │
│  - 100% of application logic lives here                 │
│  - Pure functions (testable, composable)                │
│  - Typed errors (no exceptions)                         │
│  - Dependency injection                                 │
│  - Platform agnostic                                    │
│                                                          │
│  Pattern: Effect.Service with explicit dependencies     │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│  LAYER 3: EXTERNAL PROVIDERS (Effect.ts Wrappers)       │
│  - 26 external services wrapped with Effect.ts          │
│  - Type-safe error handling                             │
│  - Automatic retries, timeouts, circuit breakers        │
│  - Easy to mock for testing                             │
│                                                          │
│  Pattern: Context.Tag + Layer.effect                    │
└─────────────────────────────────────────────────────────┘
```

#### 🎁 Effect.ts Benefits

**1. Type-Safe Errors**
- No try/catch blocks
- Every error is typed (e.g., `InsufficientContentError`, `VoiceCloneFailedError`)
- Pattern matching on error types
- Exhaustive error handling

**2. Dependency Injection**
- Services declare dependencies explicitly
- Easy to mock for testing (`MockStripeProvider`, `MockOpenAIProvider`)
- Compose services into larger workflows
- MainLayer combines all services

**3. Composability**
- Services combine like LEGO blocks
- Parallel execution: `Effect.all([...], { concurrency: 5 })`
- Sequential execution: `Effect.gen` chaining
- Retries, timeouts, circuit breakers built-in

**4. Platform Agnostic**
- Services are pure functions (no Convex-specific code)
- Can run in: Convex, Node.js, Cloudflare Workers, Deno, Bun
- Easy to migrate if needed
- Testable outside of Convex

**5. Observability**
- Built-in logging: `Effect.logInfo`, `Effect.logError`
- Tracing: `Effect.withSpan` for distributed tracing
- Metrics: Track execution time, errors, retries
- Debugging: Full execution trace

**6. Testability**
- Mock any dependency
- Test services in isolation
- Integration tests compose real services
- Property-based testing support

#### 📊 Current Implementation Status

**✅ Implemented (Current State)**
- Better Auth integration (convex/auth.ts)
- Basic schema (convex/schema.ts)
- HTTP routes (convex/http.ts)
- Convex configuration (convex.config.ts)

**🚧 In Progress (Planned - 20 Week Roadmap)**
- Schema implementation (4 tables: entities, connections, events, tags)
- Core services (database, auth, storage, cache, queue)
- Platform feature services (AI, tokens, courses, community, etc.)
- External provider wrappers (26 providers)
- Protocol implementations (A2A, ACP, AP2, X402, AG-UI, MCP)

**📅 Implementation Timeline**
- Week 1-2: Foundation (schema + core services)
- Week 3-4: Core services (auth, storage, basic CRUD)
- Week 5-8: AI services (clone, RAG, content generation)
- Week 9-12: Platform features (tokens, courses, community)
- Week 13-16: Protocols & integrations
- Week 17-20: Polish & scale

#### 🔑 Key Principles

1. **ALL business logic in services/** - 100% Effect.ts, no exceptions
2. **Convex functions are THIN WRAPPERS** - Validate → call service → return
3. **NO business logic in mutations/queries/actions** - Keep them simple
4. **Services are pure, testable, composable** - No side effects
5. **Explicit types everywhere** - No `any`, typed errors with `_tag`
6. **Platform agnostic** - Services can run anywhere
7. **Dependency injection** - Mock any service for testing
8. **Observability first** - Logging, tracing, metrics built-in

This architecture ensures:
- **Consistency**: Same patterns everywhere
- **Type Safety**: Compiler catches errors
- **Testability**: Pure functions are easy to test
- **Composability**: Services combine cleanly
- **AI-Friendly**: Explicit patterns AI can learn
- **Scalability**: Code quality improves as codebase grows

---

**Last updated:** 2025-01-15
**Maintained by:** AI agents + human developers
**Update frequency:** Every time new directory created