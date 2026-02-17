# AZ Hunt Planner - Project Status

_Last updated: 2026-02-16_

## Overall Progress

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Scaffolding | DONE | Directories, pyproject.toml, .gitignore, frontend init, tippecanoe installed |
| 2. Data download | DONE (with issues) | All Overture data + AZGFD GMUs + partial BLM SMA + USFS forests + AZ boundary downloaded |
| 3a. Clip to AZ | PARTIAL | 5/7 layers clipped; buildings and places clip timed out (large datasets) |
| 3b. Enrich | NOT STARTED | Blocked on clip completing |
| 4. Tile generation | NOT STARTED | Blocked on enrich |
| 5. Frontend | CODE COMPLETE | Builds successfully, untested with data |
| 6. Makefile | DONE | All targets working |

## Data Download Issues

### BLM SMA (Surface Management Agency) — PARTIAL

The BLM ArcGIS REST API is unreliable. Two approaches failed:
- `BLM_Natl_SMA_LimitedScale/MapServer/1` — returns 500 on `ADMIN_ST='AZ'` where clause
- `BLM_Natl_SMA_Cached_without_PriUnk/MapServer` — works with spatial queries on individual agency sub-layers, but the **BLM (layer 7)** and **STATE (layer 14)** sub-layers return 500 errors

**Current data:** 64 features downloaded (NPS: 22, FWS: 17, DOD: 12, FS: 7, USBR: 6). **Missing: BLM and State Trust land** — the two most important land types for hunting access in Arizona.

**Possible fixes:**
1. Try BLM layer with smaller bounding boxes (tile the state into quadrants)
2. Look for an alternative BLM SMA bulk download (Shapefile/GDB) — check the BLM GeoPlatform
3. Use the PAD-US (Protected Areas Database) from USGS instead, which includes SMA data: `https://www.usgs.gov/programs/gap-analysis-project/science/pad-us-data-download`
4. Try a different BLM service endpoint

### AZGFD GMU — DONE

Downloaded 80 game management units. Needed `follow_redirects=True` for httpx since Hub redirects.

Key fields: `GMUNAME`, `REG_NAME`, `ACRES`, `LANDOWN`, `HUNT`, `AGFDLink`, `USFSName`

### AZ Boundary — DONE

Downloaded Census 500k cartographic boundary shapefile, filtered to AZ, saved as GeoJSON. Original TIGERweb REST API was unreachable.

### USFS Forests — DONE

Downloaded `BdyAdm_LSRS_AdministrativeForest.zip` shapefile. Not yet integrated into the pipeline (need to filter to Region 03 / AZ forests and add to the BLM SMA layer or use separately).

## Clip Issues

The clip step (`02_clip_arizona.py`) uses GeoPandas `gpd.clip()` which works fine for smaller layers but timed out on:
- **overture_buildings_az.parquet** (422 MB, likely millions of features)
- **overture_places_az.parquet** (22 MB, 313K features)

**Possible fixes:**
1. Since Overture data is already bbox-filtered to AZ, the clip may be unnecessary for these layers — the bbox filter is close enough to the state boundary
2. Use DuckDB spatial `ST_Intersects` instead of GeoPandas clip (much faster for large datasets)
3. Skip buildings/places clip and use the raw bbox-filtered files directly

## Downloaded Data Inventory

### Raw data (`data/raw/`)

| File | Size | Features |
|------|------|----------|
| `az_boundary.geojson` | 46 KB | 1 |
| `azgfd_gmu.geojson` | 14 MB | 80 |
| `blm_sma_az.geojson` | 37 MB | 64 (missing BLM + State) |
| `overture_transportation_az.parquet` | 226 MB | 1,294,128 |
| `overture_buildings_az.parquet` | 422 MB | ? |
| `overture_places_az.parquet` | 22 MB | 313,864 |
| `overture_land_cover_az.parquet` | 243 MB | ? |
| `overture_land_use_az.parquet` | 45 MB | ? |
| `overture_land_az.parquet` | 117 MB | ? |
| `overture_water_az.parquet` | 110 MB | ? |
| `usfs_forests/` | ~45 MB | national (needs AZ filter) |

### Processed data (`data/processed/`)

| File | Size | Status |
|------|------|--------|
| `overture_transportation_clipped.parquet` | 227 MB | OK |
| `overture_land_use_clipped.parquet` | 44 MB | OK |
| `overture_land_cover_clipped.parquet` | 233 MB | OK |
| `overture_land_clipped.parquet` | 118 MB | OK |
| `overture_water_clipped.parquet` | 109 MB | OK |
| `overture_buildings_clipped.parquet` | — | MISSING (clip timed out) |
| `overture_places_clipped.parquet` | — | MISSING (clip timed out) |
| `roads_enriched.parquet` | — | NOT YET (needs clip + enrich) |
| `places_hunt.parquet` | — | NOT YET (needs clip + enrich) |

## Code Status

### Pipeline scripts

| File | Status | Notes |
|------|--------|-------|
| `pipeline/utils.py` | OK | Constants, URLs, mappings |
| `pipeline/01_download.py` | OK | Runs to completion. BLM layer 7/14 errors handled gracefully |
| `pipeline/02_clip_arizona.py` | NEEDS FIX | Timed out on buildings/places. Needs DuckDB spatial or skip-large-layers option |
| `pipeline/03_enrich.py` | UNTESTED | Can't run until clip produces buildings/places output |
| `pipeline/04_generate_tiles.sh` | UNTESTED | Can't run until enrich produces output |

### Frontend

| File | Status | Notes |
|------|--------|-------|
| `frontend/src/App.jsx` | BUILDS OK | MapLibre + PMTiles, all layers configured |
| `frontend/src/components/LayerPanel.jsx` | BUILDS OK | Layer toggles + legends |
| `frontend/src/components/UnitInfoPanel.jsx` | BUILDS OK | Hunt unit info sidebar |
| `frontend/src/App.css` | OK | |
| `frontend/src/index.css` | OK | |
| `frontend/vite.config.js` | OK | PMTiles excluded from optimizeDeps |

Frontend builds clean (`npm run build` succeeds). Completely untested with actual data.

## Bugs Fixed So Far

1. **`ModuleNotFoundError: No module named 'pipeline'`** — Added `sys.path.insert()` to all pipeline scripts so they can be run via `uv run python pipeline/01_download.py` from the project root
2. **Census TIGERweb API unreachable** — Switched AZ boundary download to Census cartographic boundary shapefile (`cb_2022_us_state_500k.zip`), filter to `STUSPS == 'AZ'`
3. **AZGFD GMU 302 redirect** — Added `follow_redirects=True` to httpx client
4. **BLM SMA 500 errors** — Switched from `LimitedScale` service to `Cached_without_PriUnk` service, querying individual agency sub-layers with spatial (envelope) filter instead of attribute filter

## Next Steps (Priority Order)

1. **Fix BLM SMA download** — Get BLM (layer 7) and State Trust (layer 14) data. Without BLM land, road access coloring is missing the most common public land type in Arizona. Try PAD-US as alternative.
2. **Fix clip for large layers** — Either skip buildings/places clip (use raw bbox-filtered data) or switch to DuckDB spatial for faster clipping.
3. **Run enrich pipeline** — Spatial joins: roads x land ownership, roads x GMUs, POI filtering.
4. **Run tile generation** — tippecanoe to PMTiles.
5. **Test frontend with real data** — Copy PMTiles and GeoJSON to `frontend/public/data/`, run dev server, verify layers render.
6. **Commit working code** — Nothing has been committed since initial commit.
