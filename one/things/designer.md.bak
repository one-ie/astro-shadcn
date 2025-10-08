# Design Agent Guide

This document provides visual design principles for AI agents working on the ONE Platform. Use these techniques to create minimal, sophisticated, and visually refined interfaces.

## Core Philosophy

**Minimal yet sophisticated** means:
- Every design decision has a purpose
- Visual hierarchy guides the user naturally
- Consistency creates polish
- White space creates breathing room
- Subtle details elevate the experience

## The 5 Design Pillars

### 1. Grid Alignment

**Principle**: Everything aligns to a grid structure.

**Implementation in Our Stack**:
```astro
<!-- Use Tailwind's grid system -->
<div class="grid grid-cols-12 gap-4">
  <aside class="col-span-3"><!-- Sidebar --></aside>
  <main class="col-span-6"><!-- Content --></main>
  <aside class="col-span-3"><!-- Meta --></aside>
</div>
```

**Rules for Agents**:
- Use Tailwind's 12-column grid as the base structure
- Align all major elements to grid lines (use `col-span-*`)
- Keep left alignment for sidebar navigation and content
- Use consistent gutters (`gap-4`, `gap-6`, `gap-8`)
- Anchor to vertical grid lines for crisp, scannable layouts

**Common Patterns**:
```astro
<!-- 3-column layout (like Medium example) -->
<div class="grid grid-cols-[240px_1fr_240px] gap-8">
  <nav><!-- Left sidebar --></nav>
  <article><!-- Main content --></article>
  <aside><!-- Right sidebar --></aside>
</div>

<!-- Modular grid (like MoMA example) -->
<div class="grid grid-cols-3 gap-6">
  <div class="col-span-1"><!-- Text block --></div>
  <div class="col-span-2"><!-- Image --></div>
</div>
```

### 2. Typography System

**Principle**: Consistent, hierarchical type styles differentiate content types.

**Implementation in Our Stack**:
```typescript
// Our typography scale (already in Tailwind)
text-xs    // 12px - Labels, meta info
text-sm    // 14px - Secondary content
text-base  // 16px - Body text
text-lg    // 18px - Subheadings
text-xl    // 20px - Section titles
text-2xl   // 24px - Page titles
text-3xl   // 30px - Hero headlines
```

**Rules for Agents**:
- Limit to 1-2 font families per interface (we use sans by default)
- Use font-weight variations: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- Use color variations: `text-foreground` (primary), `text-muted-foreground` (secondary)
- Apply styles consistently: same type style = same content type

**Type Style Patterns**:
```astro
<!-- Primary heading -->
<h1 class="text-3xl font-bold text-foreground">Essential for Women</h1>

<!-- Section heading with differentiation -->
<h2 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
  Written By
</h2>

<!-- Body text with comfortable reading -->
<p class="text-base leading-7 text-foreground">
  Comfortable line height (leading-7 = 1.75 line-height)
</p>

<!-- Secondary information -->
<span class="text-sm text-muted-foreground">Published Feb 20, 2025</span>
```

**Spacing for Readability**:
- Body text: Use `leading-7` (28px) for comfortable reading
- Headings: Use `leading-tight` or `leading-snug`
- Short line length: Max `max-w-2xl` (672px) for paragraphs

### 3. Color Palette

**Principle**: Refined, limited color palettes create sophistication.

**Implementation in Our Stack**:
```css
/* Our semantic color system (HSL format) */
--color-background    /* White/Dark bg */
--color-foreground    /* Black/White text */
--color-card          /* Card backgrounds */
--color-muted         /* Subtle backgrounds */
--color-accent        /* Highlight color */
--color-destructive   /* Error states */
--color-primary       /* Brand color */
--color-secondary     /* Secondary actions */
```

**Rules for Agents**:
- **Monochromatic palettes** (easiest): Use variations of one hue
  ```astro
  <div class="bg-background">
    <div class="bg-muted"><!-- Subtle variation --></div>
  </div>
  ```

- **Complementary colors**: Use for contrast (like Ritual's blue + yellow)
  ```astro
  <div class="text-primary"><!-- Content (blue) --></div>
  <button class="bg-accent text-accent-foreground"><!-- CTA (yellow) --></button>
  ```

- **Foreground/background distinction**: Create depth with subtle color shifts
  ```astro
  <div class="bg-muted"><!-- Background area --></div>
  <div class="bg-card"><!-- Foreground area (stands out) --></div>
  ```

**Color Selection Guidelines**:
- Avoid pure primary colors (too harsh)
- Adjust saturation slightly from default (more sophisticated)
- Use semantic names: `bg-background`, `text-foreground` (not arbitrary values)
- Match saturation levels: light gray with white, dark gray with black

**Hierarchy with Color**:
```astro
<!-- Primary text (highest contrast) -->
<h1 class="text-foreground">Main Title</h1>

<!-- Secondary text (medium contrast) -->
<p class="text-muted-foreground">Supporting information</p>

<!-- Tertiary text (lowest contrast) -->
<span class="text-muted-foreground/60">Meta information</span>
```

### 4. Visual Hierarchy

**Principle**: Scale, color, and spacing guide the eye naturally.

**Implementation in Our Stack**:

**A. Scale to Create Hierarchy**:
```astro
<!-- Hero section: 30-50% larger than other elements -->
<h1 class="text-4xl md:text-5xl font-bold">
  What Exercise Looks Like in Japan
</h1>

<!-- Primary content: Base size -->
<p class="text-base">Article content...</p>

<!-- Secondary info: Smaller -->
<span class="text-sm text-muted-foreground">Reading time: 5 min</span>
```

**B. Visual Weight**:
```astro
<!-- Heaviest weight = most important -->
<button class="bg-primary text-primary-foreground font-semibold">
  Add to Cart
</button>

<!-- Medium weight = secondary action -->
<button class="bg-secondary text-secondary-foreground">
  Learn More
</button>

<!-- Lightest weight = tertiary action -->
<button class="text-muted-foreground hover:text-foreground">
  Cancel
</button>
```

**C. Proximity for Grouping**:
```astro
<div class="space-y-8">
  <!-- Group 1: Minimal space between related items -->
  <section class="space-y-2">
    <h2 class="text-xl font-semibold">Your Top Genres</h2>
    <div class="flex gap-2">
      <Card>Pop</Card>
      <Card>Rock</Card>
    </div>
  </section>

  <!-- Group 2: More space separates groups -->
  <section class="space-y-2">
    <h2 class="text-xl font-semibold">Popular Podcasts</h2>
    <div class="flex gap-2">
      <Card>Educational</Card>
      <Card>True Crime</Card>
    </div>
  </section>
</div>
```

**Rules for Agents**:
- Identify the most important element first
- Make it 30-50% larger than secondary elements
- Use less space within groups (`space-y-2`)
- Use more space between groups (`space-y-8`)
- Apply bold/color to the most important content

### 5. Consistency & Polish

**Principle**: Consistent visual treatment creates cohesion and polish.

**Implementation in Our Stack**:

**A. Consistent Spacing Units**:
```astro
<!-- Base unit: 4px (Tailwind's default) -->
<div class="space-y-4"><!-- 16px between elements --></div>
<div class="space-y-8"><!-- 32px between sections (2x base) --></div>
<div class="space-y-12"><!-- 48px between major sections (3x base) --></div>
```

**Rules**:
- Use multiples of base unit (4, 8, 12, 16, 24, 32, 48, 64)
- Keep spacing consistent across pages
- Use same spacing for same element types

**B. Consistent Component Treatment**:
```typescript
// Example: All cards use same structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content with consistent padding
  </CardContent>
</Card>
```

**C. Fixed Heights for Polish**:
```astro
<!-- Buttons: Same height across interface -->
<button class="h-10 px-4">Action</button>
<button class="h-10 px-6">Primary Action</button>

<!-- Input fields: Same height as buttons -->
<input class="h-10 px-3" />
```

**D. Icon Consistency**:
```astro
<!-- Use same icon library (Lucide) -->
<!-- Keep same size (w-4 h-4 or w-5 h-5) -->
<!-- Keep same stroke width -->
import { ChevronRight, Plus, X } from 'lucide-react';

<ChevronRight class="w-4 h-4" />
<Plus class="w-4 h-4" />
<X class="w-4 h-4" />
```

**E. Visual System Rules**:
- Same element type = same visual treatment (always)
- Same spacing between similar elements
- Same color for same content type
- Same font weight for same hierarchy level

## Fundamental Design Principles

These are the universal principles that govern all visual design. Master these to create interfaces that feel naturally balanced, engaging, and polished.

### 1. Balance

**Principle**: Balance provides structure and stability through distribution of visual weight.

Like physics, design balance creates a sense of equilibrium. Elements can be balanced symmetrically (mirrored) or asymmetrically (different but equal weight).

**Types of Balance**:

**A. Symmetrical Balance** (quiet, stable, formal):
```astro
<!-- Centered, mirrored layout -->
<div class="flex flex-col items-center text-center max-w-2xl mx-auto">
  <h1 class="text-3xl font-bold">Welcome</h1>
  <p class="mt-4">Centered content creates calm</p>
  <button class="mt-6">Get Started</button>
</div>
```

**B. Asymmetrical Balance** (dynamic, engaging, modern):
```astro
<!-- Different elements, equal visual weight -->
<div class="grid grid-cols-[2fr_1fr] gap-6">
  <!-- Large image (2 units) balances with... -->
  <img src="hero.jpg" alt="Hero" class="w-full h-96 object-cover" />

  <!-- ...small colorful text block (1 unit) -->
  <div class="bg-primary text-primary-foreground p-6 flex items-center">
    <div>
      <h2 class="text-2xl font-bold">Bold Statement</h2>
      <p class="mt-2">Color and typography add visual weight</p>
    </div>
  </div>
</div>
```

**Rules for Agents**:
- Symmetrical balance: Use for formal, professional, calm interfaces
- Asymmetrical balance: Use for dynamic, engaging, modern interfaces
- Balance visual weight, not just size (color, bold, images add weight)
- Test balance by imagining a vertical axis through the center

### 2. Contrast

**Principle**: Contrast makes elements stand out through differences in size, color, weight, or position.

Use contrast to create attention-grabbing, scannable interfaces.

**Implementation**:
```astro
<!-- Contrast in size -->
<div class="space-y-2">
  <h1 class="text-5xl font-bold">Large Headline</h1>
  <p class="text-sm text-muted-foreground">Small supporting text</p>
</div>

<!-- Contrast in color -->
<div class="bg-background p-6">
  <p class="text-foreground">Normal text blends in</p>
  <button class="bg-primary text-primary-foreground font-semibold px-6 py-3">
    High contrast CTA stands out
  </button>
</div>

<!-- Contrast in weight -->
<div class="space-y-1">
  <h3 class="font-bold">Bold headline draws attention</h3>
  <p class="font-normal">Regular text recedes</p>
</div>

<!-- Contrast in position -->
<div class="flex justify-between items-start">
  <div class="max-w-lg">
    <p>Text on left...</p>
  </div>
  <button class="shrink-0">...contrasts with button on right</button>
</div>
```

**Rules for Agents**:
- Use contrast for CTAs (primary actions should have highest contrast)
- Use contrast for hierarchy (important = high contrast, less important = low contrast)
- Don't overuse: Too much contrast creates visual chaos
- Ensure accessibility: Check WCAG contrast ratios (4.5:1 for body text, 3:1 for large text)

### 3. Repetition and Rhythm

**Principle**: Repetition creates consistency, familiarity, and visual rhythm.

"All good things come in threes" — repetition in design creates patterns that users recognize and trust.

**Implementation**:
```astro
<!-- Repeating card pattern -->
<div class="grid grid-cols-3 gap-6">
  {features.map(feature => (
    <!-- Same structure, same spacing, same styling -->
    <Card>
      <CardHeader>
        <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <feature.icon class="w-6 h-6 text-primary" />
        </div>
        <CardTitle class="mt-4">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground">{feature.description}</p>
      </CardContent>
    </Card>
  ))}
</div>

<!-- Rhythmic spacing pattern -->
<div class="space-y-12">
  {sections.map(section => (
    <!-- Consistent spacing creates rhythm -->
    <section class="space-y-4">
      <h2 class="text-2xl font-bold">{section.title}</h2>
      <p class="text-muted-foreground">{section.description}</p>
    </section>
  ))}
</div>
```

**Rules for Agents**:
- Repeat visual patterns for related elements (same structure for all cards)
- Use consistent spacing to create rhythm (space-y-4, space-y-8, space-y-12)
- Repeat colors consistently (primary for all CTAs, muted for all secondary text)
- Break repetition purposefully to create emphasis

### 4. Proximity

**Principle**: Elements close together are perceived as related. Grouping declutters and creates relationships.

**Implementation**:
```astro
<!-- GOOD: Tight grouping shows relationship -->
<div class="space-y-8">
  <!-- Group 1: Label + value are related (tight spacing) -->
  <div class="space-y-1">
    <label class="text-sm font-medium">Email Address</label>
    <input type="email" class="w-full" />
    <p class="text-xs text-muted-foreground">We'll never share your email</p>
  </div>

  <!-- Group 2: More space separates different groups -->
  <div class="space-y-1">
    <label class="text-sm font-medium">Password</label>
    <input type="password" class="w-full" />
  </div>
</div>

<!-- BAD: Equal spacing everywhere (no clear grouping) -->
<div class="space-y-4">
  <label>Email</label>
  <input type="email" />
  <p>Help text</p>
  <label>Password</label>
  <input type="password" />
</div>
```

**Rules for Agents**:
- Related items: Less space (space-y-1, space-y-2)
- Different groups: More space (space-y-6, space-y-8, space-y-12)
- Use proximity before visual styling (grouping with space is cleaner than borders)

### 5. Emphasis

**Principle**: Focus attention on specific elements through contrast, color, size, or proportion.

Emphasis works closely with hierarchy to direct the user's eye.

**Implementation**:
```astro
<!-- Emphasis through size -->
<div class="text-center">
  <h1 class="text-5xl font-bold">Big Statement</h1>
  <p class="text-base mt-4">Supporting detail in normal size</p>
</div>

<!-- Emphasis through color -->
<div class="space-y-4">
  <p class="text-muted-foreground">Normal paragraph...</p>
  <p class="text-primary font-semibold">Important callout in brand color!</p>
  <p class="text-muted-foreground">More normal text...</p>
</div>

<!-- Emphasis through visual weight -->
<button class="bg-primary text-primary-foreground font-bold px-8 py-4 shadow-lg">
  Primary CTA (heavy emphasis)
</button>
<button class="bg-secondary text-secondary-foreground px-4 py-2">
  Secondary action (less emphasis)
</button>
<button class="text-muted-foreground hover:text-foreground">
  Tertiary action (minimal emphasis)
</button>

<!-- Emphasis through isolation (white space) -->
<div class="py-24 px-6 bg-muted text-center">
  <h2 class="text-3xl font-bold max-w-2xl mx-auto">
    Surrounded by space, this headline demands attention
  </h2>
</div>
```

**Rules for Agents**:
- Only emphasize what's truly important (1-2 items per screen)
- Use multiple emphasis techniques together (size + color + weight)
- Don't emphasize everything (it creates visual noise)

### 6. Proportion and Scale

**Principle**: Relationships between element sizes create visual weight and importance.

Critical for print and responsive design.

**Implementation**:
```astro
<!-- Proportional scaling for responsive design -->
<div class="space-y-4">
  <!-- Desktop: Large -->
  <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold">
    Scales proportionally across breakpoints
  </h1>

  <!-- Body text maintains readable proportion -->
  <p class="text-base md:text-lg">
    Body text scales slightly, maintaining hierarchy
  </p>
</div>

<!-- Golden ratio proportions (1:1.618) -->
<div class="grid grid-cols-[1fr_1.618fr] gap-6">
  <aside>Sidebar (1 unit)</aside>
  <main>Content (1.618 units) — visually pleasing proportion</main>
</div>

<!-- Fixed proportions for visual consistency -->
<div class="grid grid-cols-3 gap-4">
  {items.map(item => (
    <!-- Maintain aspect ratio -->
    <div class="aspect-square bg-card rounded-lg p-4">
      <h3 class="text-lg font-semibold">{item.title}</h3>
    </div>
  ))}
</div>
```

**Rules for Agents**:
- Maintain proportions across screen sizes (use responsive text sizes)
- Use aspect ratios for images/cards (`aspect-square`, `aspect-video`)
- Consider golden ratio (1:1.618) for pleasing proportions
- Test at multiple viewport sizes

### 7. Variety

**Principle**: Add visual interest through controlled variation while maintaining consistency.

Even established brands add variety to stay fresh.

**Implementation**:
```astro
<!-- Variety in card backgrounds (while keeping structure consistent) -->
<div class="grid grid-cols-3 gap-6">
  <Card class="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
    <CardHeader>
      <CardTitle>Analytics</CardTitle>
    </CardHeader>
  </Card>

  <Card class="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
    <CardHeader>
      <CardTitle>Reports</CardTitle>
    </CardHeader>
  </Card>

  <Card class="bg-gradient-to-br from-green-500 to-green-700 text-white">
    <CardHeader>
      <CardTitle>Settings</CardTitle>
    </CardHeader>
  </Card>
</div>

<!-- Variety in icon shapes (while keeping size consistent) -->
<div class="flex gap-4">
  <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
    <Icon class="w-6 h-6" />
  </div>
  <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
    <Icon class="w-6 h-6" />
  </div>
  <div class="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
    <Icon class="w-6 h-6" />
  </div>
</div>
```

**Rules for Agents**:
- Add variety to prevent monotony
- Vary color, not structure (keep layouts consistent)
- Limit variety to 2-3 variations maximum
- Use variety for special launches or feature highlights

## Visual Design Elements

Beyond principles, these fundamental elements are the building blocks of every interface.

### 1. Line

**Principle**: Lines create connections, lead the eye, and establish focal points.

Lines can be simple dividers or primary design elements.

**Implementation**:
```astro
<!-- Horizontal dividers -->
<div class="space-y-4 divide-y divide-border">
  <section class="pt-4 first:pt-0">Content section 1</section>
  <section class="pt-4">Content section 2</section>
</div>

<!-- Vertical dividers -->
<div class="flex divide-x divide-border">
  <div class="px-4 first:pl-0">Column 1</div>
  <div class="px-4">Column 2</div>
</div>

<!-- Lines as primary design element -->
<button class="border-2 border-primary px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">
  Outlined Button
</button>

<!-- Decorative lines -->
<div class="relative">
  <h2 class="text-2xl font-bold">Section Title</h2>
  <div class="absolute bottom-0 left-0 w-12 h-1 bg-primary"></div>
</div>

<!-- Lines for focus/connection -->
<div class="border-l-4 border-primary pl-4">
  <p class="text-lg">This quote is connected to the brand via colored line</p>
</div>
```

**Rules for Agents**:
- Use `border-border` for subtle dividers
- Use `divide-y` or `divide-x` for consistent separation
- Make CTA buttons stand out with border thickness variations
- Use colored lines sparingly for emphasis

### 2. Shape

**Principle**: Different shapes convey different meanings and emotions.

**Shape Psychology**:
- Circles/curves = organic, natural, friendly, approachable
- Rectangles/squares = structured, organized, professional, stable
- Triangles = dynamic, energetic, directional

**Implementation**:
```astro
<!-- Rounded shapes (friendly, approachable) -->
<div class="space-y-4">
  <button class="rounded-full bg-primary text-primary-foreground px-6 py-2">
    Friendly Button
  </button>

  <Card class="rounded-2xl">
    <CardContent>Soft, approachable card</CardContent>
  </Card>
</div>

<!-- Angular shapes (professional, precise) -->
<div class="space-y-4">
  <button class="rounded-none bg-primary text-primary-foreground px-6 py-2">
    Sharp, Precise Button
  </button>

  <Card class="rounded-sm">
    <CardContent>Professional, structured card</CardContent>
  </Card>
</div>

<!-- Mixed shapes for visual interest -->
<div class="flex gap-4">
  <!-- Circular avatar -->
  <img src="avatar.jpg" alt="User" class="w-12 h-12 rounded-full" />

  <!-- Rounded rectangle badge -->
  <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
    New
  </span>

  <!-- Sharp icon container -->
  <div class="w-10 h-10 bg-muted rounded flex items-center justify-center">
    <Icon class="w-5 h-5" />
  </div>
</div>
```

**Rules for Agents**:
- Friendly/consumer: Use `rounded-lg`, `rounded-xl`, `rounded-full`
- Professional/B2B: Use `rounded`, `rounded-sm`, or `rounded-none`
- Keep border radius consistent across similar elements
- Mix shapes purposefully (avatar = circle, cards = rounded rectangle)

### 3. Texture

**Principle**: Texture adds depth and tactile quality, even in flat design.

Create texture through patterns, gradients, or visual effects.

**Implementation**:
```astro
<!-- Subtle gradient texture -->
<div class="bg-gradient-to-br from-background to-muted p-8">
  <h2>Subtle depth through gradient</h2>
</div>

<!-- Grain/noise texture (using CSS) -->
<style>
  .texture-grain {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  }
</style>

<div class="texture-grain bg-card p-8">
  <p>Subtle grain adds tactile quality</p>
</div>

<!-- Pattern texture -->
<div class="bg-card bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0_/_0.05)_1px,_transparent_0)] bg-[length:24px_24px] p-8">
  <h3>Dot pattern background</h3>
</div>

<!-- Shadow for depth texture -->
<Card class="shadow-lg">
  <CardContent>
    Shadow creates depth, mimicking physical cards
  </CardContent>
</Card>
```

**Rules for Agents**:
- Use textures subtly (5-10% opacity maximum)
- Gradients should be subtle (same hue, different lightness)
- Don't texture everything (texture = emphasis)
- Test accessibility (texture shouldn't obscure text)

## Typography Deep Dive

Typography is one of the most important elements. Master these details to create professional, readable interfaces.

### Fine-Tuning Typography

#### Alignment

**Principle**: Align text to create balance and guide users down the page.

**Alignment Types**:
```astro
<!-- Left-aligned (default, best for readability) -->
<div class="text-left">
  <p>Most readable for long-form text. Eye easily finds next line.</p>
</div>

<!-- Center-aligned (use for short text, headlines, quotes) -->
<div class="text-center max-w-2xl mx-auto">
  <h1 class="text-4xl font-bold">Centered Headline</h1>
  <p class="mt-4">Short, impactful statement</p>
</div>

<!-- Right-aligned (use sparingly, for special effect) -->
<div class="text-right">
  <p class="text-sm text-muted-foreground">Meta info or timestamps</p>
</div>

<!-- Justified (avoid for web) -->
<!-- DON'T use text-justify — creates awkward spacing on web -->
```

**Rules for Agents**:
- Body text: Always left-aligned (or right-aligned for RTL languages)
- Headlines: Center-align for impact, left-align for scannability
- Short quotes/callouts: Center-align
- Never use justified text on web (creates rivers of white space)

#### Kerning

**Principle**: Adjust space between specific letter pairs for visual consistency.

Most fonts have built-in kerning, but large headlines may need manual adjustment.

**Problem Letter Pairs**:
- W + h, W + a (e.g., "What")
- T + o, T + a (e.g., "Today")
- V + a, V + o (e.g., "Value")
- Y + e, Y + o (e.g., "Yes")

**Implementation**:
```astro
<!-- Tailwind doesn't expose kerning directly, but you can use CSS -->
<style>
  .logo-text {
    font-kerning: normal; /* Enable automatic kerning */
  }

  /* For manual adjustments in critical text */
  .headline-kerned {
    letter-spacing: -0.02em; /* Slight tightening for large text */
  }
</style>

<h1 class="text-6xl font-bold headline-kerned">
  WHAT'S NEW
</h1>
```

**Rules for Agents**:
- Enable kerning for all text (it's on by default)
- Only manually adjust for headlines 32px+
- Tighten large headlines slightly (letter-spacing: -0.02em)
- Test with actual text, not Lorem Ipsum

#### Leading (Line Height)

**Principle**: Proper line spacing improves readability and creates comfortable text blocks.

**Optimal Leading**:
- Body text (16px): 1.5–1.75 line height = `leading-6` or `leading-7`
- Headlines: 1.1–1.3 line height = `leading-tight` or `leading-snug`
- Small text (12-14px): 1.4–1.6 line height = `leading-5` or `leading-6`

**Implementation**:
```astro
<!-- Body text: Generous leading for comfortable reading -->
<p class="text-base leading-7">
  Long-form content needs breathing room. Leading-7 (1.75 line height)
  makes it easy to find the next line and reduces eye strain.
</p>

<!-- Headlines: Tight leading for impact -->
<h1 class="text-5xl font-bold leading-tight">
  Large Headlines Need
  Tighter Line Spacing
</h1>

<!-- Small text: Balanced leading -->
<p class="text-sm leading-6">
  Small text needs enough leading to prevent ascenders and descenders
  from colliding while staying compact.
</p>

<!-- Multi-line buttons: Centered text with balanced leading -->
<button class="px-6 py-3 leading-snug">
  Button Text That
  Wraps to Two Lines
</button>
```

**Rules for Agents**:
- Increase leading for longer line lengths
- Decrease leading for shorter line lengths
- Headings: `leading-tight` (1.25) or `leading-snug` (1.375)
- Body: `leading-relaxed` (1.625) or `leading-7` (1.75)

#### Tracking (Letter Spacing)

**Principle**: Overall spacing between all letters in a word or line.

**Implementation**:
```astro
<!-- Tight tracking for large headlines -->
<h1 class="text-6xl font-bold tracking-tight">
  IMPACT
</h1>

<!-- Normal tracking for body text -->
<p class="text-base tracking-normal">
  Default tracking works for most body text
</p>

<!-- Wide tracking for small caps -->
<h3 class="text-xs font-semibold uppercase tracking-wide">
  Section Label
</h3>

<!-- Widest tracking for emphasis -->
<p class="text-sm uppercase tracking-widest">
  S P A C E D   O U T
</p>
```

**Tracking Scale** (Tailwind):
- `tracking-tighter`: -0.05em
- `tracking-tight`: -0.025em
- `tracking-normal`: 0em (default)
- `tracking-wide`: 0.025em
- `tracking-wider`: 0.05em
- `tracking-widest`: 0.1em

**Rules for Agents**:
- ALL CAPS text: Always increase tracking (`tracking-wide` or `tracking-wider`)
- Large headlines (48px+): Decrease tracking (`tracking-tight`)
- Small labels (12px): Increase tracking (`tracking-wide`)
- Body text: Keep normal tracking

### Weight and Style

**Principle**: Use font weights and styles consistently to create hierarchy.

**Font Weight Scale**:
```typescript
font-thin        // 100
font-extralight  // 200
font-light       // 300
font-normal      // 400 (default)
font-medium      // 500
font-semibold    // 600
font-bold        // 700
font-extrabold   // 800
font-black       // 900
```

**Implementation**:
```astro
<!-- Establish hierarchy with weight -->
<div class="space-y-2">
  <h1 class="text-3xl font-bold">Primary Headline (700)</h1>
  <h2 class="text-xl font-semibold">Subheading (600)</h2>
  <p class="text-base font-normal">Body text (400)</p>
  <p class="text-sm font-normal text-muted-foreground">Secondary info (400)</p>
  <p class="text-xs font-medium uppercase tracking-wide">Label (500)</p>
</div>

<!-- Mix weight and style -->
<p class="text-base">
  <span class="font-semibold">Bold text</span> for emphasis,
  <span class="italic">italic text</span> for citations or foreign words,
  <span class="font-normal">regular text</span> for body.
</p>

<!-- Don't over-mix styles -->
<!-- BAD: Too many variations -->
<p class="font-bold italic underline">Don't do this!</p>

<!-- GOOD: Pick one or two -->
<p class="font-bold">Bold</p>
<p class="italic">Italic</p>
```

**Rules for Agents**:
- Limit to 2-3 weights per interface
- Headlines: `font-bold` (700) or `font-semibold` (600)
- Body: `font-normal` (400)
- Labels: `font-medium` (500)
- Use italic sparingly (citations, emphasis, placeholders)
- Never combine more than 2 styles (e.g., don't use bold + italic + underline)

### Letter Case

**Principle**: Different cases serve different purposes.

**Case Types**:
```astro
<!-- Title Case: Headings, page titles -->
<h1 class="text-3xl font-bold">
  Design Principles for Modern Interfaces
</h1>

<!-- Sentence case: Body text, descriptions -->
<p>
  This is how we write most content. Only the first word is capitalized.
</p>

<!-- ALL CAPS: Labels, buttons, emphasis (use sparingly) -->
<button class="text-sm uppercase tracking-wide font-semibold">
  Get Started
</button>

<!-- Small caps: Section labels, meta info -->
<h3 class="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
  Written by
</h3>

<!-- all lowercase: Stylistic choice (rare) -->
<div class="text-sm lowercase">
  minimalist aesthetic
</div>
```

**Rules for Agents**:
- Title Case: Use for H1, H2 only
- Sentence case: Use for H3-H6, body text, all descriptions
- ALL CAPS: Use for small text only (labels, buttons < 14px)
- ALL CAPS + `tracking-wide`: Makes letters readable when capitalized
- Avoid ALL CAPS for paragraphs (hard to read, lacks ascenders/descenders)
- Never use ALL CAPS in conversational UI (implies yelling)

### Size and Hierarchy

**Principle**: Establish clear size hierarchy so users know what's important.

**Size Relationships**:
```astro
<!-- Example hierarchy (scale factor: ~1.25x-1.5x) -->
<div class="space-y-4">
  <!-- H1: 48px (3em) -->
  <h1 class="text-5xl font-bold">Main Page Title</h1>

  <!-- H2: 30px (1.875em) -->
  <h2 class="text-3xl font-semibold mt-8">Major Section</h2>

  <!-- H3: 24px (1.5em) -->
  <h3 class="text-2xl font-semibold mt-6">Subsection</h3>

  <!-- H4: 20px (1.25em) -->
  <h4 class="text-xl font-semibold mt-4">Minor Heading</h4>

  <!-- Body: 16px (1em — base) -->
  <p class="text-base">Primary body text at base size</p>

  <!-- Small: 14px (0.875em) -->
  <p class="text-sm text-muted-foreground">Secondary information</p>

  <!-- Extra small: 12px (0.75em) -->
  <p class="text-xs text-muted-foreground">Meta info, labels, captions</p>
</div>

<!-- Responsive sizing -->
<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold">
  Scales up on larger screens
</h1>
```

**Rules for Agents**:
- Start with body text size (16px = `text-base`)
- H1 should be 2-3x body size (`text-4xl` to `text-5xl`)
- Each heading level should be 1.25-1.5x the next level down
- Never skip hierarchy levels (don't go H1 → H3)
- Use responsive sizes for headlines (`text-3xl md:text-4xl lg:text-5xl`)
- Maintain hierarchy at all screen sizes

### Typography Details

#### The Rag

**Principle**: The uneven edge of left/right-aligned text should look natural.

```astro
<!-- GOOD: Natural, balanced rag -->
<div class="max-w-2xl">
  <p class="text-left leading-7">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
    veniam, quis nostrud exercitation ullamco laboris.
  </p>
</div>

<!-- BAD: Awkward rag (too narrow) -->
<div class="max-w-xs">
  <p class="text-left">
    Long words create
    awkward breaks that
    disrupt reading
    rhythm
  </p>
</div>
```

**Rules for Agents**:
- Optimal line length: 40-60 characters (use `max-w-2xl` for ~65 chars)
- Avoid very short or very long lines
- Use `max-w-prose` (65ch) for comfortable reading
- Don't manually break lines (let text wrap naturally)

#### Widows, Orphans, and Danglies

**Definitions**:
- **Widow**: Single word on last line of paragraph
- **Orphan**: Heading or single line at top of column/page
- **Dangly**: Any lonely word or short line

**Solutions**:
```astro
<!-- Use non-breaking spaces to keep words together -->
<p>
  The CEO of Apple&nbsp;Inc. announced...
  <!-- "Apple Inc." stays together -->
</p>

<!-- Adjust container width to prevent widows -->
<div class="max-w-[42rem]">
  <p>
    Slightly narrower container prevents single-word last lines
    without making content too narrow to read comfortably overall.
  </p>
</div>

<!-- Use line-clamp to truncate and avoid widows -->
<p class="line-clamp-3">
  Long text that gets cut off with ellipsis after 3 lines...
</p>
```

**Rules for Agents**:
- Use non-breaking space (`&nbsp;` or `&#160;`) between:
  - Numbers and units (100&nbsp;px)
  - Names (Mr.&nbsp;Smith)
  - Short words at line end (of&nbsp;the)
- Adjust container width to minimize widows
- For fixed layouts, manually adjust letter-spacing slightly
- Use `line-clamp-*` for preview text

#### Justification

**Principle**: How lines of text align to margins.

```astro
<!-- Left justified (default, best for web) -->
<p class="text-left">
  Left edge aligned, right edge ragged. Best for readability.
</p>

<!-- Right justified (rare, for special effect) -->
<p class="text-right">
  Right edge aligned, left edge ragged. Use for dates, metadata.
</p>

<!-- Center justified (headlines, quotes) -->
<blockquote class="text-center max-w-2xl mx-auto">
  "Centered text for impact and emphasis"
</blockquote>

<!-- Full justified (avoid for web) -->
<!-- Don't use — creates rivers of white space -->
```

**Rules for Agents**:
- Web body text: Always `text-left` (never `text-justify`)
- Headlines: `text-center` or `text-left`
- Metadata: `text-right` or `text-left`
- Never use full justification on web (creates awkward spacing)

### Typography Grammar Rules

#### Hyphens, En Dashes, and Em Dashes

**The Three Dashes**:
- **Hyphen** (-): Compound words, line breaks
- **En Dash** (–): Ranges, connections
- **Em Dash** (—): Sentence breaks, emphasis

**Implementation**:
```astro
<!-- Hyphen: Compound words -->
<p>A well-known example of a three-year-old</p>

<!-- En dash: Ranges (use &ndash; or &#8211;) -->
<p>Pages 10&ndash;20</p>
<p>Monday&ndash;Friday</p>
<p>The New York&ndash;London flight</p>

<!-- Em dash: Sentence breaks (use &mdash; or &#8212;) -->
<p>
  The design&mdash;which took months to perfect&mdash;was finally approved.
</p>

<!-- Don't use double hyphens -->
<p>❌ BAD: The design -- which took months -- was approved.</p>
<p>✅ GOOD: The design&mdash;which took months&mdash;was approved.</p>
```

**HTML Entities**:
```
Hyphen:   -
En dash:  &ndash; or &#8211; or –
Em dash:  &mdash; or &#8212; or —
```

**Rules for Agents**:
- Hyphen: keyboard dash (-)
- En dash: Option+dash (Mac) or Alt+0150 (Windows)
- Em dash: Option+Shift+dash (Mac) or Alt+0151 (Windows)
- Use en dash for ranges: 2020&ndash;2025, 9&ndash;5
- Use em dash for breaks: Design&mdash;the good kind&mdash;takes time
- Don't use spaces around dashes (US style)

### Typography Best Practices

#### 1. Don't Use All Caps for Long Text

```astro
<!-- BAD: Hard to read -->
<p class="uppercase">
  THIS IS A LONG PARAGRAPH WRITTEN IN ALL CAPS. IT'S VERY DIFFICULT
  TO READ BECAUSE ALL THE LETTERS ARE THE SAME HEIGHT. THERE ARE NO
  ASCENDERS OR DESCENDERS TO HELP YOUR EYE DISTINGUISH WORDS.
</p>

<!-- GOOD: Use caps for short labels only -->
<span class="text-xs uppercase tracking-wide font-semibold">
  Label Text
</span>
<p class="text-base">
  Regular sentence case for paragraphs is much easier to read.
</p>
```

#### 2. White Space Is Not Emptiness

```astro
<!-- GOOD: Generous white space -->
<div class="space-y-12 py-24">
  <section class="space-y-6">
    <h2 class="text-3xl font-bold">Feature Title</h2>
    <p class="text-lg text-muted-foreground max-w-2xl">
      Content surrounded by breathing room
    </p>
  </section>
</div>

<!-- BAD: Cramped -->
<div class="space-y-2 py-2">
  <section class="space-y-1">
    <h2>Feature</h2>
    <p>Too tight</p>
  </section>
</div>
```

#### 3. Don't Deform or Stretch Text

```astro
<!-- BAD: Stretched text -->
<h1 class="scale-x-150">Don't Do This</h1>

<!-- BAD: Squished text -->
<p class="scale-y-50">Or This</p>

<!-- GOOD: Use proper font weights and sizes -->
<h1 class="text-5xl font-bold">Proper Sizing</h1>
<h2 class="text-3xl font-semibold">Proper Weight</h2>
```

#### 4. Use Non-Breaking Spaces

```astro
<!-- Keep certain words together -->
<p>
  Launched in&nbsp;2025
  <!-- "in 2025" won't break across lines -->
</p>

<p>
  Cost: $100&nbsp;USD
  <!-- "$100 USD" stays together -->
</p>

<p>
  Chapter&nbsp;5, Page&nbsp;42
  <!-- Numbers stay with their labels -->
</p>
```

**HTML Entities**:
- Non-breaking space: `&nbsp;` or `&#160;`
- Keyboard shortcut: Ctrl+Shift+Space (Windows) or Option+Space (Mac)

#### 5. Limit Line Length

```astro
<!-- GOOD: 40-60 characters per line -->
<article class="max-w-prose mx-auto">
  <p class="text-base leading-7">
    Comfortable line length makes reading effortless. Your eye can easily
    find the beginning of the next line without getting lost.
  </p>
</article>

<!-- Tailwind prose max-widths -->
max-w-prose    // ~65ch (optimal)
max-w-2xl      // ~42rem (good for paragraphs)
max-w-4xl      // ~56rem (good for wider layouts)
```

**Rules for Agents**:
- Body text: `max-w-prose` (65 characters)
- If longer lines: Increase line-height (`leading-8` or `leading-9`)
- Headlines: Can be wider (no max-width needed)
- Mobile: Allow full width, rely on padding

## Advanced Techniques

### Subtle Depth & Shadows

**Principle**: Subtle shadows create depth without distraction.

**Implementation**:
```astro
<!-- Subtle card elevation -->
<div class="bg-card rounded-lg shadow-sm border border-border">
  Card content
</div>

<!-- Elevated card (hover state) -->
<div class="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow">
  Interactive card
</div>

<!-- Focus area (like Superhuman email) -->
<main class="bg-card shadow-lg border border-border">
  Primary content
</main>
<aside class="bg-muted">
  Secondary content (no shadow)
</aside>
```

**Rules for Agents**:
- Use `shadow-sm` for subtle cards
- Use `shadow-md` for interactive elements
- Use `shadow-lg` for focus areas
- Keep light source consistent (shadows fall same direction)
- Limit to 2-3 shadow weights maximum

### Asymmetrical Balance

**Principle**: Dynamic layouts with balanced visual weight.

**Implementation (MoMA-style)**:
```astro
<div class="grid grid-cols-2 gap-6">
  <!-- Left column: Text takes 1 unit -->
  <div class="col-span-1 bg-primary text-primary-foreground p-6">
    <h3 class="text-2xl font-bold">Exhibition Title</h3>
    <p>Description...</p>
  </div>

  <!-- Right column: Image takes 1 unit -->
  <div class="col-span-1">
    <img src="..." alt="..." class="w-full h-full object-cover" />
  </div>
</div>

<!-- Next row: Flip the order -->
<div class="grid grid-cols-2 gap-6">
  <div class="col-span-1">
    <img src="..." alt="..." class="w-full h-full object-cover" />
  </div>
  <div class="col-span-1 bg-accent text-accent-foreground p-6">
    <h3 class="text-2xl font-bold">Another Exhibition</h3>
    <p>Description...</p>
  </div>
</div>
```

**Rules**:
- Alternate left/right placement
- Keep visual weight balanced (colorful text = 1 unit, image = 2 units works)
- Use to create energy and movement

### Symmetrical Balance

**Principle**: Centered, anchored layouts create calm and refinement.

**Implementation (Aesop-style)**:
```astro
<div class="grid grid-cols-3 gap-6">
  <!-- Each column is symmetrical -->
  <div class="text-center">
    <img src="product1.jpg" alt="Product 1" class="mx-auto" />
    <h3 class="mt-4">Product Name</h3>
    <p class="text-muted-foreground">Description</p>
    <button class="mt-4">Add to Cart</button>
  </div>

  <div class="text-center">
    <img src="product2.jpg" alt="Product 2" class="mx-auto" />
    <h3 class="mt-4">Product Name</h3>
    <p class="text-muted-foreground">Description</p>
    <button class="mt-4">Add to Cart</button>
  </div>

  <div class="text-center">
    <img src="product3.jpg" alt="Product 3" class="mx-auto" />
    <h3 class="mt-4">Product Name</h3>
    <p class="text-muted-foreground">Description</p>
    <button class="mt-4">Add to Cart</button>
  </div>
</div>
```

**Rules**:
- Use `text-center` and `mx-auto` for centering
- Keep all elements at same baseline
- Same height for images and buttons
- Use for product grids, portfolios, galleries

### Meaningful Imagery

**Principle**: Images add value, not decoration.

**Implementation**:
```astro
<!-- Use Astro's Image component for optimization -->
import { Image } from 'astro:assets';
import productImage from '../assets/product.jpg';

<!-- Meaningful product image -->
<Image
  src={productImage}
  alt="Ergonomic desk chair with lumbar support"
  width={600}
  height={400}
  loading="lazy"
  class="rounded-lg object-cover"
/>

<!-- Match background for seamless blend -->
<div class="bg-muted">
  <Image
    src={productImage}
    alt="Product"
    class="bg-muted"
  />
</div>
```

**Rules for Agents**:
- Always add descriptive `alt` text
- Use `object-cover` for consistent aspect ratios
- Match image background to card background
- Crop appropriately (test at different screen sizes)
- Use high-quality images only

## Agent Decision Tree

When improving a design, follow this decision process:

### 1. Assess Layout Structure
```
Q: Is there a clear grid structure?
  → No: Add grid with `grid grid-cols-12 gap-*`
  → Yes: Are all elements aligned to grid lines?
    → No: Align using `col-span-*`
    → Yes: ✓ Grid is good
```

### 2. Assess Typography
```
Q: Is there clear hierarchy (largest → smallest)?
  → No: Identify most important element, make it 30-50% larger
  → Yes: Are type styles consistent for same content types?
    → No: Define type system, apply consistently
    → Yes: ✓ Typography is good
```

### 3. Assess Color
```
Q: Is color palette limited (3-4 colors)?
  → No: Reduce to monochromatic or complementary palette
  → Yes: Do colors create clear hierarchy?
    → No: Use darkest for primary, lightest for tertiary
    → Yes: ✓ Color is good
```

### 4. Assess Spacing
```
Q: Is spacing consistent (multiples of base unit)?
  → No: Normalize to 4px base (space-y-4, space-y-8, etc.)
  → Yes: Does spacing create clear groupings?
    → No: Less space within groups, more between groups
    → Yes: ✓ Spacing is good
```

### 5. Assess Consistency
```
Q: Are same elements treated the same way?
  → No: Define visual system, apply consistently
  → Yes: Are there unnecessary variations?
    → Yes: Remove variations, keep only purposeful differences
    → No: ✓ Consistency is good
```

## Common Design Patterns

### Pattern 1: Blog List (Medium-style)
```astro
<div class="grid grid-cols-[240px_1fr_240px] gap-8 max-w-7xl mx-auto">
  <!-- Left sidebar: Navigation -->
  <nav class="space-y-2">
    <a href="#" class="block text-muted-foreground hover:text-foreground">Home</a>
    <a href="#" class="block text-muted-foreground hover:text-foreground">Topics</a>
  </nav>

  <!-- Main content: Articles -->
  <main class="space-y-12">
    <article class="space-y-4">
      <h2 class="text-3xl font-bold leading-tight">Article Title</h2>
      <p class="text-base leading-7 text-muted-foreground">
        Article excerpt with comfortable line height...
      </p>
      <div class="flex items-center gap-4 text-sm text-muted-foreground">
        <span>5 min read</span>
        <span>Feb 20, 2025</span>
      </div>
    </article>
  </main>

  <!-- Right sidebar: Meta -->
  <aside class="space-y-6">
    <section class="space-y-2">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Written By
      </h3>
      <p class="text-sm">Author Name</p>
    </section>
  </aside>
</div>
```

### Pattern 2: Product Grid (Aesop-style)
```astro
<div class="grid grid-cols-3 gap-6 p-6 bg-muted">
  {products.map(product => (
    <div class="text-center space-y-4 p-6 hover:bg-muted/50 transition-colors">
      <!-- Symmetrical image -->
      <img
        src={product.image}
        alt={product.name}
        class="mx-auto h-48 object-contain"
      />

      <!-- Product info: Same structure for all -->
      <h3 class="text-lg font-semibold">{product.name}</h3>
      <p class="text-sm text-muted-foreground">{product.size}</p>

      <!-- Secondary info: Consistent heights -->
      <div class="space-y-2 text-sm border-t border-border pt-4">
        <div class="flex justify-between">
          <span class="font-medium">Suited to</span>
          <span class="text-muted-foreground">{product.suitedTo}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">Skin feel</span>
          <span class="text-muted-foreground">{product.skinFeel}</span>
        </div>
      </div>

      <!-- Fixed height button -->
      <button class="h-10 w-full bg-primary text-primary-foreground rounded">
        Add to Cart
      </button>
    </div>
  ))}
</div>
```

### Pattern 3: Dashboard Cards (Spotify-style)
```astro
<div class="space-y-8 p-6">
  <!-- Group 1: Minimal internal spacing -->
  <section class="space-y-2">
    <h2 class="text-xl font-semibold">Your Top Genres</h2>
    <div class="grid grid-cols-4 gap-2">
      {topGenres.map(genre => (
        <Card class="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <CardContent class="p-4">
            <h3 class="font-semibold">{genre.name}</h3>
            <img
              src={genre.image}
              alt={genre.name}
              class="absolute bottom-0 right-0 w-20 h-20 object-cover"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  </section>

  <!-- Group 2: More space between groups -->
  <section class="space-y-2">
    <h2 class="text-xl font-semibold">Popular Podcasts</h2>
    <div class="grid grid-cols-4 gap-2">
      {podcasts.map(podcast => (
        <Card class="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent class="p-4">
            <h3 class="font-semibold">{podcast.name}</h3>
            <img
              src={podcast.image}
              alt={podcast.name}
              class="absolute bottom-0 right-0 w-20 h-20 object-cover"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
</div>
```

### Pattern 4: Simple Focus Area (Superhuman-style)
```astro
<div class="grid grid-cols-[240px_1fr_240px] h-screen">
  <!-- Left nav: Muted background -->
  <nav class="bg-muted p-4">
    <ul class="space-y-1">
      <li><a href="#" class="block text-sm text-muted-foreground hover:text-foreground">Inbox</a></li>
      <li><a href="#" class="block text-sm text-muted-foreground hover:text-foreground">Drafts</a></li>
    </ul>
  </nav>

  <!-- Main content: White background + shadow -->
  <main class="bg-background shadow-lg border-x border-border overflow-y-auto">
    <div class="p-6 space-y-6">
      <!-- Large scale for hierarchy -->
      <h1 class="text-3xl font-bold">Closing our deal</h1>

      <div class="space-y-4">
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="uppercase">Feb 20</span>
          <span>•</span>
          <span>from Laura Shea</span>
          <span class="text-green-600 font-semibold">Draft</span>
        </div>

        <p class="text-base leading-7">Email content...</p>
      </div>
    </div>
  </main>

  <!-- Right details: Muted background -->
  <aside class="bg-muted p-4">
    <div class="space-y-4 text-sm">
      <section>
        <h3 class="font-semibold mb-2">Contact Info</h3>
        <p class="text-muted-foreground">Details...</p>
      </section>
    </div>
  </aside>
</div>
```

## Quick Reference: Before/After Checklist

### Before You Generate/Modify a Component

- [ ] What is the hierarchy? (What should users see first?)
- [ ] What is the grid structure? (How many columns?)
- [ ] What is the color palette? (Monochromatic or complementary?)
- [ ] What is the spacing system? (What's the base unit?)
- [ ] What are the groupings? (What belongs together?)

### After You Generate/Modify a Component

**Layout & Structure**:
- [ ] Is everything aligned to a grid?
- [ ] Is there visual balance (symmetrical or asymmetrical)?
- [ ] Does spacing create clear groupings (proximity principle)?
- [ ] Is there enough white space?

**Typography**:
- [ ] Is typography hierarchical and consistent?
- [ ] Is line length 40-60 characters (`max-w-prose`)?
- [ ] Is leading appropriate (body: `leading-7`, headings: `leading-tight`)?
- [ ] Is tracking correct (ALL CAPS uses `tracking-wide`)?
- [ ] Are there no widows, orphans, or danglies?
- [ ] Are proper dashes used (em dash for breaks, en dash for ranges)?
- [ ] Are non-breaking spaces used correctly?

**Color & Contrast**:
- [ ] Is color palette limited and purposeful (2-4 colors)?
- [ ] Is there sufficient contrast for accessibility (4.5:1 body, 3:1 large text)?
- [ ] Does color create clear hierarchy?
- [ ] Do foreground/background colors create depth?

**Visual Elements**:
- [ ] Are lines used purposefully (dividers, emphasis, connection)?
- [ ] Do shapes match the brand tone (rounded = friendly, sharp = professional)?
- [ ] Are textures subtle (5-10% opacity maximum)?
- [ ] Do images add value (not just decoration)?
- [ ] Are shadows subtle and consistent?

**Design Principles**:
- [ ] Is there clear contrast to create attention?
- [ ] Is repetition used to create rhythm and consistency?
- [ ] Is emphasis placed on 1-2 important elements only?
- [ ] Is proportion/scale appropriate for responsive design?
- [ ] Is there controlled variety to prevent monotony?

**Consistency & Polish**:
- [ ] Are same elements treated the same way?
- [ ] Is spacing consistent (multiples of 4px base unit)?
- [ ] Are icon sizes consistent?
- [ ] Are button heights consistent?
- [ ] Does it look minimal yet sophisticated?

## Anti-Patterns (Avoid These)

### ❌ Don't: Use too many colors
```astro
<!-- BAD: Rainbow palette -->
<div class="bg-blue-500 text-yellow-300 border-red-400">
  <button class="bg-green-500 text-purple-700">Click</button>
</div>
```

### ✅ Do: Limit to 2-3 colors
```astro
<!-- GOOD: Monochromatic with accent -->
<div class="bg-background text-foreground border border-border">
  <button class="bg-primary text-primary-foreground">Click</button>
</div>
```

### ❌ Don't: Inconsistent spacing
```astro
<!-- BAD: Random spacing -->
<div class="space-y-3">
  <h2 class="mb-5">Title</h2>
  <p class="mb-7">Content</p>
</div>
```

### ✅ Do: Consistent spacing system
```astro
<!-- GOOD: Multiples of base unit -->
<div class="space-y-4">
  <h2 class="mb-2">Title</h2>
  <p class="mb-4">Content</p>
</div>
```

### ❌ Don't: Misaligned elements
```astro
<!-- BAD: No grid alignment -->
<div class="flex">
  <div class="w-1/3 pl-2">Sidebar</div>
  <div class="w-2/3 pl-5">Content</div>
</div>
```

### ✅ Do: Grid alignment
```astro
<!-- GOOD: Grid with consistent gutters -->
<div class="grid grid-cols-3 gap-6">
  <div>Sidebar</div>
  <div class="col-span-2">Content</div>
</div>
```

### ❌ Don't: Flat hierarchy
```astro
<!-- BAD: Everything same size -->
<h1 class="text-base">Title</h1>
<p class="text-base">Content</p>
<span class="text-base">Meta</span>
```

### ✅ Do: Clear hierarchy
```astro
<!-- GOOD: Scale creates hierarchy -->
<h1 class="text-3xl font-bold">Title</h1>
<p class="text-base">Content</p>
<span class="text-sm text-muted-foreground">Meta</span>
```

### ❌ Don't: Decoration-only images
```astro
<!-- BAD: Random stock photo -->
<img src="abstract-shapes.jpg" alt="Abstract shapes" />
<p>Our platform helps you manage tasks.</p>
```

### ✅ Do: Meaningful imagery
```astro
<!-- GOOD: Screenshot shows actual product -->
<img src="dashboard-screenshot.jpg" alt="Task management dashboard showing completed tasks and analytics" />
<p>Our platform helps you manage tasks.</p>
```

## Conclusion

**The Golden Rule**: Every design decision must have a purpose.

### Quick Reference Summary

**The 5 Design Pillars**:
1. **Grid Alignment** - Everything aligns to structure
2. **Typography System** - Consistent, hierarchical type
3. **Color Palette** - Limited, purposeful (2-4 colors)
4. **Visual Hierarchy** - Scale, color, spacing guide the eye
5. **Consistency & Polish** - Same treatment for same elements

**The 7 Fundamental Principles**:
1. **Balance** - Distribute visual weight (symmetrical or asymmetrical)
2. **Contrast** - Make elements stand out
3. **Repetition** - Create rhythm and consistency
4. **Proximity** - Group related elements
5. **Emphasis** - Focus attention on 1-2 important elements
6. **Proportion/Scale** - Maintain relationships across sizes
7. **Variety** - Add controlled variation to prevent monotony

**The 3 Core Elements**:
1. **Line** - Create connections and lead the eye
2. **Shape** - Convey meaning (circles = friendly, squares = professional)
3. **Texture** - Add subtle depth (5-10% opacity)

**Typography Mastery**:
- **Alignment**: Left for body, center for headlines
- **Leading**: `leading-7` for body, `leading-tight` for headings
- **Tracking**: `tracking-wide` for ALL CAPS, `tracking-tight` for large headlines
- **Weight**: 2-3 weights maximum (bold for headings, normal for body)
- **Line Length**: 40-60 characters (`max-w-prose`)
- **Dashes**: Em dash (—) for breaks, en dash (–) for ranges
- **Non-breaking spaces**: Keep related words together

### When in Doubt

1. **Simplify** - Remove unnecessary elements
2. **Align** - Use the grid
3. **Space** - Create breathing room
4. **Balance** - Distribute visual weight
5. **Contrast** - Make important things stand out
6. **Repeat** - Create rhythm through consistency
7. **Group** - Use proximity for relationships
8. **Emphasize** - Highlight 1-2 key elements only

**Remember**: Minimal yet sophisticated design is about thoughtful reduction, not addition. Start with too little, then add only what's necessary.

**The agent's job**: Apply these principles systematically to create interfaces that are:
- Visually balanced
- Easy to scan
- Comfortable to read
- Pleasant to use
- Professional and polished

Every principle in this guide exists to serve the user. When principles conflict, choose readability and usability over aesthetics.
