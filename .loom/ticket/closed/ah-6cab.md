---
"id": "ah-6cab"
"status": "closed"
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

## Notes

**2026-02-17T18:08:48Z**

## Progress Update

### Completed
1. Symlinked data directory from main repo (dependency artifacts from ah-ce83)
2. Verified tippecanoe is installed
3. Ran `make tiles` successfully
4. Verified all PMTiles files are valid

### Results
- roads.pmtiles: 305 MB (1,246,257 features)
- places.pmtiles: 1.5 MB (1,665 features)
- water.pmtiles: 125 MB (330,625 features)
- landcover.pmtiles: 128 MB (162,495 features)

### Acceptance Criteria - ALL MET
- [x] `make tiles` completes without fatal errors
- [x] `frontend/public/data/roads.pmtiles` exists (305 MB)
- [x] `frontend/public/data/places.pmtiles` exists (1.5 MB)
- [x] `frontend/public/data/water.pmtiles` exists (125 MB)
- [x] `frontend/public/data/landcover.pmtiles` exists (128 MB) - optional but generated
- [x] All PMTiles files are non-zero size

### Notes
- No code changes required - this was a pure pipeline execution task
- PMTiles are generated artifacts (550+ MB total) and follow existing .gitignore patterns
- buildings.pmtiles skipped as expected (no overture_buildings_clipped.parquet available)
