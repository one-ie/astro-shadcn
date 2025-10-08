graph TB
    subgraph "Frontend Layer"
        A[Astro Pages + React Islands]
        B[shadcn/ui Components]
        C[React Hooks]
    end

    subgraph "Effect.ts Benefits"
        D1["🎯 Type-Safe Errors<br/>No silent failures"]
        D2["🧪 Testability<br/>Mock dependencies easily"]
        D3["🔧 Dependency Injection<br/>Services auto-wired"]
        D4["📦 Composability<br/>Chain operations cleanly"]
        D5["⚡ Performance<br/>Lazy evaluation + streaming"]
    end

    subgraph "Confect Bridge Layer"
        E[Confect: Effect ↔ Convex]
        E1["Convert Convex → Effect"]
        E2["Handle Convex errors → typed Effect errors"]
        E3["Inject Convex ctx as Effect service"]
    end

    subgraph "Service Layer (Effect.ts)"
        F1[AICloneService<br/>Voice/appearance generation]
        F2[TokenService<br/>Blockchain operations]
        F3[CourseService<br/>AI course generation]
        F4[CommunityService<br/>Interactions + moderation]
        F5[AnalyticsService<br/>Metrics + insights]
        F6[PaymentService<br/>Stripe integration]
    end

    subgraph "Convex Backend"
        G1[Convex Mutations<br/>Write operations]
        G2[Convex Queries<br/>Read operations]
        G3[Convex Actions<br/>External APIs]
        G4["@convex-dev/agent<br/>AI orchestration"]
        G5["@convex-dev/workflow<br/>Long-running tasks"]
    end

    subgraph "Data Layer"
        H1[(entities table<br/>Users, agents, blocks)]
        H2[(connections table<br/>Relationships)]
        H3[(events table<br/>Timeline + analytics)]
        H4[(embeddings<br/>Vector search)]
    end

    subgraph "External Services"
        I1[OpenAI/Anthropic<br/>AI clone intelligence]
        I2[ElevenLabs<br/>Voice cloning]
        I3[Base L2<br/>Token contracts]
        I4[Stripe Connect<br/>Payments + splits]
    end

    A --> C
    B --> C
    C --> E
    E --> F1 & F2 & F3 & F4 & F5 & F6
    
    F1 --> G3
    F2 --> G3
    F3 --> G1
    F4 --> G2
    F5 --> G2
    F6 --> G3
    
    G1 --> H1 & H2 & H3
    G2 --> H1 & H2 & H3 & H4
    G3 --> I1 & I2 & I3 & I4
    
    G4 --> F1 & F3
    G5 --> F3 & F4

    E1 -.->|wraps| G1
    E2 -.->|wraps| G2
    E3 -.->|wraps| G3

    D1 -.->|enables| F1 & F2 & F3 & F4 & F5 & F6
    D2 -.->|enables| F1 & F2 & F3 & F4 & F5 & F6
    D3 -.->|enables| F1 & F2 & F3 & F4 & F5 & F6
    D4 -.->|enables| F1 & F2 & F3 & F4 & F5 & F6
    D5 -.->|enables| F1 & F2 & F3 & F4 & F5 & F6

    style E fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style F1 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style F2 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style F3 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style F4 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style F5 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style F6 fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style D1 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style D2 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style D3 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style D4 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style D5 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px