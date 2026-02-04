## 1. Core Gesture Logic

- [x] 1.1 Replace `STAGE_TRANSITIONS` direction mapping with cumulative `STAGE_THRESHOLDS` (40, 120, 220)
- [x] 1.2 Modify `onDragMove` to calculate stage from cumulative horizontal distance only
- [x] 1.3 Implement snap-to-nearest logic in `onDragEnd` using threshold midpoints
- [x] 1.4 Update `dragProgress` calculation to span current-to-full range

## 2. Testing

- [x] 2.1 Update E2E test to use single continuous horizontal drag
- [x] 2.2 Run harmonica gesture tests to verify all stages work
- [x] 2.3 Manual test on mobile viewport to confirm smooth flow
