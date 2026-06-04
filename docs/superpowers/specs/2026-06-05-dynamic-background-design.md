# Dynamic Background Design

**Date:** 2026-06-05
**Status:** Approved

## Goal

Make the portfolio feel less static by adding two visual layers:
1. An animated color-shifting gradient in the hero section
2. Floating code and music symbols with cursor interaction in all other sections

## Color Scheme

All colors stay within the existing palette:
- `#1a1040` — primary dark purple (body background)
- `#0d0c2a` — deeper navy (alt sections)
- `#2a1a50` — warmer purple (intermediate gradient stop)
- `rgb(231, 203, 40)` — gold accent (used sparingly as a symbol tint)

## Hero Gradient Animation

- The `#hero` section gets a CSS `background` with a diagonal linear gradient
- A `@keyframes` rule cycles through 3 color stops: `#1a1040` → `#0d0c2a` → `#2a1a50` → back to `#1a1040`
- The gradient direction shifts slowly (achieved via `background-size: 400% 400%` and animating `background-position`)
- Loop duration: ~10 seconds, `ease-in-out`, infinite
- Implemented entirely in `styles.css` — no JavaScript needed

## Floating Symbols Canvas

### Setup
- A single `<canvas id="float-canvas">` is added to `index.html`, placed as the first child of `<body>`
- CSS positions it `fixed`, full viewport, `z-index: 0`, `pointer-events: none` so it never blocks interaction
- All other content sits above it via `position: relative; z-index: 1` (already the case for nav and sections)

### Symbols
- ~25 symbols total, split roughly 60/40 between code and music characters
- Code set: `</>`, `{}`, `()`, `=>`, `#`, `[ ]`
- Music set: `♩`, `♪`, `♫`, `♬`
- Each symbol is initialized with a random position, random velocity (slow drift), random size (14–28px), and opacity between 0.08–0.18 so they stay subtle

### Animation Loop
- `requestAnimationFrame` drives the loop — smooth and battery-friendly
- Each frame: move symbol by its velocity, wrap around edges when off-screen
- Cursor interaction: if the cursor is within 150px of a symbol, the symbol drifts toward the cursor at a gentle speed (not snapping, just nudging)
- Mouse position is tracked via a `mousemove` listener on `window`

### Implementation location
- All canvas logic added to the bottom of `script.js` as a self-contained block

## Files Changed

| File | Change |
|---|---|
| `styles.css` | Hero gradient `@keyframes` + canvas positioning |
| `index.html` | Add `<canvas id="float-canvas">` as first child of `<body>` |
| `script.js` | Canvas init, symbol objects, animation loop, cursor interaction |
