import sys
import time
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
    Timer,
)

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def enrich_roads():
    with Timer("enrich_roads"):
        output_path = PROCESSED_DIR / "roads_enriched.parquet"
        if output_path.exists() and output_path.stat().st_size > 1_000_000:
            print("Roads already enriched, skipping.")
            return

        print("Enriching roads with land ownership and hunt unit data...")

        step_start = time.time()
        print("  Loading roads...")
        roads = gpd.read_parquet(PROCESSED_DIR / "overture_transportation_clipped.parquet")
        roads = roads.to_crs("EPSG:4326")
        print(f"    TIMING [load roads]: {time.time() - step_start:.1f}s ({len(roads)} features)")

        step_start = time.time()
        print("  Loading BLM SMA...")
        sma = gpd.read_file(RAW_DIR / "blm_sma_az.geojson")
        sma = sma.to_crs("EPSG:4326")
        print(f"    TIMING [load sma]: {time.time() - step_start:.1f}s ({len(sma)} features)")

        step_start = time.time()
        print("  Loading AZGFD GMUs...")
        gmus = gpd.read_file(RAW_DIR / "azgfd_gmu.geojson")
        gmus = gmus.to_crs("EPSG:4326")
        print(f"    TIMING [load gmus]: {time.time() - step_start:.1f}s ({len(gmus)} features)")

        sma_cols = ["geometry", "ADMIN_AGENCY_CODE", "ADMIN_UNIT_NAME"]
        sma_filtered = sma[[c for c in sma_cols if c in sma.columns]]

        step_start = time.time()
        print("  Creating representative points for roads...")
        roads_orig_geom = roads.geometry.copy()
        roads["rep_point"] = roads.geometry.representative_point()
        roads_points = roads.set_geometry("rep_point")
        print(f"    TIMING [create rep points]: {time.time() - step_start:.1f}s")

        step_start = time.time()
        print("  Spatial join: roads x land ownership...")
        roads_with_owner = gpd.sjoin(
            roads_points,
            sma_filtered,
            how="left",
            predicate="within",
        )
        print(f"    TIMING [sjoin roads x sma]: {time.time() - step_start:.1f}s")

        def map_agency_code(row):
            code = row.get("ADMIN_AGENCY_CODE")
            if code is None or str(code) == "nan":
                return "private_or_unknown"
            return AGENCY_ACCESS_MAP.get(str(code), "private_or_unknown")

        step_start = time.time()
        roads_with_owner["land_status"] = roads_with_owner.apply(map_agency_code, axis=1)
        print(f"    TIMING [map agency codes]: {time.time() - step_start:.1f}s")

        roads_with_owner = roads_with_owner.drop(columns=["index_right"], errors="ignore")

        step_start = time.time()
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
        print(f"    TIMING [sjoin roads x gmus]: {time.time() - step_start:.1f}s")

        step_start = time.time()
        roads_enriched = roads_enriched.set_geometry("rep_point")
        roads_enriched["geometry"] = roads_orig_geom.loc[roads_enriched.index].values
        roads_enriched = roads_enriched.set_geometry("geometry")
        roads_enriched = roads_enriched.drop(columns=["rep_point"], errors="ignore")
        print(f"    TIMING [restore geometries]: {time.time() - step_start:.1f}s")

        step_start = time.time()
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
        print(f"    TIMING [apply transformations]: {time.time() - step_start:.1f}s")

        drop_cols = ["index_right", "index_right0"]
        roads_enriched = roads_enriched.drop(columns=[c for c in drop_cols if c in roads_enriched.columns], errors="ignore")

        step_start = time.time()
        output_path = PROCESSED_DIR / "roads_enriched.parquet"
        roads_enriched.to_parquet(output_path)
        print(f"    TIMING [save parquet]: {time.time() - step_start:.1f}s")
        print(f"  Saved {len(roads_enriched)} enriched road segments to {output_path}")


def filter_hunt_pois():
    with Timer("filter_hunt_pois"):
        output_path = PROCESSED_DIR / "places_hunt.parquet"
        if output_path.exists() and output_path.stat().st_size > 10_000:
            print("Places already filtered, skipping.")
            return

        print("Filtering hunt-relevant POIs...")

        step_start = time.time()
        print("  Loading places...")
        places = gpd.read_parquet(PROCESSED_DIR / "overture_places_clipped.parquet")
        places = places.to_crs("EPSG:4326")
        print(f"    TIMING [load places]: {time.time() - step_start:.1f}s ({len(places)} features)")

        def is_hunt_relevant(row):
            categories = row.get("categories")
            if categories is None:
                return False

            cat_str = ""
            if isinstance(categories, dict):
                primary = categories.get("primary", "")
                alternate = categories.get("alternate", [])
                alt_str = " ".join(alternate) if alternate is not None and len(alternate) > 0 else ""
                cat_str = f"{primary} {alt_str}".lower()
            elif isinstance(categories, str):
                try:
                    parsed = json.loads(categories)
                    primary = parsed.get("primary", "")
                    alternate = parsed.get("alternate", [])
                    alt_str = " ".join(alternate) if alternate is not None and len(alternate) > 0 else ""
                    cat_str = f"{primary} {alt_str}".lower()
                except:
                    cat_str = categories.lower()
            elif isinstance(categories, list):
                cat_str = " ".join(str(c) for c in categories).lower()

            for hunt_cat in HUNT_POI_CATEGORIES:
                if hunt_cat in cat_str:
                    return True
            return False

        step_start = time.time()
        places["hunt_relevant"] = places.apply(is_hunt_relevant, axis=1)
        print(f"    TIMING [apply hunt filter]: {time.time() - step_start:.1f}s")

        hunt_places = places[places["hunt_relevant"]]

        step_start = time.time()
        output_path = PROCESSED_DIR / "places_hunt.parquet"
        hunt_places.to_parquet(output_path)
        print(f"    TIMING [save parquet]: {time.time() - step_start:.1f}s")
        print(f"  Saved {len(hunt_places)} hunt-relevant POIs to {output_path}")


def prepare_static_layers():
    with Timer("prepare_static_layers"):
        print("Preparing static layers for frontend...")

        frontend_data = Path(__file__).parent.parent / "frontend" / "public" / "data"
        frontend_data.mkdir(parents=True, exist_ok=True)

        step_start = time.time()
        print("  Copying AZGFD GMUs...")
        gmu_gdf = gpd.read_file(RAW_DIR / "azgfd_gmu.geojson")
        keep_cols = ["GMUNAME", "REG_NAME", "ACRES", "LANDOWN", "HUNT", "AGFDLink", "geometry"]
        gmu_filtered = gmu_gdf[[c for c in keep_cols if c in gmu_gdf.columns]]
        gmu_filtered.to_file(PROCESSED_DIR / "hunt_units.geojson", driver="GeoJSON")
        print(f"    TIMING [save gmus]: {time.time() - step_start:.1f}s")

        step_start = time.time()
        print("  Copying BLM SMA...")
        sma_gdf = gpd.read_file(RAW_DIR / "blm_sma_az.geojson")
        keep_cols = ["ADMIN_AGENCY_CODE", "ADMIN_UNIT_NAME", "geometry"]
        sma_filtered = sma_gdf[[c for c in keep_cols if c in sma_gdf.columns]]
        sma_filtered.to_file(PROCESSED_DIR / "land_ownership.geojson", driver="GeoJSON")
        print(f"    TIMING [save sma]: {time.time() - step_start:.1f}s")

        print("  Static layers saved to processed/ for PMTiles generation.")


def main():
    pipeline_start = time.time()
    print("=" * 60)
    print("AZ Hunt Planner - Data Enrichment")
    print("=" * 60)

    enrich_roads()
    filter_hunt_pois()
    prepare_static_layers()

    pipeline_elapsed = time.time() - pipeline_start
    print("=" * 60)
    print(f"Enrichment complete! Total time: {pipeline_elapsed:.1f}s")
    print("=" * 60)


if __name__ == "__main__":
    main()
