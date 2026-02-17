---
"id": "ah-6cab"
"status": "open"
"deps":
- "ah-ce83"
"links": []
"created": "2026-02-17T17:16:03Z"
"type": "task"
"priority": 2
"assignee": "Connor"
"parent": "ah-1557"
"tags":
- "sprint:build-pipeline"
"external": {}
---
# Generate PMTiles

# Generate PMTiles

## Objective Alignment

PMTiles are the vector tile format used by the frontend. This step converts the enriched GeoJSON/Parquet data into optimized tiles for efficient map rendering.

## Scope

- Run `make tiles` or `bash pipeline/04_generate_tiles.sh`
- Convert enriched data to GeoJSON (intermediate step in script)
- Generate PMTiles using tippecanoe
- Copy PMTiles to `frontend/public/data/`

## Non-Goals

- Do not modify tile generation logic
- Do not optimize tippecanoe parameters

## Implementation Plan

1. Ensure tippecanoe is installed:
   ```bash
   which tippecanoe || brew install tippecanoe
   ```

2. Ensure enriched data exists (run after ah-ce83):
   ```bash
   ls data/processed/roads_enriched.parquet
   ls data/processed/places_hunt.parquet
   ```

3. Run tile generation:
   ```bash
   make tiles
   ```

4. Verify outputs in `frontend/public/data/`:
   - roads.pmtiles
   - places.pmtiles
   - water.pmtiles
   - landcover.pmtiles (optional, may fail if data is large)

## Acceptance Criteria

- [ ] `make tiles` completes without fatal errors
- [ ] `frontend/public/data/roads.pmtiles` exists
- [ ] `frontend/public/data/places.pmtiles` exists
- [ ] `frontend/public/data/water.pmtiles` exists
- [ ] `frontend/public/data/landcover.pmtiles` exists (optional)
- [ ] All PMTiles files are non-zero size

## Verification Commands

```bash
make tiles

ls -la frontend/public/data/*.pmtiles

# Check PMTiles is valid
uv run python -c "
from pmtiles.reader import Reader, MmapSource
with open('frontend/public/data/roads.pmtiles', 'rb') as f:
    reader = Reader(MmapSource(f))
    print('roads.pmtiles metadata:', reader.metadata())
"
```

## Risks / Edge Cases

- **tippecanoe may fail on large layers** — script has fallback handling
- **Buildings layer too large** — may skip or simplify
- **GeoJSON conversion slow** — part of the script, allow time

## Dependencies

- Requires ah-ce83 (Enrich pipeline) to be complete
- Cannot start until enrich is done

## Acceptance Criteria

make tiles completes; all .pmtiles files exist in frontend/public/data/
