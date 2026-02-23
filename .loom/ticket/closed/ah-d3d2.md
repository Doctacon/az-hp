---
"id": "ah-d3d2"
"status": "closed"
"deps":
- "ah-ed69"
"links": []
"created": "2026-02-19T22:39:39Z"
"type": "task"
"priority": 1
"assignee": "Connor"
"parent": "ah-c3c2"
"tags":
- "sprint:map-perf-architecture"
"external": {}
---
# Convert GeoJSON sources to PMTiles

## Problem
The two largest data sources are loaded as raw GeoJSON:
- `blm_sma_az.geojson` (~37MB, 64 complex polygons)
- `azgfd_gmu.geojson` (~14MB, 80 features)

This means ~51MB downloaded and parsed on every page load. MapLibre web workers must tile this data client-side, causing significant delays.

## Solution
Convert these to PMTiles using tippecanoe. Only viewport-visible tiles will be loaded on demand.

## Scope
- Update `pipeline/04_generate_tiles.sh` to convert hunt-units and land-ownership to PMTiles
- Update frontend to load these as `pmtiles://` vector sources
- Remove raw GeoJSON files from `frontend/public/data/`

## Non-goals
- Modifying the data content (same data, different format)
- Changes to layer styling

## Implementation Plan

1. **Update `pipeline/04_generate_tiles.sh`**:
   ```bash
   # Hunt units (80 features, keep full detail)
   tippecanoe -o frontend/public/data/hunt-units.pmtiles \
     -l hunt-units \
     -z14 -Z6 \
     --no-tile-size-limit \
     data/processed/azgfd_gmu.geojson

   # Land ownership (64 features, complex geometries, simplify at low zoom)
   tippecanoe -o frontend/public/data/land-ownership.pmtiles \
     -l land-ownership \
     -z14 -Z8 \
     --drop-densest-as-needed \
     --coalesce-densest-as-needed \
     data/processed/blm_sma_az.geojson
   ```

2. **Update `frontend/src/App.jsx`** - Replace GeoJSON sources with vector sources:
   ```js
   // Before:
   map.addSource('hunt-units', {
     type: 'geojson',
     data: '/data/azgfd_gmu.geojson'
   });
   
   // After:
   map.addSource('hunt-units', {
     type: 'vector',
     url: 'pmtiles:///data/hunt-units.pmtiles'
   });
   ```

3. **Update layer definitions** to specify `source-layer`:
   ```js
   map.addLayer({
     id: 'hunt-units-fill',
     type: 'fill',
     source: 'hunt-units',
     'source-layer': 'hunt-units',  // Add this
     // ...
   });
   ```

4. **Remove GeoJSON files** from `frontend/public/data/`:
   ```bash
   rm frontend/public/data/azgfd_gmu.geojson
   rm frontend/public/data/blm_sma_az.geojson
   ```

5. **Update Makefile** to include new PMTiles in build

## Verification Commands
```bash
# Run pipeline
make all

# Verify PMTiles created
ls -lh frontend/public/data/*.pmtiles

# Start dev server and check network tab
make dev-frontend
# Should see range requests to .pmtiles files, no full GeoJSON downloads
```

## Acceptance Criteria

hunt-units and land-ownership converted to PMTiles via tippecanoe; frontend updated to load pmtiles:// sources; raw GeoJSON files removed from public/data

## Notes

**2026-02-20T00:50:48Z**

Completed: Converted hunt-units to PMTiles (8MB vs 14.7MB GeoJSON). Updated frontend to load vector sources. Note: land-ownership PMTiles is empty due to ArcGIS geometry format issue (tracked in ah-d095).
