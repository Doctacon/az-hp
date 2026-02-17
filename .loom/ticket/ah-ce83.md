---
"id": "ah-ce83"
"status": "open"
"deps":
- "ah-cc7e"
- "ah-d2c5"
"links": []
"created": "2026-02-17T17:14:58Z"
"type": "task"
"priority": 2
"assignee": "Connor"
"parent": "ah-1557"
"tags":
- "sprint:build-pipeline"
"external": {}
---
# Run enrichment pipeline

# Run enrichment pipeline

## Objective Alignment

The enrich step adds critical context to the raw data: road ownership status (BLM, USFS, etc.), hunt unit associations, and hunt-relevant POI filtering. This is what makes the map useful for hunters.

## Scope

- Run `make enrich` or `uv run python pipeline/03_enrich.py`
- Enrich roads with land ownership (spatial join with BLM SMA)
- Enrich roads with hunt unit association (spatial join with GMUs)
- Filter places to hunt-relevant POIs (trailheads, campgrounds, etc.)
- Copy static layers to frontend/public/data/

## Non-Goals

- Do not modify the enrich logic — just run it
- Do not fix any issues in enrich.py — note them for follow-up

## Implementation Plan

1. Ensure clipped data exists (run after ah-d2c5):
   ```bash
   ls data/processed/overture_transportation_clipped.parquet
   ls data/processed/overture_places_clipped.parquet
   ```

2. Run enrichment:
   ```bash
   make enrich
   ```

3. Verify outputs:
   - Check `data/processed/roads_enriched.parquet` exists and has `land_status` column
   - Check `data/processed/places_hunt.parquet` exists
   - Check `frontend/public/data/azgfd_gmu.geojson` exists
   - Check `frontend/public/data/blm_sma_az.geojson` exists

## Acceptance Criteria

- [ ] `make enrich` completes without errors
- [ ] `data/processed/roads_enriched.parquet` exists
- [ ] `roads_enriched.parquet` has `land_status` column (values like `public_blm`, `public_usfs`, etc.)
- [ ] `roads_enriched.parquet` has `GMUNAME` column (hunt unit association)
- [ ] `data/processed/places_hunt.parquet` exists
- [ ] `frontend/public/data/azgfd_gmu.geojson` exists
- [ ] `frontend/public/data/blm_sma_az.geojson` exists

## Verification Commands

```bash
make enrich

ls -la data/processed/roads_enriched.parquet data/processed/places_hunt.parquet

uv run python -c "
import geopandas as gpd
roads = gpd.read_parquet('data/processed/roads_enriched.parquet')
print('Columns:', roads.columns.tolist())
print('Land status values:', roads['land_status'].value_counts().to_dict())
"

ls -la frontend/public/data/
```

## Risks / Edge Cases

- **Spatial joins are slow** — may take 5-10 minutes for 1.3M road segments
- **BLM SMA has no BLM/State data** — roads on BLM land will show as `private_or_unknown`
- **Memory issues** — may need to process in chunks if memory is limited

## Dependencies

- Requires ah-cc7e (Download pipeline) to be complete
- Requires ah-d2c5 (Fix clip) to be complete
- Cannot start until both are done

## Acceptance Criteria

make enrich completes; roads_enriched.parquet and places_hunt.parquet exist in data/processed/
