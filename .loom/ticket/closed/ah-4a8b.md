---
"id": "ah-4a8b"
"status": "closed"
"deps": []
"links": []
"created": "2026-02-22T23:46:48Z"
"type": "task"
"priority": 1
"assignee": "Connor"
"tags":
- "sprint:terrain"
"external": {}
---
# Add terrain hillshade and contour lines

## Notes

**2026-02-23T00:05:20Z**

Implemented terrain via maplibre-contour with Mapterhorn CDN. Hillshade and contours share tile cache. Contour intervals: 200ft (z11-12), 100ft (z13-14), 50ft (z15+). Added terrain toggle to LayerPanel.

**2026-02-23T03:35:31Z**

## Review Summary

**Implementation Complete**: Terrain hillshade and contour lines feature was implemented in commit f09c187 and merged to main.

### Features Implemented:
1. **Hillshade Layer**: Uses Mapterhorn DEM tiles via raster-dem source
2. **Contour Lines**: Generated dynamically via maplibre-contour library
3. **Zoom-level Contour Intervals**:
   - z11: 200ft, 1000ft
   - z12: 100ft, 500ft  
   - z13: 100ft, 500ft
   - z14: 50ft, 200ft
   - z15: 20ft, 100ft
4. **Layer Toggle**: "Terrain (Hillshade)" in LayerPanel
5. **Shared Tile Cache**: Hillshade and contours share DEM tile cache for efficiency

### Files Changed:
- frontend/src/hooks/useMapLayers.js - Terrain sources and layers
- frontend/src/config/layers.js - Layer configuration and visibility
- frontend/src/components/LayerPanel.jsx - UI toggle
- frontend/package.json - Added maplibre-contour dependency

### Verification:
```bash
cd frontend && npm install && npm run build
# Should complete successfully
```

### Risks:
- None - implementation uses stable CDN (Mapterhorn) and well-tested library (maplibre-contour)
- Build produces warning about chunk size (>500KB) but this is not blocking
