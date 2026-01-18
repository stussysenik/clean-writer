## 1. Implementation

- [ ] 1.1 Add responsive wrapper to SyntaxToggles that hides on mobile (`hidden md:flex`)
- [ ] 1.2 Add mobile hint indicator in bottom toolbar pointing to side panel (small icon/text)
- [ ] 1.3 Add first-visit detection for UnifiedSyntaxPanel hint animation
- [ ] 1.4 Add subtle pulse/glow animation to side panel tab on first visit
- [ ] 1.5 Persist "has seen hint" state in localStorage

## 2. Verification

- [ ] 2.1 Test on mobile viewport (< 768px) - SyntaxToggles hidden, hint visible
- [ ] 2.2 Test on desktop viewport (≥ 768px) - Full toolbar visible
- [ ] 2.3 Test first-visit animation plays once, then stops
- [ ] 2.4 Run `npm run build` to verify no errors
- [ ] 2.5 Test side panel functionality remains complete (word count, toggles, reorder)
