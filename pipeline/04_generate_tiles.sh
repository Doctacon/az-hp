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

echo "Generating PMTiles with tippecanoe..."
echo "  (Streaming parquet → tippecanoe via process substitution)"
echo ""

generate_tiles_parquet() {
    local name=$1
    local source_layer=$2
    local minzoom=$3
    local maxzoom=$4
    local extra_opts=$5
    local input_path="$PROCESSED_DIR/${name}.parquet"
    local output_path="$TILES_DIR/${source_layer}.pmtiles"
    
    if [ ! -f "$input_path" ]; then
        echo "  Skipping $name (parquet not found)"
        return 1
    fi
    
    echo "  $name..."
    tippecanoe \
        -o "$output_path" \
        -l "$source_layer" \
        --minimum-zoom=$minzoom \
        --maximum-zoom=$maxzoom \
        $extra_opts \
        --force \
        <(ogr2ogr -f GeoJSONSeq /vsistdout/ "$input_path" 2>/dev/null) \
        2>&1 | grep -E "(features|Warning|Error)" || true
}

generate_tiles_geojson() {
    local name=$1
    local source_layer=$2
    local minzoom=$3
    local maxzoom=$4
    local extra_opts=$5
    local input_path="$PROCESSED_DIR/${name}.geojson"
    local output_path="$TILES_DIR/${source_layer}.pmtiles"
    
    if [ ! -f "$input_path" ]; then
        echo "  Skipping $name (geojson not found)"
        return 1
    fi
    
    echo "  $name..."
    tippecanoe \
        -o "$output_path" \
        -l "$source_layer" \
        --minimum-zoom=$minzoom \
        --maximum-zoom=$maxzoom \
        $extra_opts \
        --force \
        "$input_path" \
        2>&1 | grep -E "(features|Warning|Error)" || true
}

echo "Starting parallel tile generation..."

generate_tiles_parquet "roads_enriched" "roads" 6 14 "--drop-densest-as-needed --extend-zooms-if-still-dropping" &
PID1=$!

generate_tiles_parquet "places_hunt" "places" 8 14 "-r1" &
PID2=$!

generate_tiles_geojson "hunt_units" "hunt-units" 6 14 "--no-tile-size-limit" &
PID3=$!

generate_tiles_geojson "land_ownership" "land-ownership" 8 14 "--drop-densest-as-needed --coalesce-densest-as-needed" &
PID4=$!

echo "Waiting for tile generation to complete..."
wait $PID1 || echo "  roads had issues"
wait $PID2 || echo "  places had issues"
wait $PID3 || echo "  hunt-units had issues"
wait $PID4 || echo "  land-ownership had issues"

echo ""
echo "Copying PMTiles to frontend..."
for f in roads places hunt-units land-ownership; do
    if [ -f "$TILES_DIR/${f}.pmtiles" ]; then
        cp "$TILES_DIR/${f}.pmtiles" "$FRONTEND_DATA/"
        echo "  Copied ${f}.pmtiles"
    fi
done

echo ""
echo "============================================"
echo "Tile generation complete!"
echo "============================================"
