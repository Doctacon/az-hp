.PHONY: download clip enrich tiles basemap terrain build-frontend all clean

all: download clip enrich tiles basemap build-frontend

download:
	@echo "=== Downloading data ==="
	uv run python pipeline/01_download.py

clip:
	@echo "=== Clipping to Arizona boundary ==="
	uv run python pipeline/02_clip_arizona.py

enrich:
	@echo "=== Enriching data with spatial joins ==="
	uv run python pipeline/03_enrich.py

tiles:
	@echo "=== Generating PMTiles ==="
	bash pipeline/04_generate_tiles.sh

basemap:
	@echo "=== Downloading Protomaps basemap ==="
	pmtiles extract https://build.protomaps.com/$(shell date +%Y%m%d).pmtiles \
		frontend/public/data/basemap.pmtiles \
		--bbox=-115.5,30.5,-108.0,37.5

terrain:
	@echo "=== Downloading Mapterhorn terrain DEM ==="
	pmtiles extract https://download.mapterhorn.com/planet.pmtiles \
		frontend/public/data/terrain.pmtiles \
		--bbox=-115.0,31.0,-108.5,37.5

build-frontend:
	@echo "=== Building frontend ==="
	cd frontend && npm run build

dev-frontend:
	cd frontend && npm run dev

clean:
	rm -rf data/raw/*
	rm -rf data/processed/*
	rm -rf data/tiles/*
	rm -rf frontend/public/data/*.geojson
	rm -rf frontend/public/data/*.pmtiles
	rm -rf frontend/dist/

help:
	@echo "AZ Hunt Planner - Makefile commands"
	@echo ""
	@echo "  make all            - Run full pipeline (download, clip, enrich, tiles, basemap, build)"
	@echo "  make download       - Download all data sources"
	@echo "  make clip           - Clip Overture data to Arizona boundary"
	@echo "  make enrich         - Enrich roads with land ownership and hunt units"
	@echo "  make tiles          - Generate PMTiles from processed data"
	@echo "  make basemap        - Download Protomaps Arizona basemap"
	@echo "  make terrain        - Download Mapterhorn terrain DEM for Arizona"
	@echo "  make build-frontend - Build frontend for production"
	@echo "  make dev-frontend   - Start frontend development server"
	@echo "  make clean          - Remove all generated data and build artifacts"
