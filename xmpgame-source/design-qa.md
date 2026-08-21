# Product Design QA — 魔法伙伴触屏版

## Comparison target

- Source visual truth: `/Users/zhoulin/.codex/generated_images/019fe8f2-2a2f-78e3-87ad-9b370f0c889e/exec-254591fa-4326-4246-987f-8b364274a2e4.png`
- Browser-rendered implementation: `/tmp/xmpgame-cartoon-station1-refined.png`
- Route/state: `http://127.0.0.1:4183/station/1?kiosk=1&preview=1`, station 1 camera-ready state with the A4 watercolor test artwork.
- CSS viewport: `1706 × 960`; browser `devicePixelRatio: 0.75`.
- Source pixels: `1672 × 941`.
- Raw implementation capture: `2275 × 1280` (browser capture density `1.333×` relative to CSS pixels).
- Density normalization: source and implementation were both fitted to `1706 × 960` before visual comparison. Browser chrome and surrounding canvas were excluded.

## Evidence

- Initial full-view comparison: `/tmp/xmpgame-design-compare-full-v1.jpg`
- Initial focused copy/CTA comparison: `/tmp/xmpgame-design-compare-focus-v1.jpg`
- Revised full-view comparison: `/tmp/xmpgame-design-compare-full-v2.jpg`
- Revised focused copy/CTA comparison: `/tmp/xmpgame-design-compare-focus-v2.jpg`
- Four-station visual matrix: `/tmp/xmpgame-cartoon-four-stations-final.jpg`
- Fallback result-state capture: `/tmp/xmpgame-cartoon-station1-result-fallback.png`

The full-view comparison was used for composition, image scale, camera-to-copy proportions, mascot placement, color, and hierarchy. The focused comparison was required because the title treatment, readiness state, CTA type, and privacy copy were not legible enough at full-view comparison scale.

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: the revised implementation replaces the web-like white title card with large blue/orange display lines, a white outline, dimensional shadow, and stable two-line wrapping. The rounded Chinese system fallback remains readable on the Lenovo Windows hosts.
- Spacing and layout rhythm: the A4 feed intentionally occupies `62%` of the screen instead of the concept image's roughly even split, because the live overhead artwork is the product's primary physical task. The right copy and CTA remain fully visible without overflow.
- Colors and tokens: aqua, coral-orange, sunny yellow, white, and green readiness tokens match the selected direction. The CTA has a distinct active press state and a minimum rendered height of `125px` at the QA viewport.
- Image quality and asset fidelity: the ocean background and four 3D mascots are real generated raster assets. Transparent mascot edges were checked after alpha cleanup; no replacement SVG, emoji, CSS drawing, placeholder box, or stretched sprite is used.
- Copy and content: every child-facing screen is one-step, imperative, and short. It says that only the paper is photographed. Portrait, voice, microphone, and multi-choice flows are absent.
- Icons and accessibility: visible controls use one Lucide icon family; the primary action is a semantic button, has a large tap target, uses `touch-action: manipulation`, and retains reduced-motion support. The privacy line now has a high-contrast translucent white pill.
- Viewport resilience: all four station camera screens were rendered at the target 16:9 kiosk viewport. Each reported no horizontal or vertical document overflow.

Acceptable intentional differences from the ideation target:

- The implementation includes the school/station label and live-camera guidance required onsite.
- The mascot sits across the camera/copy seam so it can guide attention from the physical drawing to the CTA.
- Display typography is live, selectable UI text rather than rasterized title artwork.

## Comparison history

### Iteration 1 — blocked

- [P2] The first implementation used a generic white rounded title card and a single-color heading, which reduced the selected design's toy-like hierarchy.
  - Fix: split each station title into blue lead and orange action lines; added a thick white stroke and dimensional shadow; removed the generic title surface.
- [P2] A duplicate readiness pill in the camera header sat behind the mascot and competed with the child-facing readiness message.
  - Fix: removed the duplicate visual status and kept one large green readiness message beside the CTA.
- [P2] The privacy copy was low-contrast against coral and sand decorations.
  - Fix: changed it to a centered translucent white pill with darker text.

### Iteration 2 — passed

- Post-fix evidence: `/tmp/xmpgame-design-compare-full-v2.jpg` and `/tmp/xmpgame-design-compare-focus-v2.jpg`.
- The revised screen has no remaining P0/P1/P2 fidelity, usability, accessibility, or overflow issue at the target kiosk state.

## Functional verification

- Tested station routes 1–4 with their own mascot, title, recipe, and CTA.
- Tested station 1 primary CTA from camera-ready to result.
- Tested model-unavailable fallback: the original drawing stays visible and offers both retry and next-artwork actions.
- Tested `下一张小画`: result returns to the ready camera state.
- Checked browser console warnings/errors after the final render: none.
- Ran `npm test`: 15 tests passed, including model prompt boundaries, four-station routing, production build, and static hosting behavior.

The local model gateway was intentionally not running during visual QA, so the browser exercised the safe fallback result rather than claiming a real generation. Production model connectivity is a separate deployment/runtime check.

## Follow-up polish

- [P3] A custom packaged child-display font could move the title even closer to the concept's sculpted letterforms, but the current live text is clearer and safer across the four identical Windows kiosks.

final result: passed
