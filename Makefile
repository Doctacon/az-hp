.PHONY: download clip enrich tiles build-frontend all clean

all: download clip enrich tiles build-frontend

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
	@echo "  make all            - Run full pipeline (download, clip, enrich, tiles, build)"
	@echo "  make download       - Download all data sources"
	@echo "  make clip           - Clip Overture data to Arizona boundary"
	@echo "  make enrich         - Enrich roads with land ownership and hunt units"
	@echo "  make tiles          - Generate PMTiles from processed data"
	@echo "  make build-frontend - Build frontend for production"
	@echo "  make dev-frontend   - Start frontend development server"
	@echo "  make clean          - Remove all generated data and build artifacts"
