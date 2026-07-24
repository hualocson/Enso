# Color Usage in AI Image Generator Project

This document summarizes all color usage found in the project.

## Hex Colors

| Color | Usage Location | Description |
|-------|----------------|-------------|
| #ffffff (white) | App.tsx: bg-white | Background color |
| #e6ebf4 | App.tsx: border-b[#e6ebf4] | Border color |
| #6469ff | App.tsx: bg-[#6469ff], text-white<br>Home.tsx: text-[#6469ff]<br>CreatePost.tsx: bg-[#6469ff]<br>Loader.tsx: fill-[#6469ff]<br>FormField.tsx: focus:ring-[#4649ff], focus-border-[#4649ff] | Primary brand color |
| #f9f8fe | App.tsx: bg-[#f9f8fe] | Background color |
| #222328 | Home.tsx: text-[#222328]<br>CreatePost.tsx: text-[#222328] | Dark text color |
| #666e75 | Home.tsx: text-[#666e75]<br>CreatePost.tsx: text-[#666e75]<br>index.css: background-color: #666e75 | Secondary text color |
| #666375 | CreatePost.tsx: text-[#666375] | Muted text color |
| #10131f | Card.tsx: bg-[#10131f] | Dark background (card hover) |
| #ececf1 | FormField.tsx: bg-[#ececf1] | Light background |
| #ffffff (black) | FormField.tsx: text-black | Text color |
| #4649ff | FormField.tsx: focus:ring-[#4649ff], focus-border-[#4649ff] | Focus ring/border color |

## RGBA Colors

| Color | Usage Location | Description |
|-------|----------------|-------------|
| rgba(0,0,0,0.5) | CreatePost.tsx: bg-[rgba(0,0,0,0.5)] | Semi-transparent black overlay |
| rgba(189,192,207,0.06) | tailwind.config.js: card shadow | Card shadow (inner) |
| rgba(189,192,207,0.2) | tailwind.config.js: card shadow | Card shadow (outer) |
| rgba(189,192,207,0.4) | tailwind.config.js: cardhover shadow | Card hover shadow (outer) |

## Tailwind CSS Classes (Custom Colors from tailwind.config.js)

The project uses Tailwind CSS with the following custom theme extensions:

### Font Family
- `inter`: ['Inter var', 'sans-serif']

### Box Shadow
- `card`: '0 0 1px 0 rgba(189,192,207,0.06),0 10px 16px -1px rgba(189,192,207,0.2)'
- `cardhover`: '0 0 1px 0 rgba(189,192,207,0.06),0 10px 16px -1px rgba(189,192,207,0.4)'

### Screen Breakpoints
- `xs`: '480px'

## Standard Tailwind Colors Used

The project also uses these standard Tailwind CSS color classes:
- `bg-white`
- `text-white`
- `bg-gray-50`
- `border-gray-300`
- `text-gray-900`
- `text-gray-200`
- `bg-green-700`
- `text-green-700` (in Card component for avatar background)

## Summary of Color Usage by Component

### App.tsx
- Background: white (#ffffff)
- Header border: #e6ebf4
- Primary button: #6469ff background with white text
- Main content background: #f9f8fe

### Home.tsx
- Primary accent text: #6469ff
- Main heading: #222328
- Secondary text: #666e75
- Search results text: #666e75
- Search term highlight: #222328

### CreatePost.tsx
- Main heading: #222328
- Subtext: #666e75
- Input fields: 
  - Background: #ececf1 (Surprise me button)
  - Text: black
  - Border/focus: #4649ff
- Image preview overlay: rgba(0,0,0,0.5)
- Generate button: #6469ff background with white text
- Share button text: #666375

### Card.tsx
- Card background: #10131f (on hover)
- Avatar background: green-700 (Tailwind)
- Text: white

### FormField.tsx
- Label text: gray-900 (Tailwind)
- Surprise me button: #ececf1 background, black text
- Input fields:
  - Background: gray-50 (Tailwind)
  - Border: gray-300 (Tailwind)
  - Text: gray-900 (Tailwind)
  - Focus ring/border: #4649ff

### Loader.tsx
- Icon color: gray-200 (Tailwind)
- Spinner fill: #6469ff

### index.css
- Scrollbar thumb: #666e75

## Color Categories

### Primary Brand Color
- **#6469ff** - Used extensively for primary buttons, links, accents, and interactive elements

### Neutral Colors
- **#ffffff** (white) - Main background
- **#f9f8fe** - Very light background
- **#ececf1** - Light button/input background
- **#e6ebf4** - Border color

### Text Colors
- **#222328** - Primary/dark text
- **#666e75** - Secondary/muted text
- **#666375** - Additional muted text
- **black** - Form labels/buttons
- **white** - Text on dark backgrounds

### Accent/Status Colors
- **Green variants** (green-700) - Success/positive actions
- **#4649ff** - Focus states/ring effects

### Overlay/Background Effects
- **rgba(0,0,0,0.5)** - Semi-transparent dark overlay
- **rgba(189,192,207,0.06)** - Subtle shadow
- **rgba(189,192,207,0.2)** - Moderate shadow
- **rgba(189,192,207,0.4)** - Hover shadow

## Implementation Notes

1. **Primary Brand Color**: #6469ff is consistently used throughout the application for primary actions, links, and interactive elements.

2. **Text Hierarchy**: 
   - Dark text (#222328) for primary headings and important information
   - Medium text (#666e75, #666375) for secondary information and body text
   - White text for contrast on dark backgrounds

3. **Interactive States**:
   - Focus states use #4649ff for rings and borders
   - Hover states on cards use custom shadow effects from tailwind.config.js

4. **Backgrounds**:
   - Clean, light backgrounds (#ffffff, #f9f8fe, #ececf1) for main content
   - Dark backgrounds (#10131f) for card hover states
   - Semi-transparent overlays (rgba(0,0,0,0.5)) for image previews

5. **Consistency**: The color usage is consistent across components, maintaining a cohesive visual identity throughout the application.