import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import geopandas as gpd
import json
from pipeline.utils import (
    RAW_DIR,
    PROCESSED_DIR,
    AGENCY_ACCESS_MAP,
    HUNT_RELEVANT_ROAD_CLASSES,
    HUNT_POI_CATEGORIES,
)

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def enrich_roads():
    print("Enriching roads with land ownership and hunt unit data...")

    print("  Loading roads...")
    roads = gpd.read_parquet(PROCESSED_DIR / "overture_transportation_clipped.parquet")
    roads = roads.to_crs("EPSG:4326")

    print("  Loading BLM SMA...")
    sma = gpd.read_file(RAW_DIR / "blm_sma_az.geojson")
    sma = sma.to_crs("EPSG:4326")

    print("  Loading AZGFD GMUs...")
    gmus = gpd.read_file(RAW_DIR / "azgfd_gmu.geojson")
    gmus = gmus.to_crs("EPSG:4326")

    sma_cols = ["geometry", "ADMIN_AGENCY_CODE", "ADMIN_UNIT_NAME", "ADMIN_DEPT_CODE"]
    sma_filtered = sma[[c for c in sma_cols if c in sma.columns]]

    print("  Creating representative points for roads...")
    roads_orig_geom = roads.geometry.copy()
    roads["rep_point"] = roads.geometry.representative_point()
    roads_points = roads.set_geometry("rep_point")

    print("  Spatial join: roads x land ownership...")
    roads_with_owner = gpd.sjoin(
        roads_points,
        sma_filtered,
        how="left",
        predicate="within",
    )

    def map_agency_code(row):
        code = row.get("ADMIN_AGENCY_CODE")
        if code is None or str(code) == "nan":
            return "private_or_unknown"
        return AGENCY_ACCESS_MAP.get(str(code), "private_or_unknown")

    roads_with_owner["land_status"] = roads_with_owner.apply(map_agency_code, axis=1)

    print("  Spatial join: roads x hunt units...")
    gmu_cols = ["geometry", "GMUNAME", "REG_NAME", "ACRES", "AGFDLink"]
    gmus_filtered = gmus[[c for c in gmu_cols if c in gmus.columns]]

    roads_points2 = roads_with_owner.set_geometry(
        roads_with_owner.geometry.representative_point()
    )
    roads_enriched = gpd.sjoin(
        roads_points2,
        gmus_filtered,
        how="left",
        predicate="within",
    )

    roads_enriched = roads_enriched.set_geometry("rep_point")
    roads_enriched["geometry"] = roads_orig_geom.loc[roads_enriched.index].values
    roads_enriched = roads_enriched.set_geometry("geometry")
    roads_enriched = roads_enriched.drop(columns=["rep_point"], errors="ignore")

    if "class" in roads_enriched.columns:
        roads_enriched["hunt_relevant"] = roads_enriched["class"].apply(
            lambda c: str(c).lower() in HUNT_RELEVANT_ROAD_CLASSES if c else False
        )
    else:
        roads_enriched["hunt_relevant"] = False

    def extract_road_name(row):
        names = row.get("names")
        if names is None:
            return None
        if isinstance(names, dict):
            return names.get("primary")
        if isinstance(names, str):
            try:
                parsed = json.loads(names)
                return parsed.get("primary")
            except:
                return names
        return None

    roads_enriched["road_name"] = roads_enriched.apply(extract_road_name, axis=1)

    def extract_surface(row):
        surface = row.get("road_surface")
        if surface is None:
            return "unknown"
        if isinstance(surface, list) and len(surface) > 0:
            first = surface[0]
            if isinstance(first, dict):
                return first.get("value", "unknown")
        return "unknown"

    roads_enriched["surface"] = roads_enriched.apply(extract_surface, axis=1)

    drop_cols = ["index_right", "index_right0"]
    roads_enriched = roads_enriched.drop(columns=[c for c in drop_cols if c in roads_enriched.columns], errors="ignore")

    output_path = PROCESSED_DIR / "roads_enriched.parquet"
    roads_enriched.to_parquet(output_path)
    print(f"  Saved {len(roads_enriched)} enriched road segments to {output_path}")


def filter_hunt_pois():
    print("Filtering hunt-relevant POIs...")

    print("  Loading places...")
    places = gpd.read_parquet(PROCESSED_DIR / "overture_places_clipped.parquet")
    places = places.to_crs("EPSG:4326")

    def is_hunt_relevant(row):
        categories = row.get("categories")
        if categories is None:
            return False

        cat_str = ""
        if isinstance(categories, dict):
            primary = categories.get("primary", "")
            alternate = categories.get("alternate", [])
            cat_str = f"{primary} {' '.join(alternate if alternate else [])}".lower()
        elif isinstance(categories, str):
            try:
                parsed = json.loads(categories)
                primary = parsed.get("primary", "")
                alternate = parsed.get("alternate", [])
                cat_str = f"{primary} {' '.join(alternate if alternate else [])}".lower()
            except:
                cat_str = categories.lower()
        elif isinstance(categories, list):
            cat_str = " ".join(str(c) for c in categories).lower()

        for hunt_cat in HUNT_POI_CATEGORIES:
            if hunt_cat in cat_str:
                return True
        return False

    places["hunt_relevant"] = places.apply(is_hunt_relevant, axis=1)
    hunt_places = places[places["hunt_relevant"]]

    output_path = PROCESSED_DIR / "places_hunt.parquet"
    hunt_places.to_parquet(output_path)
    print(f"  Saved {len(hunt_places)} hunt-relevant POIs to {output_path}")


def prepare_static_layers():
    print("Preparing static layers for frontend...")

    frontend_data = Path(__file__).parent.parent / "frontend" / "public" / "data"
    frontend_data.mkdir(parents=True, exist_ok=True)

    print("  Copying AZGFD GMUs...")
    gmu_gdf = gpd.read_file(RAW_DIR / "azgfd_gmu.geojson")
    keep_cols = ["GMUNAME", "REG_NAME", "ACRES", "LANDOWN", "HUNT", "AGFDLink", "geometry"]
    gmu_filtered = gmu_gdf[[c for c in keep_cols if c in gmu_gdf.columns]]
    gmu_filtered.to_file(frontend_data / "azgfd_gmu.geojson", driver="GeoJSON")

    print("  Copying BLM SMA...")
    sma_gdf = gpd.read_file(RAW_DIR / "blm_sma_az.geojson")
    keep_cols = ["ADMIN_AGENCY_CODE", "ADMIN_UNIT_NAME", "ADMIN_DEPT_CODE", "geometry"]
    sma_filtered = sma_gdf[[c for c in keep_cols if c in sma_gdf.columns]]
    sma_filtered.to_file(frontend_data / "blm_sma_az.geojson", driver="GeoJSON")

    print("  Static layers saved.")


def main():
    print("=" * 60)
    print("AZ Hunt Planner - Data Enrichment")
    print("=" * 60)

    enrich_roads()
    filter_hunt_pois()
    prepare_static_layers()

    print("=" * 60)
    print("Enrichment complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
