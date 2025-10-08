# Sidebar Refactor Plan

## Objective
Refactor the current layout to use shadcn's sidebar-07 pattern - a sidebar that collapses to icons with proper state management.

## Current State Analysis

### Existing Implementation
- **Current Sidebar**: Custom `Sidebar.tsx` with hover-based expansion
  - Fixed at 64px width, expands to 256px on hover
  - Custom CSS transitions and state management
  - No persistent state or keyboard shortcuts

- **Layout Structure**: `Layout.astro` with fixed sidebar positioning
  - Fixed width sidebar container
  - Header with centered logo and Install button
  - Main content area with padding

- **shadcn UI Sidebar Component**: Already installed at `src/components/ui/sidebar.tsx`
  - Complete SidebarProvider with context
  - Multiple sidebar primitives (Header, Footer, Content, Menu, etc.)
  - Built-in state management with cookie persistence
  - Keyboard shortcut support (Cmd/Ctrl + B)
  - Mobile sheet support
  - Collapsible variants: 'icon' | 'offcanvas' | 'none'

### Navigation Configuration
- Site config at `src/config/site.ts` with navigation array
- Icons mapped in current Sidebar.tsx: Home, Book, FileText, Scale
- ModeToggle component in sidebar footer

## Refactor Plan

### Phase 1: Component Structure
1. **Create New App Sidebar Component** (`src/components/app-sidebar.tsx`)
   - Use shadcn sidebar primitives (SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu)
   - Import navigation from site config
   - Map icons from current Sidebar.tsx
   - Add logo in SidebarHeader
   - Add ModeToggle in SidebarFooter
   - Use SidebarMenuButton with tooltips for collapsed state
   - Set `collapsible="icon"` variant

### Phase 2: Layout Integration
2. **Update Layout.astro**
   - Wrap entire layout with SidebarProvider (client:load)
   - Replace current sidebar with new Sidebar component
   - Use SidebarInset for main content area
   - Add SidebarTrigger in header for toggle control
   - Remove fixed width constraints
   - Update responsive classes

### Phase 3: Styling & Theme
3. **Update Global CSS** (`src/styles/global.css`)
   - Add sidebar color tokens to @theme block:
     - `--sidebar-background`
     - `--sidebar-foreground`
     - `--sidebar-border`
     - `--sidebar-accent`
     - `--sidebar-accent-foreground`
     - `--sidebar-ring`
   - Add dark mode overrides in `.dark` class

### Phase 4: State & Behavior
4. **Configure Sidebar Behavior**
   - Default state: expanded (`defaultOpen={true}`)
   - Keyboard shortcut: Cmd/Ctrl + B (built-in)
   - Cookie persistence (built-in)
   - Mobile: Sheet overlay
   - Desktop: Icon collapse with tooltips

### Phase 5: Cleanup
5. **Remove Old Code**
   - Delete old `src/components/Sidebar.tsx`
   - Remove custom CSS variables from global.css
   - Clean up Layout.astro responsive classes

## Implementation Details

### Key Components to Use
```typescript
// From shadcn sidebar.tsx
- SidebarProvider       // Wrapper with context
- Sidebar               // Main sidebar container
- SidebarHeader         // Top section (logo)
- SidebarContent        // Scrollable content area
- SidebarFooter         // Bottom section (theme toggle)
- SidebarMenu           // Navigation list
- SidebarMenuItem       // List item
- SidebarMenuButton     // Clickable nav button
- SidebarTrigger        // Toggle button for header
- SidebarInset          // Main content wrapper
```

### Expected Structure
```astro
<SidebarProvider client:load>
  <Sidebar collapsible="icon">
    <SidebarHeader>Logo</SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        {navigation.map(item => (
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={item.title}>
              <Icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
    <SidebarFooter>ModeToggle</SidebarFooter>
  </Sidebar>

  <SidebarInset>
    <header>
      <SidebarTrigger />
      <div>Logo & Actions</div>
    </header>
    <main>
      <slot />
    </main>
    <footer>...</footer>
  </SidebarInset>
</SidebarProvider>
```

## Benefits of New Implementation

### User Experience
- ✅ Persistent collapse state (cookies)
- ✅ Keyboard shortcut (Cmd/Ctrl + B)
- ✅ Icon tooltips when collapsed
- ✅ Smooth transitions with proper animations
- ✅ Mobile-friendly sheet overlay
- ✅ Accessible (ARIA attributes, keyboard nav)

### Developer Experience
- ✅ Uses battle-tested shadcn primitives
- ✅ Less custom code to maintain
- ✅ Better TypeScript types
- ✅ Consistent with shadcn patterns
- ✅ Built-in state management

### Performance
- ✅ No hover-based calculations
- ✅ CSS-based transitions
- ✅ Proper React state management
- ✅ Optimized for SSR (Astro + React 19)

## Testing Checklist
- [ ] Sidebar expands/collapses on toggle
- [ ] Keyboard shortcut works (Cmd/Ctrl + B)
- [ ] State persists on page reload
- [ ] Tooltips show when collapsed
- [ ] Mobile view shows sheet overlay
- [ ] Active route highlights correctly
- [ ] Theme toggle works in footer
- [ ] Logo switches appropriately
- [ ] Install button remains functional
- [ ] No layout shift on state change
- [ ] Smooth transitions in all states
- [ ] Dark mode styling looks correct

## Files to Modify
1. `src/components/app-sidebar.tsx` (create new)
2. `src/layouts/Layout.astro` (major refactor)
3. `src/styles/global.css` (add sidebar tokens)
4. `src/components/Sidebar.tsx` (delete after migration)

## Rollback Plan
If issues occur, the git history contains the working hover-based sidebar implementation that can be restored.
