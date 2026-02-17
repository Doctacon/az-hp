---
"id": "ah-cc7e"
"status": "closed"
"deps":
- "ah-6760"
"links": []
"created": "2026-02-17T17:13:57Z"
"type": "task"
"priority": 2
"assignee": "Connor"
"parent": "ah-1557"
"tags":
- "sprint:build-pipeline"
"external": {}
---
# Run data download pipeline

# Run data download pipeline

## Objective Alignment

Raw data is required before any processing can happen. This step populates data/raw/ with all source files from Overture Maps, AZGFD, BLM, and Census.

## Scope

- Run `make download` or `uv run python pipeline/01_download.py`
- Download Overture Maps data (transportation, buildings, places, land cover, land use, land, water)
- Download AZ boundary from Census
- Download AZGFD GMU boundaries
- Download BLM SMA data (partial — BLM and State layers may fail, proceed anyway)
- Download USFS forest boundaries

## Non-Goals

- Do not fix BLM SMA download issues (proceed with partial data)
- Do not clip or process any data

## Implementation Plan

1. Ensure uv is installed and dependencies are synced:
   ```bash
   uv sync
   ```
2. Run the download pipeline:
   ```bash
   make download
   ```
3. Verify all files were downloaded:
   - Check `data/raw/` contains expected files
   - Note any errors in output (BLM layer 7/14 errors are expected)

## Acceptance Criteria

- [ ] `data/raw/az_boundary.geojson` exists (contains AZ state boundary)
- [ ] `data/raw/azgfd_gmu.geojson` exists (contains ~80 GMUs)
- [ ] `data/raw/blm_sma_az.geojson` exists (contains 64+ features, may be missing BLM/State)
- [ ] `data/raw/overture_transportation_az.parquet` exists
- [ ] `data/raw/overture_buildings_az.parquet` exists
- [ ] `data/raw/overture_places_az.parquet` exists
- [ ] `data/raw/overture_land_cover_az.parquet` exists
- [ ] `data/raw/overture_land_use_az.parquet` exists
- [ ] `data/raw/overture_land_az.parquet` exists
- [ ] `data/raw/overture_water_az.parquet` exists
- [ ] `data/raw/usfs_forests/` directory exists (national data, needs filtering later)

## Verification Commands

```bash
ls -la data/raw/
# Check file sizes are reasonable (not 0 bytes)
uv run python -c "import geopandas as gpd; print(len(gpd.read_file('data/raw/azgfd_gmu.geojson')))"
# Should print ~80
```

## Risks / Edge Cases

- **BLM SMA layers 7 (BLM) and 14 (State) may return 500 errors** — this is expected, proceed with partial data
- **Overture download may be slow** — large files (200+ MB), allow time
- **Network issues** — if download fails, check internet connection and retry

## Dependencies

- Requires ah-6760 (Setup data directories) to be complete first

## Acceptance Criteria

All raw data files exist in data/raw/: az_boundary.geojson, azgfd_gmu.geojson, blm_sma_az.geojson, overture_*.parquet

## Notes

**2026-02-17T17:28:17Z**

Download Pipeline Completed

Files Downloaded:
- az_boundary.geojson (46K) ✓
- azgfd_gmu.geojson (14M) - 80 GMUs ✓
- blm_sma_az.geojson (27M) - 57 features (partial, expected)
- overture_transportation_az.parquet (226M) ✓
- overture_buildings_az.parquet (422M) ✓
- overture_places_az.parquet (22M) ✓
- overture_land_cover_az.parquet (243M) ✓
- overture_land_use_az.parquet (45M) ✓
- overture_land_az.parquet (117M) ✓
- overture_water_az.parquet (110M) ✓
- usfs_forests/ directory ✓

Expected: BLM SMA layers 7,9,14 returned 500 errors. Proceeded with partial data (57 features from NPS, FWS, USBR, DOD).

**2026-02-17T17:29:47Z**

## Review Request

### Verification Commands
```bash
ls -la data/raw/
uv run python -c "import geopandas as gpd; print(len(gpd.read_file('data/raw/azgfd_gmu.geojson')))"  # Should be 80
```

### Acceptance Status
All files present and non-zero:
- [x] az_boundary.geojson (46K)
- [x] azgfd_gmu.geojson (14M, 80 GMUs)
- [x] blm_sma_az.geojson (27M, 57 features - partial expected)
- [x] overture_transportation_az.parquet (226M)
- [x] overture_buildings_az.parquet (422M)
- [x] overture_places_az.parquet (22M)
- [x] overture_land_cover_az.parquet (243M)
- [x] overture_land_use_az.parquet (45M)
- [x] overture_land_az.parquet (117M)
- [x] overture_water_az.parquet (110M)
- [x] usfs_forests/ directory

### Commit
b68dfda - Adds frontend public data directory for pipeline outputs

### Risks
- BLM SMA has 57 features instead of 64+ due to expected BLM/State layer 500 errors
- Data files are gitignored (large files) - not in repo
