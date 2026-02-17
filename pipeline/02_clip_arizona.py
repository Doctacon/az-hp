import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import geopandas as gpd
from pipeline.utils import RAW_DIR, PROCESSED_DIR

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def load_az_boundary():
    az_gdf = gpd.read_file(RAW_DIR / "az_boundary.geojson")
    az_gdf = az_gdf.to_crs("EPSG:4326")
    return az_gdf


def clip_layer(input_name: str, output_name: str, az_boundary: gpd.GeoDataFrame):
    input_path = RAW_DIR / f"{input_name}.parquet"
    output_path = PROCESSED_DIR / f"{output_name}.parquet"

    if not input_path.exists():
        print(f"  Skipping {input_name} (not found)")
        return

    print(f"  Clipping {input_name}...")
    gdf = gpd.read_parquet(input_path)
    gdf = gdf.set_crs("EPSG:4326", allow_override=True)

    clipped = gpd.clip(gdf, az_boundary)

    if len(clipped) > 0:
        clipped.to_parquet(output_path)
        print(f"    {len(gdf)} -> {len(clipped)} features")
    else:
        print(f"    No features after clipping")


def main():
    print("=" * 60)
    print("AZ Hunt Planner - Clip to Arizona Boundary")
    print("=" * 60)

    print("Loading Arizona boundary...")
    az_boundary = load_az_boundary()
    print(f"  Arizona boundary loaded ({len(az_boundary)} feature)")

    layers = [
        ("overture_transportation_az", "overture_transportation_clipped"),
        ("overture_land_use_az", "overture_land_use_clipped"),
        ("overture_land_cover_az", "overture_land_cover_clipped"),
        ("overture_land_az", "overture_land_clipped"),
        ("overture_water_az", "overture_water_clipped"),
        ("overture_buildings_az", "overture_buildings_clipped"),
        ("overture_places_az", "overture_places_clipped"),
    ]

    for input_name, output_name in layers:
        clip_layer(input_name, output_name, az_boundary)

    print("=" * 60)
    print("Clip complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
