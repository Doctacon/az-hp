# AGENTS

This file is included in the agent's context. It should be committed.

For derived and frequently-updated context, see:
- LOOM.md
- .loom/compound/ROADMAP.md

---

## Project Overview

Arizona Public Land Hunting Access Planner - open-source web application combining Overture Maps data with public land ownership, AZGFD hunting unit boundaries, and access route information to help hunters plan legal access to Arizona's public lands.

## Tech Stack

- **Data Pipeline**: Python 3.13+ | DuckDB (spatial) | GeoPandas | Shapely | PyArrow
- **Tile Generation**: tippecanoe → PMTiles
- **Frontend**: React 19 | Vite 7 | MapLibre GL JS | pmtiles | @turf/turf
- **Basemap**: Protomaps | Mapterhorn terrain (DEM)
- **Package Management**: `uv` (Python), `npm` (frontend)

## Common Commands

```bash
make all              # Full pipeline (download → clip → enrich → tiles → basemap → build)
make dev-frontend     # Start frontend dev server at http://localhost:5173
make download         # Download all data sources
make clip             # Clip Overture data to Arizona boundary
make enrich           # Spatial joins (roads + land ownership + hunt units)
make tiles            # Generate PMTiles from processed data
make clean            # Remove all generated data and build artifacts
cd frontend && npm run lint   # Lint frontend code
```

## Architecture

```
pipeline/
├── utils.py              # Shared constants (AZ bbox, Overture release, agency maps)
├── 01_download.py        # Download Overture, BLM SMA, AZGFD GMU, Census boundary
├── 02_clip_arizona.py    # Clip Overture data to Arizona boundary
├── 03_enrich.py          # Spatial joins: roads → land ownership, hunt units
└── 04_generate_tiles.sh  # tippecanoe → PMTiles

data/
├── raw/                  # Downloaded source files (GeoJSON, Parquet, shapefiles)
├── processed/            # Cleaned and enriched GeoJSON outputs
└── tiles/                # PMTiles (copied to frontend/public/data/)

frontend/src/
├── App.jsx               # Main map component
├── components/           # LayerPanel, UnitInfoPanel
├── config/               # Layer configurations
└── hooks/                # Custom React hooks
```

## Key Conventions

- Always use `uv run python` for Python scripts (not bare `python`)
- PMTiles stored in `frontend/public/data/`
- Roads color-coded by land ownership:
  - Green = USFS (public)
  - Yellow = BLM (public)
  - Light Green = NPS (public)
  - Teal = FWS (public)
  - Purple = State Trust (permit required)
  - Orange = Private/Unknown
  - Red = Military (restricted)

## Data Sources

| Dataset | Source |
|---------|--------|
| Transportation, Places, Buildings, Base | [Overture Maps](https://overturemaps.org/) |
| Game Management Unit Boundaries | AZ State Land Dept / AZGFD |
| Surface Management Agency | BLM |
| Administrative Forest Boundaries | USFS |
| Arizona State Boundary | Census TIGERweb |

## Configuration

- Overture release version defined in `pipeline/utils.py` (`OVERTURE_RELEASE`)
- Arizona bounding box in `pipeline/utils.py` (`AZ_BBOX`)
- Agency-to-access-level mapping in `pipeline/utils.py` (`AGENCY_ACCESS_MAP`)
