# Layout Architecture

## Core Structure

The layout system is organized around a central configuration structure:

```
/1/
  ├── 1.json       # Global configuration
  ├── 1.md         # Base prompt template
  └── 1.ts         # Zod schema definition
```

## Base Configuration (/1/1.json)

Core configuration file that defines site-wide defaults:

```json
{
  "business": {
    "title": string,
    "description": string,
    "metaKeywords": string[]
  },
  "contact": {
    "openingHours": string[],
    "social": {
      "twitter": string,
      "facebook": string,
      "instagram": string
    }
  },
  "brand": {
    "colors": {
      "primary": string,
      "secondary": string,
      "accent": string
    },
    "fonts": {
      "heading": string,
      "body": string
    }
  },
  "layout": {
    "showLeft": boolean,
    "showRight": boolean,
    "showTop": boolean,
    "showBottom": boolean,
    "rightSize": "Full" | "Half" | "Quarter" | "Closed"
  },
  "ai": {
    "provider": string,
    "model": string,
    "temperature": number,
    "maxTokens": number,
    "welcome": {
      "message": string,
      "suggestions": Array<{
        "label": string,
        "prompt": string
      }>
    }
  },
  "navigation": {
    "items": Array<{
      "title": string,
      "path": string,
      "icon": string
    }>,
    "footerText": string
  }
}
```

## State Management (src/stores/layout.ts)

Type-safe layout state management with persistence:

```typescript
import { atom } from 'nanostores';
import { z } from 'zod';

// Zod schema for validation
const LayoutStateSchema = z.object({
  showLeft: z.boolean(),
  showTop: z.boolean(),
  showRight: z.boolean(),
  showBottom: z.boolean(),
  rightSize: z.enum(['Full', 'Half', 'Quarter', 'Closed'])
});

export type LayoutState = z.infer<typeof LayoutStateSchema>;
export type RightSizeType = LayoutState['rightSize'];

const defaultLayout: LayoutState = {
  showLeft: true,
  showTop: true,
  showRight: false,
  showBottom: true,
  rightSize: 'Closed'
};

// Store with schema validation
const layoutStore = atom<LayoutState>(defaultLayout, {
  start(listener) {
    const saved = localStorage.getItem('layoutPreference');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const result = LayoutStateSchema.safeParse(parsed);
        if (result.success) {
          listener(result.data);
        }
      } catch (e) {
        localStorage.removeItem('layoutPreference');
      }
    }
    
    return () => {};
  }
});

// Layout actions
export const layoutActions = {
  toggle(panel: keyof Pick<LayoutState, 'showLeft' | 'showTop' | 'showRight' | 'showBottom'>) {
    layoutStore.set({ 
      ...layoutStore.get(), 
      [panel]: !layoutStore.get()[panel] 
    });
  },

  setRightSize(size: RightSizeType) {
    const current = layoutStore.get();
    layoutStore.set({
      ...current,
      showRight: size !== 'Closed',
      rightSize: size
    });
  },

  handleResize() {
    if (typeof window !== 'undefined') {
      const updateSize = () => {
        const current = layoutStore.get();
        if (current.rightSize === 'Full' && window.innerWidth < 768) {
          layoutActions.setRightSize('Half');
        }
      };
      
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }
};

// Automatic state persistence
layoutStore.subscribe(state => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('layoutPreference', JSON.stringify(state));
  }
});
```

## Layout Initialization (src/components/LayoutInit.tsx)

Component for managing layout state and transitions:

```typescript
import { useEffect } from 'react';
import { layoutStore, layoutActions } from '../stores/layout';
import { useStore } from '@nanostores/react';

const sizeClasses = {
  Full: 'w-full',
  Half: 'w-1/2',
  Quarter: 'w-80',
  Closed: 'w-0'
};

export function LayoutInit() {
  const state = useStore(layoutStore);

  useEffect(() => {
    // Initialize responsive handling
    const cleanupResizeHandler = layoutActions.handleResize();
    return () => cleanupResizeHandler?.();
  }, []);

  useEffect(() => {
    // Update DOM elements using class transitions
    const updateElements = () => {
      const elements = {
        leftSidebar: document.getElementById('left-sidebar'),
        topHeader: document.getElementById('top-header'),
        bottomFooter: document.getElementById('bottom-footer'),
        rightPanel: document.getElementById('right-panel')
      };

      if (elements.leftSidebar) {
        elements.leftSidebar.classList.toggle('hidden', !state.showLeft);
      }
      
      if (elements.topHeader) {
        elements.topHeader.classList.toggle('hidden', !state.showTop);
      }
      
      if (elements.bottomFooter) {
        elements.bottomFooter.classList.toggle('hidden', !state.showBottom);
      }
      
      if (elements.rightPanel) {
        elements.rightPanel.classList.toggle('hidden', !state.showRight);
        Object.values(sizeClasses).forEach(cls => 
          elements.rightPanel.classList.remove(cls)
        );
        elements.rightPanel.classList.add(sizeClasses[state.rightSize]);
      }
    };

    requestAnimationFrame(updateElements);
  }, [state]);

  return null;
}
```

## Layout Component (src/layouts/Layout.astro)

Main layout component with full configuration support:

```astro
---
import { Sidebar } from "../components/Sidebar";
import { MyThread, ThreadWelcome } from "@assistant-ui/react";
import "../styles/global.css";
import { LayoutInit } from "../components/LayoutInit";
import config from "/1/1.json";

interface Props {
  title: string;
  description?: string;
  children: any;
}

const { 
  title,
  description = config.business.description
} = Astro.props;

const preconnectUrls = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="preconnect" href="/" crossorigin="anonymous">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    {preconnectUrls.map(url => (
      <link rel="preconnect" href={url} crossorigin="anonymous" />
    ))}
    
    <title>{title}</title>

    <script is:inline>
      const theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList[theme === 'dark' ? 'add' : 'remove']('dark');
    </script>
  </head>
  <body class="min-h-screen bg-background font-sans antialiased">
    <div class="flex h-screen optimize-gpu">
      <!-- Left Navigation -->
      {config.layout.showLeft && (
        <nav 
          id="left-sidebar"
          aria-label="Main navigation"
          class="w-[80px] shrink-0 border-r transition-all bg-background"
        >
          <Sidebar navigation={config.navigation.items} client:load />
        </nav>
      )}
      
      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0">
        {config.layout.showTop && (
          <header 
            id="top-header"
            aria-label="Main header"
            class="h-16 border-b flex items-center px-6 gap-4 bg-background"
          >
            <button 
              id="toggle-left"
              aria-label="Toggle navigation"
              class="p-2 hover:bg-accent rounded-lg"
              on:click={() => layoutActions.toggle('showLeft')}
            >
              ≡
            </button>
            <div class="flex-1"></div>
            <button 
              id="toggle-right"
              aria-label="Toggle chat"
              class="p-2 hover:bg-accent rounded-lg"
              on:click={() => layoutActions.toggle('showRight')}
            >
              ☰
            </button>
          </header>
        )}
        
        <!-- Page Content -->
        <article class="flex-1 overflow-auto p-6">
          <slot />
        </article>

        {config.layout.showBottom && (
          <footer 
            id="bottom-footer"
            aria-label="Main footer"
            class="h-12 border-t flex items-center px-6 text-sm text-muted-foreground bg-background"
          >
            {config.navigation.footerText}
          </footer>
        )}
      </main>

      <!-- Right Chat Panel -->
      {config.layout.showRight && (
        <aside 
          id="right-panel"
          aria-label="Chat interface"
          class="border-l flex flex-col transition-all bg-background"
          style={`width: ${getPanelWidth(config.layout.rightSize)}`}
        >
          <div class="p-4 flex justify-end gap-2 border-b">
            <button 
              id="right-full"
              aria-label="Full width chat"
              class="p-2 hover:bg-accent rounded-lg"
              on:click={() => layoutActions.setRightSize('Full')}
            >
              ⬜
            </button>
            <button 
              id="right-half"
              aria-label="Half width chat"
              class="p-2 hover:bg-accent rounded-lg"
              on:click={() => layoutActions.setRightSize('Half')}
            >
              ½
            </button>
            <button 
              id="right-quarter"
              aria-label="Quarter width chat"
              class="p-2 hover:bg-accent rounded-lg"
              on:click={() => layoutActions.setRightSize('Quarter')}
            >
              ❏
            </button>
            <button 
              id="right-close"
              aria-label="Close chat"
              class="p-2 hover:bg-accent rounded-lg"
              on:click={() => layoutActions.setRightSize('Closed')}
            >
              ✕
            </button>
          </div>
          
          <MyThread client:load>
            <ThreadWelcome class="aui-thread-welcome-suggestion-container">
              {config.ai.welcome.suggestions.map((suggestion) => (
                <ThreadWelcome.Suggestion 
                  prompt={suggestion.prompt}
                  class="bg-primary/10 hover:bg-primary/20 text-primary-foreground"
                >
                  {suggestion.label}
                </ThreadWelcome.Suggestion>
              ))}
            </ThreadWelcome>
          </MyThread>
        </aside>
      )}
    </div>

    <LayoutInit client:load />
  </body>
</html>
```

## Styles (src/styles/global.css)

```css
/* Panel Transitions */
#left-sidebar,
#right-panel {
  transition: width 0.3s ease, transform 0.3s ease;
}

.aui-thread-welcome-suggestion-container {
  transition: opacity 0.2s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  #right-panel {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    z-index: 50;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  }
  
  .aui-thread-welcome-suggestion-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  #left-sidebar,
  #right-panel,
  .aui-thread-welcome-suggestion-container {
    transition: none;
  }
}
```

## Key Features

1. **Configuration System**
   - Global config at /1/1.json
   - Type-safe with Zod schemas
   - Page-specific overrides

2. **State Management**
   - Persistent layout preferences
   - Type-safe actions
   - Responsive handling

3. **Layout Components**
   - Semantic HTML structure
   - ARIA accessibility
   - Clean component organization

4. **Styling**
   - Smooth transitions
   - Mobile responsiveness
   - Dark mode support

5. **Performance**
