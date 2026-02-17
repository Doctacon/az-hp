# Arizona Public Land Hunting Access Planner

An open-source web application that combines Overture Maps data with public land ownership, AZGFD hunting unit boundaries, and access route information to help hunters plan legal access to Arizona's public lands.

## Features

- **Hunt Unit Boundaries** — AZGFD Game Management Unit boundaries with unit info
- **Land Ownership** — BLM Surface Management Agency data showing USFS, BLM, NPS, State Trust, and private lands
- **Road Access** — Roads and trails color-coded by land ownership (green=USFS, yellow=BLM, orange=private/unknown)
- **Water Features** — Lakes, rivers, and streams from Overture Maps
- **POIs** — Trailheads, campgrounds, and other hunt-relevant points of interest
- **Interactive Map** — Click hunt units for info, click roads for access details

## Tech Stack

- **Data Pipeline**: Python + DuckDB (spatial) + GeoPandas
- **Tile Generation**: tippecanoe → PMTiles
- **Frontend**: React + Vite + MapLibre GL JS
- **Package Management**: uv (Python), npm (frontend)

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- tippecanoe (`brew install tippecanoe` on macOS)

### Setup

1. Install Python dependencies:
   ```bash
   uv sync
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

3. Run the full data pipeline:
   ```bash
   make all
   ```

4. Start the development server:
   ```bash
   make dev-frontend
   ```

5. Open http://localhost:5173

## Project Structure

```
az-hp/
├── pipeline/
│   ├── utils.py              # Shared constants and configuration
│   ├── 01_download.py        # Download all data sources
│   ├── 02_clip_arizona.py    # Clip Overture data to AZ boundary
│   ├── 03_enrich.py          # Spatial joins and enrichment
│   └── 04_generate_tiles.sh  # Generate PMTiles
├── data/
│   ├── raw/                  # Downloaded source files
│   ├── processed/            # Cleaned and enriched outputs
│   └── tiles/                # PMTiles for frontend
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main map component
│   │   ├── components/
│   │   │   ├── LayerPanel.jsx
│   │   │   └── UnitInfoPanel.jsx
│   │   └── App.css
│   └── public/data/          # Static data files
├── Makefile
└── pyproject.toml
```

## Data Sources

| Dataset | Source |
|---------|--------|
| Transportation, Places, Buildings, Base | [Overture Maps](https://overturemaps.org/) |
| Game Management Unit Boundaries | AZ State Land Dept / AZGFD |
| Surface Management Agency | BLM |
| Administrative Forest Boundaries | USFS |
| Arizona State Boundary | Census TIGERweb |

## Road Access Color Legend

| Color | Land Status |
|-------|-------------|
| Green | USFS (public) |
| Yellow | BLM (public) |
| Light Green | NPS (public) |
| Teal | FWS (public) |
| Purple | State Trust (permit required) |
| Orange | Private/Unknown |
| Red | Military (restricted) |

## Development

Run individual pipeline steps:
```bash
make download   # Download data
make clip       # Clip to Arizona
make enrich     # Spatial joins
make tiles      # Generate tiles
```

Clean all generated data:
```bash
make clean
```

## License

MIT
