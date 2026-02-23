---
"id": "ah-a07b"
"status": "closed"
"deps":
- "ah-d3d2"
"links": []
"created": "2026-02-19T22:39:39Z"
"type": "task"
"priority": 2
"assignee": "Connor"
"parent": "ah-c3c2"
"tags":
- "sprint:map-perf-architecture"
"external": {}
---
# Add MapLibre performance tuning

## Problem
No performance tuning has been applied to MapLibre configuration. Easy wins are available.

## Scope
- Add `prewarm()` call before map instantiation
- Enable `cancelPendingTileRequestsWhileZooming`
- Set `minzoom`/`maxzoom` on all layers
- Disable `fill-antialias` on fill layers where visual quality isn't critical

## Non-goals
- Web worker count tuning (premature)
- Custom protocols
- Terrain/3D optimization

## Implementation Plan

1. **Add `prewarm()` in `frontend/src/App.jsx`** (before map creation):
   ```js
   import maplibregl from 'maplibre-gl';
   
   // Pre-initialize web workers before map is created
   maplibregl.prewarm();
   ```

2. **Add map options** in map constructor:
   ```js
   const map = new maplibregl.Map({
     // ... existing options ...
     cancelPendingTileRequestsWhileZooming: true,
   });
   ```

3. **Add `minzoom` to layers** in `addLayers()`:
   | Layer | minzoom | Rationale |
   |-------|---------|-----------|
   | land-ownership-fill | 8 | Useless at zoom 7 |
   | hunt-units-labels | 8 | Labels too dense |
   | roads-line | 9 | Roads not useful at 7 |
   | places-circle | 10 | POIs cluttered at low zoom |
   | buildings-fill | 12 | (already set) |

4. **Disable antialias on fill layers**:
   ```js
   'fill-antialias': false
   ```
   Apply to: `landcover-fill`, `land-ownership-fill`, `hunt-units-fill`, `water-fill`

## Verification Commands
```bash
make dev-frontend
# Open DevTools Console, check for prewarm messages
# Test rapid zooming - should feel smoother
# Check that layers appear/disappear at appropriate zoom levels
```

## Risks/Edge Cases
- Some fill layers may look jagged without antialias - test visually
- minzoom values may need adjustment based on data density

## Acceptance Criteria

prewarm() called before map init; cancelPendingTileRequestsWhileZooming enabled; minzoom/maxzoom set on all layers; fill-antialias disabled on fill layers

## Notes

**2026-02-20T01:03:34Z**

Completed all performance tuning: prewarm(), cancelPendingTileRequestsWhileZooming, minzoom on all layers (landcover:6, land-ownership:8, water:6, hunt-units-labels:8, roads:9, buildings:12, places:10), fill-antialias:false on all fill layers.
