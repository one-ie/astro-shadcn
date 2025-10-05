# ONE Platform - Plain English DSL

**For:** Creators, CEOs, Non-technical Founders, AI Agents  
**Purpose:** Describe features in plain English that compiles to working code

---

## Core Concept

Write what you want in plain English. The system builds it.

**Example:**
```
FEATURE: Let fans chat with my AI clone

WHEN a fan sends a message
CHECK they own tokens
GET my AI personality 
SEND message to AI with my personality
SAVE the conversation
GIVE fan 10 tokens as reward
SHOW AI response to fan
```

**That's it.** The system builds the entire feature from this.

---

## The Language

### 1. FEATURE Declaration

Start every feature with what it does:

```
FEATURE: [Simple description of what this does]
```

**Examples:**
```
FEATURE: Create my AI voice clone
FEATURE: Let fans buy tokens
FEATURE: Enroll students in my course
FEATURE: Generate daily Instagram posts
```

### 2. INPUT - What You Need

List what information you need:

```
INPUT:
  - [name]: [what it is]
```

**Examples:**
```
INPUT:
  - creator: which creator this is for
  - video links: list of my videos
  - email: fan's email address
  - token amount: how many tokens to buy
```

### 3. OUTPUT - What You Get Back

List what you get when it's done:

```
OUTPUT:
  - [name]: [what it is]
```

**Examples:**
```
OUTPUT:
  - clone ID: my AI clone
  - voice ID: my cloned voice
  - payment ID: the transaction
  - success: whether it worked
```

### 4. The Flow - Step by Step

Write each step in order using these commands:

#### CHECK - Validate Something

```
CHECK [condition]
  OTHERWISE [what happens if it fails]
```

**Examples:**
```
CHECK creator exists
  OTHERWISE say "Creator not found"

CHECK fan has tokens
  OTHERWISE say "Buy tokens to chat"

CHECK video links are at least 3
  OTHERWISE say "Need 3+ videos for voice clone"
```

#### CREATE - Make Something New

```
CREATE [type] called [name]
  WITH [properties]
```

**Examples:**
```
CREATE ai clone called "John's AI Clone"
  WITH voice ID from previous step
  WITH personality prompt
  WITH active status

CREATE token called "CREATOR"
  WITH total supply of 10 million
  WITH symbol "CRTR"

CREATE course called "Learn AI"
  WITH 12 modules
  WITH price $99
```

#### CONNECT - Link Two Things

```
CONNECT [thing 1] to [thing 2] as [relationship]
```

**Examples:**
```
CONNECT creator to ai clone as owner

CONNECT fan to token as holder

CONNECT student to course as enrolled
```

#### RECORD - Log That Something Happened

```
RECORD [what happened]
  BY [who did it]
  WITH [extra details]
```

**Examples:**
```
RECORD clone created
  BY creator
  WITH voice ID and personality

RECORD tokens purchased
  BY fan
  WITH amount and price

RECORD lesson completed
  BY student
  WITH quiz score 95%
```

#### CALL - Use External Service

```
CALL [service] to [action]
  WITH [parameters]
  SAVE AS [name]
```

**Examples:**
```
CALL ElevenLabs to clone voice
  WITH audio samples from videos
  SAVE AS voice ID

CALL OpenAI to analyze personality
  WITH video transcripts
  WITH social media posts
  SAVE AS personality

CALL Stripe to charge payment
  WITH amount $100
  SAVE AS payment
```

#### GET - Retrieve Something

```
GET [what] WHERE [conditions]
  SAVE AS [name]
```

**Examples:**
```
GET fan's token balance WHERE token is CREATOR
  SAVE AS balance

GET all content WHERE creator owns it
  SAVE AS my content

GET followers WHERE they follow creator
  SAVE AS follower list
```

#### IF - Conditional Logic

```
IF [condition]
  THEN [steps]
  ELSE [other steps]
```

**Examples:**
```
IF balance is greater than 0
  THEN allow chat
  ELSE say "Buy tokens first"

IF payment succeeded
  THEN mint tokens
  ELSE refund payment
```

#### DO TOGETHER - Atomic Operations

```
DO TOGETHER:
  - [step 1]
  - [step 2]
  - [step 3]
  
IF ANY FAIL:
  - [rollback step 1]
  - [rollback step 2]
```

**Examples:**
```
DO TOGETHER:
  - CALL Stripe to charge $100
  - CALL Blockchain to mint 1000 tokens
  - RECORD purchase in database
  
IF ANY FAIL:
  - CALL Stripe to refund
  - CALL Blockchain to burn tokens
  - DELETE purchase record
```

#### WAIT - Pause Execution

```
WAIT [duration]
```

**Examples:**
```
WAIT 24 hours

WAIT 5 minutes

WAIT until payment received
```

#### FOR EACH - Loop Through Items

```
FOR EACH [item] IN [list]
  DO [steps]
```

**Examples:**
```
FOR EACH video IN video links
  DO extract audio samples

FOR EACH student IN course
  DO send progress report

FOR EACH post IN my content
  DO publish to Instagram
```

#### GIVE - Return Result

```
GIVE [results]
```

**Examples:**
```
GIVE clone ID and voice ID

GIVE success message

GIVE payment confirmation
```

#### STREAM - Live Broadcasting

```
STREAM [content] TO [platform]
  WITH [settings]
  MIX WITH AI CLONE [optional]
```

**Examples:**
```
STREAM "Weekly Q&A" TO youtube
  WITH scheduled time 8pm Friday
  MIX WITH AI CLONE for co-hosting

STREAM fitness class TO custom platform
  WITH chat enabled
  WITH recording saved

STREAM podcast episode TO twitch
  WITH AI clone as co-host
  WITH real-time chat moderation
```

#### REFER - Referral System

```
REFER [user] TO [other user]
  REWARD [amount] tokens
  WITH [bonus conditions]
```

**Examples:**
```
REFER fan to new user
  REWARD 100 tokens
  WITH 500 bonus if they purchase course

REFER creator to platform
  REWARD 1000 tokens per month
  WITH revenue share 10%

REFER student to course
  REWARD 50 tokens
  WITH 200 bonus when they complete
```

#### NOTIFY - Send Notifications

```
NOTIFY [user] ABOUT [event]
  VIA [email | sms | push | in_app]
  WITH [content]
```

**Examples:**
```
NOTIFY all students ABOUT new lesson
  VIA email and push
  WITH lesson preview

NOTIFY token holders ABOUT price change
  VIA in_app notification
  WITH current price and trend

NOTIFY community members ABOUT livestream
  VIA email
  WITH stream link and time
```

#### TRACK - Metrics Tracking

```
TRACK [metric] FOR [entity]
  RECORD [value]
  CALCULATE [trend]
```

**Examples:**
```
TRACK views FOR video
  RECORD 10000
  CALCULATE growth rate

TRACK revenue FOR creator
  RECORD daily earnings
  CALCULATE monthly projection

TRACK engagement FOR community
  RECORD messages per day
  CALCULATE active user trend
```

---

## Complete Examples

### Example 1: Create AI Clone

```
FEATURE: Create my AI voice clone from videos

INPUT:
  - creator: which creator this is for
  - video links: list of my videos (at least 3)

OUTPUT:
  - clone ID: my new AI clone
  - voice ID: my cloned voice

FLOW:

CHECK creator exists
  OTHERWISE say "Creator not found"

CHECK video links are at least 3
  OTHERWISE say "Need at least 3 videos to clone your voice"

CALL OpenAI to extract audio from videos
  WITH video links
  SAVE AS audio samples

CALL ElevenLabs to clone voice
  WITH audio samples
  WITH name "Creator's Voice"
  RETRY 3 times if it fails
  TIMEOUT after 5 minutes
  SAVE AS voice ID

CALL OpenAI to analyze personality
  WITH video transcripts
  WITH social media posts
  SAVE AS personality

CREATE ai clone called "Creator's AI Clone"
  WITH voice ID
  WITH personality prompt
  WITH active status
  SAVE AS clone ID

CONNECT creator to clone ID as owner

RECORD clone created
  BY creator
  WITH voice ID
  WITH personality traits

GIVE clone ID and voice ID
```

### Example 2: Token Purchase

```
FEATURE: Let fans buy creator tokens

INPUT:
  - fan: who is buying
  - token: which creator's token
  - amount: how many tokens
  - usd amount: price in dollars

OUTPUT:
  - payment ID: transaction receipt
  - tx hash: blockchain confirmation

FLOW:

CHECK fan exists
  OTHERWISE say "Fan account not found"

CHECK token exists
  OTHERWISE say "Token not found"

CHECK amount is greater than 0
  OTHERWISE say "Amount must be positive"

DO TOGETHER:
  - CALL Stripe to charge payment
      WITH usd amount in cents
      WITH fan's payment method
      SAVE AS payment
  
  - CALL Blockchain to mint tokens
      WITH token contract address
      WITH fan's wallet
      WITH amount
      SAVE AS mint transaction

IF ANY FAIL:
  - CALL Stripe to refund payment
  - CALL Blockchain to burn tokens

RECORD tokens purchased
  BY fan
  WITH amount
  WITH usd amount
  WITH payment ID
  WITH tx hash

GET fan's token balance WHERE token matches
  SAVE AS existing balance

IF existing balance exists
  THEN UPDATE balance to add amount
  ELSE CREATE new balance
    CONNECT fan to token as holder
    WITH balance amount

GIVE payment ID and tx hash
```

### Example 3: Chat with AI Clone

```
FEATURE: Let fans chat with my AI clone

INPUT:
  - fan: who is chatting
  - clone: which AI clone
  - message: what fan said

OUTPUT:
  - response: what AI said back
  - tokens earned: reward for engagement

FLOW:

CHECK fan exists
  OTHERWISE say "Please sign up first"

CHECK clone exists
  OTHERWISE say "AI clone not found"

GET fan's token balance WHERE clone's token
  SAVE AS balance

CHECK balance is greater than 0
  OTHERWISE say "Buy tokens to chat with this creator"

GET last 10 messages
  WHERE fan chatted with clone
  SAVE AS conversation history

CALL OpenAI to search relevant knowledge
  WITH fan's message
  WITH clone's knowledge base
  SAVE AS context

CALL OpenAI to generate response
  WITH clone's personality
  WITH conversation history
  WITH context
  WITH fan's message
  SAVE AS AI response

RECORD clone interaction
  BY fan
  WITH message
  WITH response
  WITH tokens used

UPDATE fan's token balance
  ADD 10 tokens as reward

GIVE AI response and 10 tokens earned
```

### Example 4: ELEVATE Journey

```
FEATURE: Take user through 9-step ELEVATE business journey

INPUT:
  - user: who is going through journey

OUTPUT:
  - completed: whether they finished

FLOW:

STEP 1 Hook:
  CALL OpenAI to generate business analysis
    WITH user's business info
    SAVE AS analysis
  
  RECORD step completed
    WITH step "hook"
    WITH analysis results

WAIT 24 hours

STEP 2 Gift:
  CALL Resend to send insights report
    WITH user's email
    WITH analysis
  
  RECORD step completed
    WITH step "gift"

STEP 3 Identify:
  CALL Stripe to create checkout
    WITH amount $100
    WITH success URL
    WITH cancel URL
    SAVE AS checkout
  
  WAIT until payment received
    TIMEOUT after 7 days
    SAVE AS payment completed
  
  IF payment completed is false
    THEN GIVE completed false and stop here
  
  RECORD step completed
    WITH step "identify"
    WITH paid $100

STEP 4 Engage:
  GIVE user access to workshop
  
  RECORD step completed
    WITH step "engage"

... continue through steps 5-9 ...

GIVE completed true
```

### Example 5: Daily Content Generation

```
FEATURE: Generate and publish daily content automatically

INPUT:
  - creator: which creator

OUTPUT:
  - posts created: how many posts made
  - platforms: where they were published

FLOW:

GET creator's recent content
  WHERE published in last 30 days
  SAVE AS recent content

GET creator's audience insights
  WHERE engagement is high
  SAVE AS top topics

CALL OpenAI to generate content ideas
  WITH recent content
  WITH top topics
  WITH today's date
  SAVE AS content calendar

FOR EACH platform IN Instagram, Twitter, LinkedIn
  DO:
    CALL OpenAI to generate post
      WITH creator's personality
      WITH platform best practices
      WITH content calendar
      SAVE AS post text
    
    CALL OpenAI to generate image
      WITH post text
      SAVE AS post image
    
    CREATE content called "Daily Post"
      WITH post text
      WITH post image
      WITH platform name
      WITH scheduled for 9am
      SAVE AS content
    
    CONNECT creator to content as author
    
    CALL platform API to publish
      WITH content
    
    RECORD content published
      BY creator
      WITH platform
      WITH engagement starts at 0

GIVE posts created 3 and platforms published
```

---

## Advanced Patterns

### Pattern: Error Handling

```
TRY:
  [steps that might fail]

IF IT FAILS:
  [what to do instead]

ALWAYS DO:
  [cleanup steps]
```

**Example:**
```
TRY:
  CALL payment processor
  CALL blockchain
  
IF IT FAILS:
  CALL refund payment
  SEND error notification
  
ALWAYS DO:
  RECORD what happened
  SAVE logs
```

### Pattern: Parallel Operations

```
DO AT SAME TIME:
  - [operation 1]
  - [operation 2]
  - [operation 3]

WAIT FOR ALL TO FINISH
```

**Example:**
```
DO AT SAME TIME:
  - CALL OpenAI to analyze videos
  - CALL OpenAI to analyze posts
  - CALL OpenAI to analyze comments

WAIT FOR ALL TO FINISH

COMBINE all results
```

### Pattern: Retry with Backoff

```
TRY UP TO 3 TIMES:
  [operation]

WAIT 5 seconds BETWEEN TRIES

IF ALL FAIL:
  [fallback]
```

**Example:**
```
TRY UP TO 3 TIMES:
  CALL voice cloning service

WAIT 5 seconds BETWEEN TRIES

IF ALL FAIL:
  USE default voice
  NOTIFY creator about failure
```

### Pattern: Queue and Process Later

```
ADD TO QUEUE:
  [task details]

PROCESS WHEN:
  [condition]
```

**Example:**
```
ADD TO QUEUE:
  Generate 30 days of content

PROCESS WHEN:
  System is not busy
  
NOTIFY creator when done
```

---

## Translation Table

**Plain English → Technical DSL (Hybrid Approach)**

| Plain English | Technical DSL | Type Category |
|---------------|---------------|---------------|
| CREATE ai clone | `{ entity: { type: "ai_clone" } }` | Specific Entity |
| CONNECT creator to clone as owner | `{ connect: { type: "owns" } }` | Specific Connection |
| RECORD clone created | `{ event: { type: "clone_created" } }` | Specific Event |
| RECORD payment completed | `{ event: { type: "payment_event", metadata: { status: "processed" } } }` | Consolidated Event |
| CONNECT via payment | `{ connect: { type: "transacted", metadata: { transactionType: "purchase" } } }` | Consolidated Connection |
| CALL ElevenLabs to clone voice | `{ service: { provider: "elevenlabs", method: "cloneVoice" } }` | Service |
| CHECK creator exists | `{ validate: { creatorId: { exists: true } } }` | Validation |
| GET fan's balance | `{ query: { from: "connections", where: [...] } }` | Query |
| IF balance > 0 | `{ if: { condition: "$balance > 0" } }` | Conditional |
| WAIT 24 hours | `{ wait: "24h" }` | Control Flow |
| DO TOGETHER | `{ atomic: [...] }` | Atomic Operation |
| FOR EACH video | `{ forEach: { array: "$videos" } }` | Loop |

---

## How It Works

**1. Creator writes in Plain English:**
```
FEATURE: Let fans buy my tokens

CHECK fan has valid payment
CALL Stripe to charge $100
CALL Blockchain to mint tokens
RECORD the purchase
GIVE confirmation
```

**2. System validates:**
- Are all entity types valid? (fan, tokens)
- Are all connection types valid? (owns, holds)
- Are all services available? (Stripe, Blockchain)

**3. System compiles to Technical DSL:**
```typescript
{
  feature: "PurchaseTokens",
  flow: [
    { validate: { ... } },
    { service: { provider: "stripe", ... } },
    { service: { provider: "blockchain", ... } },
    { event: { type: "tokens_purchased", ... } },
    { return: { ... } }
  ]
}
```

**4. System generates TypeScript:**
```typescript
export const purchaseTokens = (userId, tokenId, amount) =>
  Effect.gen(function* () {
    // Fully typed, production-ready code
  });
```

**5. Tests auto-generated:**
```typescript
describe("purchaseTokens", () => {
  it("should purchase tokens successfully", async () => {
    // Complete test suite
  });
});
```

**6. Feature deployed:**
- Frontend components created
- Backend functions created
- Database schema updated
- Tests passing
- Ready for users

---

## Why This Works

**For Creators:**
- Write what you want in plain English
- No coding required
- Can read and understand every feature
- Can modify features yourself

**For AI Agents:**
- Unambiguous instructions
- Maps directly to technical DSL
- Validates against ontology
- Generates perfect code every time

**For Developers:**
- Readable specifications
- Generated code is clean and tested
- Can enhance generated code if needed
- System maintains consistency

---

## Quick Reference

**Create Things:**
- CREATE [type] called [name] WITH [properties]

**Connect Things:**
- CONNECT [thing 1] to [thing 2] as [relationship]

**Save Events:**
- RECORD [what happened] BY [who] WITH [details]

**Use Services:**
- CALL [service] to [action] WITH [params] SAVE AS [name]

**Get Data:**
- GET [what] WHERE [conditions] SAVE AS [name]

**Check Conditions:**
- CHECK [condition] OTHERWISE [action]
- IF [condition] THEN [steps] ELSE [steps]

**Control Flow:**
- WAIT [duration]
- FOR EACH [item] IN [list] DO [steps]
- DO TOGETHER: [steps] IF ANY FAIL: [rollback]
- TRY: [steps] IF IT FAILS: [fallback]

**Return Results:**
- GIVE [results]

---

## Examples Library

**Create AI Clone:**
```
CHECK videos exist (3+)
CALL ElevenLabs to clone voice
CALL OpenAI to analyze personality  
CREATE ai clone
CONNECT creator to clone as owner
RECORD clone created
GIVE clone ID
```

**Buy Tokens:**
```
CHECK user has payment method
DO TOGETHER charge payment and mint tokens
RECORD purchase
UPDATE balance
GIVE confirmation
```

**Chat with AI:**
```
CHECK user has tokens
GET conversation history
CALL OpenAI with personality
RECORD interaction
REWARD user with tokens
GIVE response
```

**Enroll in Course:**
```
CHECK course exists
CHECK user not already enrolled
CONNECT user to course as enrolled
RECORD enrollment
GIVE success
```

**Generate Content:**
```
GET creator's style
GET top performing topics
CALL OpenAI to generate post
CREATE content
CONNECT creator to content
RECORD published
GIVE post ID
```

---

**The Plain English DSL makes ONE accessible to everyone while maintaining technical precision.**