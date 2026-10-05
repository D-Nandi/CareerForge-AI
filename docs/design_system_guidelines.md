# CareerForge AI — Design System & Responsive Layout Guidelines

> **Purpose**: This guideline establishes unbreakable responsive design rules, atomic layout patterns, and defensive CSS practices across all screen sizes (320px to 4K displays). Every engineer and agent must adhere to these standards to eliminate visual collisions, ragged baselines, and layout breakages.

---

## 1. Root Cause Analysis of Recent Visual Regressions

### Regression 1: Stepper / Wizard Footer Collisions
- **Symptom**: In multi-step intake flows (e.g. Career Roadmap Step 5), the step indicator (`Step 5 of 5`) and the action button (`⚡ Generate Career Roadmap`) overlapped into each other.
- **Root Cause**: The container used `display: flex; justify-content: space-between; align-items: center;` without a defined `gap`, without `flex-wrap: wrap`, and without a responsive stacking breakpoint. When the submit button expanded from "Continue →" (110px) to "⚡ Generate Career Roadmap" (260px) in a constrained card container (~400px–500px), space-between exhausted available whitespace and forced items into the same coordinate space.
- **Systemic Solution**: Introduce an official `.wizard-footer` atom with guaranteed `gap: 16px`, responsive `flex-wrap`, and mobile column-stacking (`@media (max-width: 520px)`).

### Regression 2: Multi-Level, Ragged Navigation Bar
- **Symptom**: On medium-to-large laptop screens (1024px–1280px), multi-word navbar links ("ATS Checker", "Career Roadmap", "Interview Prep", "Salary Calculator") wrapped into two lines while single-word links ("Templates", "Pricing", "Blog", "FAQ") stayed on one line. This created a jagged, unaligned navbar with items floating at uneven vertical baselines.
- **Root Cause**:
  1. Missing `white-space: nowrap` on `.nav-links a`.
  2. Fixed desktop gap of `32px` across 9 distinct nav items, causing total desktop nav width to exceed 1450px.
  3. Too low responsive collapse breakpoint (`max-width: 720px`). Screens between 720px and 1240px experienced cramped layouts.
  4. Missing vertical centering (`align-items: center` and line-height normalization) on nav items and links.
- **Systemic Solution**:
  1. Enforce `white-space: nowrap;` and `display: flex; align-items: center;` across all navigation links.
  2. Use fluid gap scaling: `gap: clamp(12px, 1.6vw, 28px);`.
  3. Set navbar collapse breakpoint to `1080px` (or streamline secondary links into organized dropdowns/menus).
  4. Normalize baseline heights so logos, breadcrumbs, links, theme toggles, and CTA buttons share an identical vertical center line.

### Regression 3: Gauge & Adjacent Text Collision
- **Symptom**: In the Career Roadmap readiness card, the red circular score gauge overlapped directly onto the target role badge and title.
- **Root Cause**:
  1. `.score-circle` had `overflow: visible;`, while `.score-circle svg` was hardcoded to `width: 150px; height: 150px;` in CSS.
  2. When the HTML placed `.score-circle` inside an inline `width: 120px; height: 120px;` box, the parent container only accounted for 120px, but the SVG child extended 150px (bursting 30px out to the right).
  3. Sibling text was placed with only a 20px gap, meaning the SVG drew 10px directly over the text.
  4. `.score-circle` lacked `flex-shrink: 0;`, making it vulnerable to compression inside flex rows.
- **Systemic Solution**:
  1. SVG must always scale dynamically to container: `.score-circle svg { width: 100%; height: 100%; display: block; }`.
  2. Provide standardized sizing classes: `.score-circle-sm` (90px), `.score-circle-md` (120px), `.score-circle-lg` (150px).
  3. Always set `flex-shrink: 0;` on visual circular gauges.
  4. Always set `min-width: 0;` on the text sibling in any flex row.
  5. Stack vertically on screens `< 640px` (`flex-direction: column; align-items: center; text-align: center;`).

---

## 2. Standardized Responsive Breakpoints

Always use the following standardized media query breakpoints across all stylesheets:

| Breakpoint Name | Viewport Width | Typical Devices | Navigation / Layout State |
|---|---|---|---|
| **Desktop XL** | `>= 1280px` | 1080p, 1440p, 4K monitors | Full desktop layout, maximum gap |
| **Desktop / Laptop** | `1024px – 1279px` | 13"–15" Laptops, iPad Pro landscape | Fluid gaps, streamlined nav items |
| **Tablet** | `768px – 1023px` | Tablets portrait, split-screen desktop | Mobile drawer active, 2-column grids |
| **Mobile** | `480px – 767px` | Standard smartphones | Single-column cards, full-width buttons |
| **Small Mobile** | `< 480px` | Compact smartphones (iPhone SE) | Condensed padding (12px–16px), compact typography |

```css
/* Standard Breakpoints Token Map */
@media (max-width: 1200px) { /* Fluid desktop adjustments */ }
@media (max-width: 1080px) { /* Primary nav switches to mobile drawer */ }
@media (max-width: 768px)  { /* Tablet layout: grids collapse to 1 or 2 cols */ }
@media (max-width: 520px)  { /* Wizard footers, card headers stack vertically */ }
@media (max-width: 400px)  { /* Ultra-compact screens */ }
```

---

## 3. Unbreakable Defensive CSS Rules

### Rule 1: No Unprotected Horizontal Flex Rows
Whenever two or more interactive or text elements sit side-by-side in a flex container:
1. **Always specify an explicit `gap`** (never rely on space-between alone for collision safety).
2. **Prevent flex crush**: Any fixed-size visual element (avatar, icon, badge, gauge) must declare `flex-shrink: 0;`.
3. **Prevent flex blowout**: Any text container adjacent to a fixed element must declare `min-width: 0;` and appropriate wrapping.
4. **Always allow wrapping or stacking**: Include `flex-wrap: wrap;` or a mobile media query that sets `flex-direction: column`.

```css
/* ✅ CORRECT: Defensive Flex Pattern */
.composite-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.composite-visual {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
}
.composite-content {
  flex: 1 1 0;
  min-width: 0; /* Prevents overflow truncation bug */
}
@media (max-width: 640px) {
  .composite-row {
    flex-direction: column;
    text-align: center;
  }
}
```

### Rule 2: Single-Line Navigation Rule
1. **All navbar links must declare `white-space: nowrap;`**. Text wrapping inside a top-level navbar link is strictly prohibited.
2. All navbar elements (logo, links, icons, toggles, buttons) must share a common vertical leveling:
   ```css
   .nav-links {
     display: flex;
     align-items: center;
     height: 100%;
   }
   .nav-links li, .nav-links a {
     display: inline-flex;
     align-items: center;
     line-height: 1;
     white-space: nowrap;
   }
   ```
3. When the sum of navbar links exceeds available viewport space, the layout must collapse into the mobile drawer at `1080px`, not squeeze and wrap onto multiple lines.

### Rule 3: Dynamic SVG Sizing
1. Never hardcode pixel dimensions in CSS rules targeting SVG children (e.g. `svg { width: 150px; }`).
2. Sizing must be controlled by the parent container component:
   ```css
   .score-circle {
     position: relative;
     width: 150px;
     height: 150px;
     flex-shrink: 0;
   }
   .score-circle svg {
     width: 100%;
     height: 100%;
     display: block;
     transform: rotate(-90deg);
   }
   ```
3. Use standardized size modifier classes:
   - `.score-circle-sm`: 80px × 80px (Dashboard chips, preview cards)
   - `.score-circle-md`: 120px × 120px (Tool results headers)
   - `.score-circle-lg`: 150px × 150px (Hero score gauges, full-page scans)

### Rule 4: Wizard / Stepper Footers
All multi-step forms, intake cards, and modal footers must use the standard `.wizard-footer` atom:
```html
<div class="wizard-footer">
  <button type="button" class="btn btn-ghost" id="btnPrev">← Back</button>
  <span class="step-indicator-pill" id="stepLabel">Step 5 of 5</span>
  <button type="button" class="btn btn-primary" id="btnNext">Generate Roadmap →</button>
</div>
```
```css
.wizard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.step-indicator-pill {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-muted);
  background: var(--surface2);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  white-space: nowrap;
}
@media (max-width: 520px) {
  .wizard-footer {
    flex-direction: column-reverse;
    gap: 12px;
    align-items: stretch;
  }
  .wizard-footer .btn {
    width: 100%;
    justify-content: center;
  }
  .step-indicator-pill {
    text-align: center;
  }
}
```

---

## 4. UI Quality Assurance Checklist

Before committing any layout or page:
- [ ] **No multi-line nav links**: Resize viewport continuously from 1440px down to 320px. Ensure nav links never wrap into 2 lines.
- [ ] **No element collisions**: Verify button text expansion (e.g. "Continue →" to "⚡ Generate Career Roadmap") causes zero collisions with neighboring text or indicators.
- [ ] **Gauge containment**: Verify score circle SVGs never bleed or overflow outside their container boundary.
- [ ] **Mobile stacking**: At 375px viewport, all composite rows (gauge + text, wizard footers, dual-button CTAs) stack cleanly with proper vertical spacing (12px–18px).
- [ ] **Vertical leveling**: All navbar items line up on the exact same horizontal center axis.
