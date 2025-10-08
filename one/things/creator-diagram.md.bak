graph TB
    subgraph "SOURCE: The Creator"
        C[👤 CREATOR<br/>Identity · Voice · Knowledge · Style]
    end

    subgraph "EXTRACTION: Knowledge Layer"
        KB[(📚 Knowledge Base<br/>RAG System)]
        KB1[Video Transcripts]
        KB2[Written Content]
        KB3[Audio Samples]
        KB4[Interaction Patterns]
        KB5[Values & Beliefs]
    end

    subgraph "SYNTHESIS: AI Clone"
        AC[🤖 AI CLONE<br/>Digital Twin]
        AC1[Voice Model<br/>ElevenLabs]
        AC2[Appearance Model<br/>D-ID/HeyGen]
        AC3[Personality Model<br/>Fine-tuned LLM]
        AC4[Knowledge Graph<br/>Creator's expertise]
    end

    subgraph "INTELLIGENCE: Business Agents"
        BA1[📊 Strategy Agent<br/>Vision · Planning · OKRs]
        BA2[🔬 Research Agent<br/>Market · Trends · Competitors]
        BA3[📢 Marketing Agent<br/>Content · Distribution · SEO]
        BA4[💰 Sales Agent<br/>Funnels · Conversion · Follow-up]
        BA5[🤝 Service Agent<br/>Support · Onboarding · Success]
        BA6[🎨 Design Agent<br/>Brand · UI/UX · Assets]
        BA7[⚙️ Engineering Agent<br/>Tech · Integration · Automation]
        BA8[💵 Finance Agent<br/>Revenue · Costs · Forecasting]
        BA9[⚖️ Legal Agent<br/>Compliance · Contracts · IP]
        BA10[🧠 Intelligence Agent<br/>Analytics · Insights · Predictions]
    end

    subgraph "CREATION: Content Engine"
        CE1[📝 Blog Posts]
        CE2[🎥 Videos]
        CE3[🎙️ Podcasts]
        CE4[📱 Social Media]
        CE5[📧 Emails]
        CE6[🎓 Courses]
    end

    subgraph "COMMUNITY: The Audience"
        A[👥 FANS/AUDIENCE<br/>Consumers → Creators]
        A1[💬 Chat with AI Clone]
        A2[📚 Learn from Courses]
        A3[🎨 Create UGC]
        A4[🗳️ Participate in Governance]
        A5[💎 Hold Tokens]
    end

    subgraph "ECONOMY: Token System"
        T[🪙 CREATOR TOKEN<br/>Access · Rewards · Governance]
        T1[Purchase → Access]
        T2[Engagement → Earn]
        T3[Sharing → Rewards]
        T4[Burn → Deflationary]
        T5[Stake → Premium]
        T6[Vote → Influence]
    end

    subgraph "PRODUCTS: Monetization"
        P1[💼 Courses<br/>AI-generated + personalized]
        P2[🛍️ Digital Products<br/>Templates · Tools · Assets]
        P3[🎫 Memberships<br/>Tiered access levels]
        P4[🤝 Consulting<br/>1-on-1 AI sessions]
        P5[🎁 NFTs<br/>Exclusive content/experiences]
    end

    subgraph "GROWTH: Viral Loops"
        V1[📈 Referral System<br/>10% commission]
        V2[🎮 Gamification<br/>Levels · Badges · Quests]
        V3[🌟 UGC Amplification<br/>Best content featured]
        V4[💫 Success Stories<br/>Token appreciation tales]
    end

    subgraph "INTELLIGENCE: Analytics"
        AN[📊 ANALYTICS LAYER]
        AN1[Audience Behavior]
        AN2[Content Performance]
        AN3[Revenue Metrics]
        AN4[Token Economics]
        AN5[Agent Effectiveness]
    end

    %% Creator flows into Knowledge Base
    C --> KB1 & KB2 & KB3 & KB4 & KB5
    KB1 & KB2 & KB3 & KB4 & KB5 --> KB

    %% Knowledge Base powers AI Clone
    KB --> AC1 & AC2 & AC3 & AC4
    AC1 & AC2 & AC3 & AC4 --> AC

    %% AI Clone powers all Business Agents
    AC --> BA1 & BA2 & BA3 & BA4 & BA5
    AC --> BA6 & BA7 & BA8 & BA9 & BA10

    %% Business Agents create content
    BA3 --> CE1 & CE2 & CE3 & CE4 & CE5
    BA6 --> CE1 & CE2 & CE3 & CE4 & CE5
    BA4 --> CE6
    BA5 --> CE6

    %% Content reaches Audience
    CE1 & CE2 & CE3 & CE4 & CE5 & CE6 --> A

    %% AI Clone interacts with Audience
    AC --> A1
    A --> A1 & A2 & A3 & A4 & A5

    %% Audience creates UGC back into system
    A3 --> CE1 & CE2 & CE3 & CE4

    %% Token system powers everything
    T --> T1 & T2 & T3 & T4 & T5 & T6
    T1 --> P1 & P2 & P3 & P4 & P5
    A5 --> T
    T2 --> A
    A3 --> T3

    %% Products generate revenue
    P1 & P2 & P3 & P4 & P5 --> BA8

    %% Viral loops drive growth
    A --> V1 & V2 & V3 & V4
    V1 & V2 & V3 & V4 --> A

    %% Everything feeds Analytics
    A --> AN1
    CE1 & CE2 & CE3 & CE4 & CE5 & CE6 --> AN2
    BA8 --> AN3
    T --> AN4
    BA1 & BA2 & BA3 & BA4 & BA5 & BA6 & BA7 & BA8 & BA9 & BA10 --> AN5
    AN1 & AN2 & AN3 & AN4 & AN5 --> AN

    %% Analytics informs Strategy
    AN --> BA1
    BA1 --> BA2 & BA3 & BA4 & BA5 & BA6 & BA7 & BA8 & BA9

    %% Intelligence Agent optimizes everything
    BA10 --> AC
    BA10 --> BA1 & BA2 & BA3 & BA4 & BA5 & BA6 & BA7 & BA8 & BA9

    %% Feedback to Creator
    AN --> C
    A --> C

    style C fill:#ff6b6b,stroke:#c92a2a,stroke-width:4px,color:#fff
    style AC fill:#4ecdc4,stroke:#0e918c,stroke-width:3px,color:#fff
    style KB fill:#95e1d3,stroke:#38ada9,stroke-width:2px
    style T fill:#ffd93d,stroke:#f3a712,stroke-width:3px
    style A fill:#a8e6cf,stroke:#56ab91,stroke-width:2px
    style AN fill:#dfe4ea,stroke:#747d8c,stroke-width:2px
    
    style BA1 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA2 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA3 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA4 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA5 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA6 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA7 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA8 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA9 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px
    style BA10 fill:#e1bee7,stroke:#8e24aa,stroke-width:1px