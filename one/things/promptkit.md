# Prompt Kit Integration Guide

Comprehensive documentation for integrating [Prompt Kit](https://www.prompt-kit.com/) components with **Vercel AI SDK 5** in this Astro + React project.

## Overview

**Prompt Kit** is a collection of high-quality, customizable React components specifically designed for AI applications. Built on top of shadcn/ui, it provides production-ready UI components for chat interfaces, AI agents, and autonomous assistants.

**Tech Stack:**
- React 19+
- shadcn/ui
- Tailwind CSS v4
- Vercel AI SDK 5
- TypeScript

**GitHub:** [ibelick/prompt-kit](https://github.com/ibelick/prompt-kit)

---

## Installation

### Prerequisites

- Node.js 18+
- React 19+ (✅ Already installed in this project)
- shadcn/ui configured (✅ Already configured)
- Vercel AI SDK 5 installed

### Install Vercel AI SDK 5

```bash
bun add ai @ai-sdk/openai @ai-sdk/anthropic zod
```

### Install Prompt Kit Components

All Prompt Kit components are installed via the shadcn CLI using the component registry:

```bash
# Generic pattern
bunx shadcn@latest add "https://www.prompt-kit.com/c/[COMPONENT_NAME].json"

# Or using the shorthand (if supported)
bunx shadcn@latest add prompt-kit/[component]
```

---

## Available Components

### Core Components

| Component | Description | Registry Dependencies |
|-----------|-------------|----------------------|
| **prompt-input** | Input field for chat interfaces with auto-resize and submit handling | textarea, tooltip |
| **message** | Display chat messages with avatars, markdown, and actions | avatar, tooltip |
| **markdown** | Markdown renderer with syntax highlighting | - |
| **code-block** | Syntax-highlighted code blocks with Shiki | - |
| **chat-container** | Chat interface with intelligent auto-scrolling | - |
| **scroll-button** | Floating button to scroll to bottom | - |
| **loader** | Loading indicators with multiple variants | button |
| **prompt-suggestion** | Suggested prompts UI | - |
| **response-stream** | Display streaming AI responses | - |
| **reasoning** | Display AI reasoning/thinking process | - |
| **file-upload** | File upload component for AI interactions | - |
| **image** | Display images in chat messages | - |
| **jsx-preview** | Preview JSX components in chat | - |
| **tool** | Display AI tool usage/calls | - |
| **source** | Display sources/citations | - |
| **steps** | Display multi-step processes | - |

### NPM Dependencies by Component

**prompt-input:**
```bash
# Installed automatically with shadcn add
bunx shadcn@latest add textarea tooltip
```

**message:**
```bash
bunx shadcn@latest add avatar tooltip
bun add react-markdown remark-gfm remark-breaks shiki marked
```

**code-block:**
```bash
bun add shiki
```

**chat-container:**
```bash
bun add use-stick-to-bottom
```

---

## Component Installation

### Install All Components (Recommended)

```bash
# Core chat components
bunx shadcn@latest add "https://www.prompt-kit.com/c/prompt-input.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/message.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/chat-container.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/loader.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/scroll-button.json"

# Advanced components
bunx shadcn@latest add "https://www.prompt-kit.com/c/prompt-suggestion.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/response-stream.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/reasoning.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/file-upload.json"

# Content components
bunx shadcn@latest add "https://www.prompt-kit.com/c/image.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/jsx-preview.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/tool.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/source.json"
bunx shadcn@latest add "https://www.prompt-kit.com/c/steps.json"
```

### Install Dependencies

```bash
# For message component (markdown + syntax highlighting)
bun add react-markdown remark-gfm remark-breaks shiki marked

# For chat container (auto-scroll behavior)
bun add use-stick-to-bottom

# For AI SDK integration
bun add ai @ai-sdk/openai @ai-sdk/anthropic zod
```

---

## Vercel AI SDK 5 Integration

### Basic Chat Setup

**File:** `src/components/features/ai/AIChat.tsx`

```tsx
"use client";

import { useChat } from "ai/react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";

export function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
    });

  return (
    <div className="flex h-full flex-col">
      {/* Chat Messages */}
      <ChatContainerRoot className="flex-1">
        <ChatContainerContent>
          {messages.map((message) => (
            <Message key={message.id} className="mb-4">
              <MessageAvatar
                src={message.role === "user" ? "/user.png" : "/ai.png"}
                alt={message.role}
                fallback={message.role === "user" ? "U" : "AI"}
              />
              <MessageContent markdown={message.role === "assistant"}>
                {message.content}
              </MessageContent>
            </Message>
          ))}
          <ChatContainerScrollAnchor />
        </ChatContainerContent>
      </ChatContainerRoot>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4">
        <PromptInput
          isLoading={isLoading}
          value={input}
          onValueChange={handleInputChange}
          onSubmit={handleSubmit}
        >
          <PromptInputTextarea placeholder="Ask me anything..." />
          <PromptInputActions>
            <PromptInputAction tooltip="Send message">
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={isLoading || !input.trim()}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </form>
    </div>
  );
}
```

### API Route (Vercel AI SDK 5)

**File:** `src/pages/api/chat.ts`

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages,
    system: "You are a helpful AI assistant.",
  });

  return result.toDataStreamResponse();
};
```

### Streaming Response with Reasoning

**File:** `src/components/features/ai/AIChatWithReasoning.tsx`

```tsx
"use client";

import { useChat } from "ai/react";
import { Message, MessageContent } from "@/components/ui/message";
import { Reasoning } from "@/components/ui/reasoning";
import { ResponseStream } from "@/components/ui/response-stream";

export function AIChatWithReasoning() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat-reasoning",
      streamProtocol: "text",
    });

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message key={message.id}>
          {message.role === "assistant" ? (
            <div>
              {/* Display reasoning if available */}
              {message.metadata?.reasoning && (
                <Reasoning>
                  <ResponseStream content={message.metadata.reasoning} />
                </Reasoning>
              )}

              {/* Display main content */}
              <MessageContent markdown>
                <ResponseStream content={message.content} />
              </MessageContent>
            </div>
          ) : (
            <MessageContent>{message.content}</MessageContent>
          )}
        </Message>
      ))}
    </div>
  );
}
```

### File Upload Integration

**File:** `src/components/features/ai/AIChatWithFiles.tsx`

```tsx
"use client";

import { useChat } from "ai/react";
import { experimental_useObject as useObject } from "ai/react";
import { PromptInput, PromptInputAction } from "@/components/ui/prompt-input";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { PaperclipIcon } from "lucide-react";
import { useState } from "react";

export function AIChatWithFiles() {
  const [files, setFiles] = useState<File[]>([]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat-files",
      body: {
        files: files.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      },
    });

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PromptInput isLoading={isLoading}>
        <PromptInputTextarea value={input} onChange={handleInputChange} />
        <PromptInputActions>
          <PromptInputAction tooltip="Upload files">
            <FileUpload
              onChange={handleFileChange}
              maxFiles={5}
              maxSize={10 * 1024 * 1024} // 10MB
            >
              <Button type="button" variant="ghost" size="icon">
                <PaperclipIcon className="h-4 w-4" />
              </Button>
            </FileUpload>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </form>
  );
}
```

### Tool Calling (Function Calling)

**File:** `src/pages/api/chat-tools.ts`

```typescript
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages,
    tools: {
      getWeather: tool({
        description: "Get the current weather for a location",
        parameters: z.object({
          location: z.string().describe("The city and state"),
        }),
        execute: async ({ location }) => {
          // Call weather API
          return {
            location,
            temperature: 72,
            condition: "Sunny",
          };
        },
      }),
      searchDatabase: tool({
        description: "Search the database for information",
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          // Search database
          return { results: ["Result 1", "Result 2"] };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
};
```

**Display tool calls:**

```tsx
import { Tool } from "@/components/ui/tool";

{message.toolInvocations?.map((toolCall) => (
  <Tool
    key={toolCall.toolCallId}
    name={toolCall.toolName}
    arguments={toolCall.args}
    result={toolCall.result}
  />
))}
```

---

## Astro Integration

### Create Chat Page

**File:** `src/pages/chat.astro`

```astro
---
import Layout from "@/layouts/Layout.astro";
import { AIChat } from "@/components/features/ai/AIChat";
---

<Layout title="AI Chat">
  <div class="container mx-auto h-screen max-w-4xl p-4">
    <h1 class="mb-4 text-2xl font-bold">AI Chat Assistant</h1>
    <div class="h-[calc(100vh-8rem)] rounded-lg border bg-card p-4">
      <AIChat client:load />
    </div>
  </div>
</Layout>
```

### Environment Variables

**File:** `.env`

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Public (accessible in browser)
PUBLIC_AI_MODEL=gpt-4-turbo
```

### Convex Integration (Alternative to API Routes)

**File:** `convex/ai/chat.ts`

```typescript
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const sendMessage = mutation({
  args: {
    message: v.string(),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    // Store message in Convex
    const messageId = await ctx.db.insert("messages", {
      content: args.message,
      role: "user",
      conversationId: args.conversationId,
      createdAt: Date.now(),
    });

    // Get conversation history
    const messages = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("conversationId"), args.conversationId))
      .collect();

    // Note: Streaming requires special handling with Convex
    // Consider using Convex Actions for streaming responses

    return { messageId };
  },
});
```

---

## Component Reference

### PromptInput

Auto-resizing textarea with submit handling and actions.

```tsx
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "@/components/ui/prompt-input";

<PromptInput
  isLoading={false}
  value={input}
  onValueChange={setInput}
  onSubmit={handleSubmit}
  maxHeight={240}
>
  <PromptInputTextarea
    placeholder="Type a message..."
    disableAutosize={false}
  />
  <PromptInputActions>
    <PromptInputAction tooltip="Send" side="top">
      <Button type="submit">Send</Button>
    </PromptInputAction>
  </PromptInputActions>
</PromptInput>
```

**Props:**
- `isLoading?: boolean` - Disable input during loading
- `value?: string` - Controlled value
- `onValueChange?: (value: string) => void` - Change handler
- `maxHeight?: number | string` - Max height for auto-resize
- `onSubmit?: () => void` - Submit handler (Enter key)

### Message

Display chat messages with avatars and actions.

```tsx
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageActions,
  MessageAction,
} from "@/components/ui/message";

<Message>
  <MessageAvatar
    src="/avatar.png"
    alt="User"
    fallback="U"
  />
  <MessageContent markdown={true}>
    **Bold text** and `code`
  </MessageContent>
  <MessageActions>
    <MessageAction tooltip="Copy">
      <Button variant="ghost" size="icon">
        <CopyIcon />
      </Button>
    </MessageAction>
  </MessageActions>
</Message>
```

**Props:**
- `markdown?: boolean` - Render content as markdown
- `src: string` - Avatar image source
- `alt: string` - Avatar alt text
- `fallback?: string` - Fallback text for avatar

### ChatContainer

Auto-scrolling container for chat messages.

```tsx
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";

<ChatContainerRoot className="h-[600px]">
  <ChatContainerContent>
    {messages.map(msg => (
      <Message key={msg.id}>...</Message>
    ))}
    <ChatContainerScrollAnchor />
  </ChatContainerContent>
</ChatContainerRoot>
```

### Markdown & CodeBlock

Render markdown with syntax highlighting.

```tsx
import { Markdown } from "@/components/ui/markdown";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";

<Markdown>
  {`# Heading\n\nParagraph with **bold**`}
</Markdown>

<CodeBlock>
  <CodeBlockCode
    code="const x = 42;"
    language="typescript"
    theme="github-light"
  />
</CodeBlock>
```

---

## Styling with Tailwind v4

All Prompt Kit components use Tailwind v4 with semantic color tokens defined in `src/styles/global.css`.

### Custom Theme Colors

```css
/* src/styles/global.css */
@theme {
  --color-prompt-background: 0 0% 98%;
  --color-prompt-border: 0 0% 90%;
  --color-ai-message: 220 14% 96%;
  --color-user-message: 142 76% 96%;
}

.dark {
  --color-prompt-background: 0 0% 8%;
  --color-prompt-border: 0 0% 20%;
  --color-ai-message: 220 14% 12%;
  --color-user-message: 142 76% 12%;
}
```

### Custom Styles

```tsx
<PromptInput className="bg-[hsl(var(--color-prompt-background))] border-[hsl(var(--color-prompt-border))]">
  ...
</PromptInput>

<MessageContent className="bg-[hsl(var(--color-ai-message))]">
  ...
</MessageContent>
```

---

## Advanced Patterns

### Streaming with Custom Protocol

```typescript
import { streamText, StreamData } from "ai";

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  const data = new StreamData();
  data.append({ type: "metadata", timestamp: Date.now() });

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages,
    onFinish: () => {
      data.append({ type: "finished" });
      data.close();
    },
  });

  return result.toDataStreamResponse({ data });
};
```

### Multi-Modal Chat (Images + Text)

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

const result = streamText({
  model: openai("gpt-4-vision-preview"),
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What's in this image?" },
        {
          type: "image",
          image: new URL("https://example.com/image.jpg")
        },
      ],
    },
  ],
});
```

### Suggested Prompts

```tsx
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";

const suggestions = [
  "Explain quantum computing",
  "Write a poem about AI",
  "Debug this code",
];

<div className="grid grid-cols-2 gap-2">
  {suggestions.map((suggestion) => (
    <PromptSuggestion
      key={suggestion}
      onClick={() => handleInputChange(suggestion)}
    >
      {suggestion}
    </PromptSuggestion>
  ))}
</div>
```

---

## Testing

### Unit Tests

```typescript
import { render, screen } from "@testing-library/react";
import { AIChat } from "@/components/features/ai/AIChat";

describe("AIChat", () => {
  it("renders chat interface", () => {
    render(<AIChat />);
    expect(screen.getByPlaceholderText(/ask me anything/i)).toBeInTheDocument();
  });
});
```

### Integration Tests with Vercel AI SDK

```typescript
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

describe("AI Chat API", () => {
  it("streams responses", async () => {
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages: [{ role: "user", content: "Hello" }],
    });

    const stream = result.toDataStream();
    const chunks: string[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  });
});
```

---

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from "react";
import { Loader } from "@/components/ui/loader";

const AIChat = lazy(() => import("@/components/features/ai/AIChat"));

<Suspense fallback={<Loader />}>
  <AIChat />
</Suspense>
```

### Memoization

```tsx
import { memo } from "react";

const MessageItem = memo(({ message }: { message: Message }) => (
  <Message>
    <MessageContent markdown>{message.content}</MessageContent>
  </Message>
));
```

---

## Deployment

### Environment Variables (Cloudflare Pages)

```bash
# Add to Cloudflare Pages settings
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Build Configuration

```bash
# Build with AI SDK
bun run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=astro-shadcn
```

---

## Troubleshooting

### Common Issues

**1. "Module not found: react-markdown"**
```bash
bun add react-markdown remark-gfm remark-breaks
```

**2. "Shiki syntax highlighting not working"**
```bash
bun add shiki
```

**3. "Auto-scroll not working"**
```bash
bun add use-stick-to-bottom
```

**4. "Type errors with Vercel AI SDK"**
```bash
bun add -D @types/react @types/node
```

### Debug Mode

Enable debug logging for Vercel AI SDK:

```typescript
import { streamText } from "ai";

const result = streamText({
  model: openai("gpt-4-turbo"),
  messages,
  debug: true, // Enable debug logs
});
```

---

## Resources

- **Prompt Kit Docs:** https://www.prompt-kit.com/docs
- **Vercel AI SDK Docs:** https://sdk.vercel.ai/docs
- **shadcn/ui Docs:** https://ui.shadcn.com
- **GitHub:** https://github.com/ibelick/prompt-kit
- **OpenAI SDK:** https://github.com/openai/openai-node
- **Anthropic SDK:** https://github.com/anthropics/anthropic-sdk-typescript

---

## Examples

### Complete Chat Implementation

See `src/components/features/ai/AIChat.tsx` for a full working example with:
- Message history
- Streaming responses
- File uploads
- Tool calling
- Suggested prompts
- Error handling
- Loading states

### API Route Examples

See `src/pages/api/` for:
- `chat.ts` - Basic streaming chat
- `chat-tools.ts` - Function calling
- `chat-files.ts` - File upload handling
- `chat-reasoning.ts` - Reasoning display

---

## Next Steps

1. ✅ Install Vercel AI SDK and dependencies
2. ✅ Install Prompt Kit components
3. ✅ Create API routes for chat
4. ✅ Build chat UI components
5. ✅ Test streaming responses
6. ✅ Add file upload support
7. ✅ Implement tool calling
8. ✅ Deploy to Cloudflare Pages

**Happy building! 🚀**
