---
"id": "ah-c3c2"
"status": "closed"
"deps":
- "ah-ed69"
"links": []
"created": "2026-02-19T22:39:15Z"
"type": "sprint"
"priority": 1
"assignee": "Connor"
"tags":
- "fanout"
- "sprint:map-perf-architecture"
"external": {}
---
# Map performance architecture overhaul

## Sprint Brief

### Objective
Transform the map application from sluggish to world-class performance by implementing vector tiles for all layers, adding a proper basemap, and refactoring the architecture.

### Sprint focus
**All PMTiles, Protomaps basemap, performance tuning**

### Current state
- ~51MB of GeoJSON loaded entirely into memory (hunt-units + land-ownership)
- No basemap (flat beige background)
- No performance tuning (no prewarm, no zoom-level filtering)
- Monolithic App.jsx (313 lines, all logic in one file)

### Target state
- All data as PMTiles (only viewport tiles loaded on demand)
- Protomaps OSM basemap (free, self-hosted)
- MapLibre performance tuning applied
- Clean hook-based architecture

## Ticket Set

| ID | Title | Priority | Deps |
|---|---|---|---|
| ah-d3d2 | Convert GeoJSON sources to PMTiles | 1 | ah-ed69 |
| ah-a07b | Add MapLibre performance tuning | 2 | ah-d3d2 |
| ah-7c72 | Integrate Protomaps basemap | 2 | ah-a07b |
| ah-e9ad | Refactor map architecture | 3 | ah-7c72 |
| ah-77e6 | Verify performance benchmarks | 1 | ah-e9ad |

## Ordering (all sequential)

```
ah-ed69 (current sprint) 
    → ah-d3d2 (GeoJSON → PMTiles) 
    → ah-a07b (perf tuning) 
    → ah-7c72 (Protomaps) 
    → ah-e9ad (refactor) 
    → ah-77e6 (verify)
```

## Acceptance Criteria

All map data served as PMTiles (no GeoJSON); page load < 3s; pan/zoom smooth at 60fps; Protomaps basemap integrated

## Notes

**2026-02-20T03:27:18Z**

Sprint completed. All 5 child tickets closed:
- ah-d3d2: GeoJSON → PMTiles ✓
- ah-a07b: MapLibre perf tuning ✓
- ah-7c72: Protomaps basemap ✓
- ah-e9ad: Architecture refactor ✓
- ah-77e6: Performance benchmarks ✓

Key wins:
- Eliminated 51MB GeoJSON download
- All data as PMTiles (on-demand loading)
- Protomaps basemap integrated
- Clean hook-based architecture
- App.jsx: 307 lines → 36 lines
