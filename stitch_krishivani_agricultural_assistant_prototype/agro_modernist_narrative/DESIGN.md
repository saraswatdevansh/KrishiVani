---
name: Agro-Modernist Narrative
colors:
  surface: '#f8faf8'
  surface-dim: '#d8dad9'
  surface-bright: '#f8faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f2'
  surface-container: '#eceeec'
  surface-container-high: '#e6e9e7'
  surface-container-highest: '#e1e3e1'
  on-surface: '#191c1b'
  on-surface-variant: '#41493e'
  inverse-surface: '#2e3130'
  inverse-on-surface: '#eff1ef'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2a6b2c'
  primary: '#00450d'
  on-primary: '#ffffff'
  primary-container: '#1b5e20'
  on-primary-container: '#90d689'
  inverse-primary: '#91d78a'
  secondary: '#286b33'
  on-secondary: '#ffffff'
  secondary-container: '#abf4ac'
  on-secondary-container: '#2e7238'
  tertiary: '#00450d'
  on-tertiary: '#ffffff'
  tertiary-container: '#055f18'
  on-tertiary-container: '#86d881'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf4a4'
  primary-fixed-dim: '#91d78a'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#0c5216'
  secondary-fixed: '#abf4ac'
  secondary-fixed-dim: '#90d792'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#07521d'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d982'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#f8faf8'
  on-background: '#191c1b'
  surface-variant: '#e1e3e1'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  touch-target-min: 48px
  margin-mobile: 16px
  margin-desktop: 32px
  gutter: 16px
  card-padding: 20px
---

## Brand & Style

The design system is engineered for the modern agricultural landscape, balancing deep-rooted trust with technological advancement. The brand personality is **dependable, clear, and empowering**, specifically tailored to the needs of farmers who require immediate, legible, and actionable information in high-utility environments.

The visual style follows a **Modern Corporate** approach with a focus on **High-Utility Accessibility**. It prioritizes extreme clarity through generous whitespace, a structured grid, and high-contrast elements. By blending organic color tones with clean, geometric interfaces, the design system evokes a sense of "digital nature"—a professional tool that feels at home in the field and the office. 

Key attributes include:
- **High-Contrast Legibility:** Optimized for outdoor visibility.
- **Farmer-Centric Ergonomics:** Large touch targets and intuitive iconography for ease of use during physical labor.
- **Trust-Based Stability:** A grounded color palette that avoids fleeting trends in favor of long-term reliability.

## Colors

The palette is anchored in agricultural vitality. The **Primary Green (#1B5E20)** provides the weight of authority and deep environmental roots, used for primary actions and brand identifiers. The **Secondary Green (#81C784)** acts as a supportive highlight, used for secondary buttons, success states, and progress indicators.

The background is a tinted **Neutral White (#F9FBF9)**, specifically chosen to reduce screen glare compared to pure white, making it more comfortable for extended use in sunlight. Text is rendered in a near-black green-charcoal to maintain high contrast while feeling softer than absolute black.

## Typography

This design system utilizes **Inter** for its exceptional legibility and systematic character. The scale is intentionally generous to accommodate users in varying environmental conditions. 

- **Headlines:** Bold and assertive to allow for quick scanning of data-heavy agricultural reports.
- **Body Text:** Set at a minimum of 16px for standard content to ensure accessibility.
- **Information Density:** For data tables or logistics, `body-md` is the standard. For instructional content, `body-lg` is preferred to reduce cognitive load.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid with Fixed Safety Margins**. It is designed with a **Mobile-First** priority, ensuring that all primary interactions are reachable within the "thumb zone."

- **Grid:** A 4-column grid for mobile, transitioning to a 12-column grid for tablet/desktop.
- **Touch Targets:** A strict adherence to a 48px minimum height/width for all interactive elements (buttons, inputs, navigation items) to accommodate larger hands or gloved use.
- **Rhythm:** An 8px linear scale (8, 16, 24, 32, 48, 64) creates a predictable vertical rhythm and consistent grouping of related information.

## Elevation & Depth

To maintain a "farmer-friendly" professional aesthetic, elevation is communicated through **Tonal Layering** and **Soft Ambient Shadows**. 

1.  **Level 0 (Base):** The neutral background (#F9FBF9).
2.  **Level 1 (Cards):** Pure white (#FFFFFF) surfaces with a subtle, 4px blur shadow (5% opacity) to provide a soft lift without looking "cluttered."
3.  **Level 2 (Overlays/Modals):** A more pronounced shadow (12px blur, 10% opacity) used for language selectors and bottom navigation to pull them into the foreground.
4.  **Flat Borders:** In place of heavy shadows, 1px borders in a soft neutral (#E0E4E0) are used to define boundaries in data-heavy views.

## Shapes

The shape language is **Rounded**, conveying a friendly and approachable feel while remaining professional. 

- **Primary Radius:** 16px (1rem) for all main containers and cards to soften the interface.
- **Secondary Radius:** 8px (0.5rem) for input fields and smaller buttons.
- **Interactive Elements:** Buttons and tags may use the "Pill" style for distinct visual differentiation from static cards.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Primary Green (#1B5E20) with white text. 48px minimum height.
- **Secondary Action:** Outlined in Primary Green or light green tint background (#E8F5E9).
- **Input Fields:** 16px rounded corners, 1px border, with clear floating labels to assist during data entry.

### Cards
- Standardized 16px rounded corners.
- Padding should be 20px to ensure text doesn't feel cramped.
- Used for crop status, weather alerts, and market prices.

### Bottom Navigation
- A persistent bar at the bottom of the screen.
- Icons should be 24px, accompanied by 10px labels for clarity.
- Active state uses a "pill" background highlight or a primary green tint.

### Language Selector
- A prominent, easily accessible trigger (usually in the Top Bar or Profile).
- Uses a "Bottom Sheet" pattern on mobile to allow for easy thumb-selection of local languages (e.g., Hindi, Punjabi, Marathi, English).
- Language names should be written in their native script (e.g., "हिन्दी", "English").

### Chips & Badges
- Used for category filtering (e.g., "Wheat", "Rice", "Organic").
- Pill-shaped with a 24px height.