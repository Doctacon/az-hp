#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/data"
PROCESSED_DIR="$DATA_DIR/processed"
TILES_DIR="$DATA_DIR/tiles"
FRONTEND_DATA="$PROJECT_DIR/frontend/public/data"

mkdir -p "$TILES_DIR"
mkdir -p "$FRONTEND_DATA"

echo "============================================"
echo "AZ Hunt Planner - Tile Generation"
echo "============================================"

cd "$PROJECT_DIR"

echo "Converting Parquet layers to GeoJSON..."
uv run python -c "
import geopandas as gpd
from pathlib import Path

processed_dir = Path('$PROCESSED_DIR')
layers = [
    'roads_enriched',
    'places_hunt',
    'overture_water_clipped',
    'overture_land_cover_clipped',
    'overture_buildings_clipped',
]

for layer in layers:
    parquet_path = processed_dir / f'{layer}.parquet'
    if parquet_path.exists():
        print(f'Converting {layer}...')
        gdf = gpd.read_parquet(parquet_path)
        geojson_path = processed_dir / f'{layer}.geojson'
        gdf.to_file(geojson_path, driver='GeoJSON')
        print(f'  {layer}: {len(gdf)} features')
    else:
        print(f'Skipping {layer} (not found)')
"

echo ""
echo "Generating PMTiles with tippecanoe..."

echo "  Roads..."
tippecanoe \
    -o "$TILES_DIR/roads.pmtiles" \
    -l roads \
    --minimum-zoom=6 \
    --maximum-zoom=14 \
    --drop-densest-as-needed \
    --extend-zooms-if-still-dropping \
    --force \
    "$PROCESSED_DIR/roads_enriched.geojson" \
    2>/dev/null || echo "    Warning: roads tile generation had issues"

echo "  Places..."
if [ -f "$PROCESSED_DIR/places_hunt.geojson" ]; then
    tippecanoe \
        -o "$TILES_DIR/places.pmtiles" \
        -l places \
        --minimum-zoom=8 \
        --maximum-zoom=14 \
        -r1 \
        --force \
        "$PROCESSED_DIR/places_hunt.geojson" \
        2>/dev/null || echo "    Warning: places tile generation had issues"
fi

echo "  Water..."
if [ -f "$PROCESSED_DIR/overture_water_clipped.geojson" ]; then
    tippecanoe \
        -o "$TILES_DIR/water.pmtiles" \
        -l water \
        --minimum-zoom=6 \
        --maximum-zoom=14 \
        --coalesce-densest-as-needed \
        --force \
        "$PROCESSED_DIR/overture_water_clipped.geojson" \
        2>/dev/null || echo "    Warning: water tile generation had issues"
fi

echo "  Land cover..."
if [ -f "$PROCESSED_DIR/overture_land_cover_clipped.geojson" ]; then
    tippecanoe \
        -o "$TILES_DIR/landcover.pmtiles" \
        -l landcover \
        --minimum-zoom=4 \
        --maximum-zoom=12 \
        --coalesce-densest-as-needed \
        --force \
        "$PROCESSED_DIR/overture_land_cover_clipped.geojson" \
        2>/dev/null || echo "    Warning: landcover tile generation had issues"
fi

echo "  Buildings..."
if [ -f "$PROCESSED_DIR/overture_buildings_clipped.geojson" ]; then
    tippecanoe \
        -o "$TILES_DIR/buildings.pmtiles" \
        -l buildings \
        --minimum-zoom=12 \
        --maximum-zoom=14 \
        --drop-densest-as-needed \
        --force \
        "$PROCESSED_DIR/overture_buildings_clipped.geojson" \
        2>/dev/null || echo "    Warning: buildings tile generation had issues"
fi

echo ""
echo "Copying PMTiles to frontend..."
cp "$TILES_DIR"/*.pmtiles "$FRONTEND_DATA/" 2>/dev/null || echo "  No PMTiles to copy"

echo ""
echo "============================================"
echo "Tile generation complete!"
echo "============================================"
