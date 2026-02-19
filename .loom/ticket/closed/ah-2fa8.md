---
"id": "ah-2fa8"
"status": "closed"
"deps": []
"links": []
"created": "2026-02-18T02:01:33Z"
"type": "task"
"priority": 1
"assignee": "Connor"
"parent": "ah-174b"
"tags":
- "sprint:map-display-fix"
"external": {}
---
# Run full data pipeline to generate map data

# Run full data pipeline to generate map data

## Objective Alignment
The map cannot render without data. This ticket runs the complete data pipeline to generate all required map data files.

## Scope
- Execute `make all` to run the full 4-step pipeline
- Verify each step completes without fatal errors
- Confirm data files are generated in `frontend/public/data/`

## Non-goals
- Fix data quality issues (handled in separate tickets)
- Optimize pipeline performance
- Add new data sources

## Implementation Plan

1. **Run download step**: `make download`
   - Downloads Overture transportation, base layers, buildings, places
   - Downloads AZGFD GMU boundaries
   - Downloads BLM SMA land ownership
   - Downloads Arizona state boundary
   - Downloads USFS forest boundaries
   - Expected outputs in `data/raw/`:
     - `overture_transportation_az.parquet`
     - `overture_land_use_az.parquet`
     - `overture_land_cover_az.parquet`
     - `overture_land_az.parquet`
     - `overture_water_az.parquet`
     - `overture_buildings_az.parquet`
     - `overture_places_az.parquet`
     - `azgfd_gmu.geojson`
     - `blm_sma_az.geojson`
     - `az_boundary.geojson`
     - `usfs_forests/` directory

2. **Run clip step**: `make clip`
   - Clips Overture data to Arizona boundary
   - Expected outputs in `data/processed/`:
     - `overture_transportation_clipped.parquet`
     - `overture_water_clipped.parquet`
     - `overture_land_cover_clipped.parquet`
     - `overture_buildings_clipped.parquet`
     - `overture_places_clipped.parquet`

3. **Run enrich step**: `make enrich`
   - Enriches roads with land ownership and hunt unit data
   - Filters hunt-relevant POIs
   - Copies static layers to frontend
   - Expected outputs:
     - `data/processed/roads_enriched.parquet`
     - `data/processed/places_hunt.parquet`
     - `frontend/public/data/azgfd_gmu.geojson`
     - `frontend/public/data/blm_sma_az.geojson`

4. **Run tiles step**: `make tiles`
   - Converts processed Parquet to GeoJSON
   - Generates PMTiles with tippecanoe
   - Copies PMTiles to frontend
   - Expected outputs in `frontend/public/data/`:
     - `roads.pmtiles`
     - `places.pmtiles`
     - `water.pmtiles`
     - `landcover.pmtiles`
     - `buildings.pmtiles`

5. **Verify outputs**
   - Check all expected files exist
   - Check file sizes are non-zero

## Verification Commands
```bash
# Run full pipeline
make all

# Verify data files exist and have content
ls -la frontend/public/data/
# Should show: roads.pmtiles, water.pmtiles, landcover.pmtiles, buildings.pmtiles, places.pmtiles, azgfd_gmu.geojson, blm_sma_az.geojson

# Check file sizes are reasonable
du -h frontend/public/data/*
```

## Acceptance Criteria
- [ ] `make all` completes without fatal errors
- [ ] `frontend/public/data/roads.pmtiles` exists and has non-zero size
- [ ] `frontend/public/data/water.pmtiles` exists and has non-zero size
- [ ] `frontend/public/data/landcover.pmtiles` exists and has non-zero size
- [ ] `frontend/public/data/buildings.pmtiles` exists and has non-zero size
- [ ] `frontend/public/data/places.pmtiles` exists and has non-zero size
- [ ] `frontend/public/data/azgfd_gmu.geojson` exists and has non-zero size
- [ ] `frontend/public/data/blm_sma_az.geojson` exists and has non-zero size

## Risks/Edge Cases
- **BLM API failures**: The BLM SMA API may return 500 errors for BLM (layer 7) and STATE (layer 14) - this is acceptable, other layers will still download
- **Large file handling**: Files >100MB skip clip step (expected behavior)
- **Network timeouts**: Download may be slow; use `--timeout` if needed
- **Partial data**: Some layers may be empty if downloads fail - document which layers failed

## Dependencies
- None (this is the first step)

## Acceptance Criteria

frontend/public/data contains roads.pmtiles, water.pmtiles, landcover.pmtiles, buildings.pmtiles, places.pmtiles, azgfd_gmu.geojson, blm_sma_az.geojson

## Notes

**2026-02-18T02:37:40Z**

Pipeline completed successfully. All 7 required data files generated: roads.pmtiles (301M), water.pmtiles (123M), landcover.pmtiles (128M), buildings.pmtiles (232M), places.pmtiles (1.4M), azgfd_gmu.geojson (14M), blm_sma_az.geojson (12K). BLM API returned 500 errors for BLM layer 7 and STATE layer 14 (expected per ticket spec). Data files are in .gitignore as expected for large generated files.
