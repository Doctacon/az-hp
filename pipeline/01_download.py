import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import duckdb
import httpx
import json
import zipfile
from pipeline.utils import (
    AZ_BBOX,
    OVERTURE_S3_BASE,
    RAW_DIR,
    AZGFD_GMU_URL,
    BLM_SMA_BASE_URL,
    BLM_SMA_LAYERS,
    AZ_BOUNDARY_URL,
    USFS_FOREST_URL,
)

RAW_DIR.mkdir(parents=True, exist_ok=True)


def download_overture_transportation():
    print("Downloading Overture transportation segments...")
    con = duckdb.connect()
    con.execute("INSTALL spatial; LOAD spatial;")
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute("SET s3_region = 'us-west-2';")

    con.execute(f"""
        COPY (
            SELECT id, geometry, subtype, class, subclass, names,
                   road_surface, road_flags, access_restrictions
            FROM read_parquet(
                '{OVERTURE_S3_BASE}/theme=transportation/type=segment/*',
                hive_partitioning=true
            )
            WHERE bbox.xmin >= {AZ_BBOX['xmin']}
              AND bbox.xmax <= {AZ_BBOX['xmax']}
              AND bbox.ymin >= {AZ_BBOX['ymin']}
              AND bbox.ymax <= {AZ_BBOX['ymax']}
        ) TO '{RAW_DIR}/overture_transportation_az.parquet'
        (FORMAT PARQUET);
    """)
    print("  Transportation segments saved.")


def download_overture_base_layers():
    con = duckdb.connect()
    con.execute("INSTALL spatial; LOAD spatial;")
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute("SET s3_region = 'us-west-2';")

    base_types = [
        ("land_use", "id, geometry, subtype, class, names"),
        ("land_cover", "id, geometry, subtype"),
        ("land", "id, geometry, subtype, class, names, elevation"),
        ("water", "id, geometry, subtype, class, names, is_intermittent"),
    ]

    for feature_type, columns in base_types:
        print(f"Downloading Overture base/{feature_type}...")
        con.execute(f"""
            COPY (
                SELECT {columns}
                FROM read_parquet(
                    '{OVERTURE_S3_BASE}/theme=base/type={feature_type}/*',
                    hive_partitioning=true
                )
                WHERE bbox.xmin >= {AZ_BBOX['xmin']}
                  AND bbox.xmax <= {AZ_BBOX['xmax']}
                  AND bbox.ymin >= {AZ_BBOX['ymin']}
                  AND bbox.ymax <= {AZ_BBOX['ymax']}
            ) TO '{RAW_DIR}/overture_{feature_type}_az.parquet'
            (FORMAT PARQUET);
        """)
        print(f"  {feature_type} saved.")


def download_overture_buildings():
    print("Downloading Overture buildings...")
    con = duckdb.connect()
    con.execute("INSTALL spatial; LOAD spatial;")
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute("SET s3_region = 'us-west-2';")

    con.execute(f"""
        COPY (
            SELECT id, geometry, subtype, class, names, height, num_floors
            FROM read_parquet(
                '{OVERTURE_S3_BASE}/theme=buildings/type=building/*',
                hive_partitioning=true
            )
            WHERE bbox.xmin >= {AZ_BBOX['xmin']}
              AND bbox.xmax <= {AZ_BBOX['xmax']}
              AND bbox.ymin >= {AZ_BBOX['ymin']}
              AND bbox.ymax <= {AZ_BBOX['ymax']}
        ) TO '{RAW_DIR}/overture_buildings_az.parquet'
        (FORMAT PARQUET);
    """)
    print("  Buildings saved.")


def download_overture_places():
    print("Downloading Overture places...")
    con = duckdb.connect()
    con.execute("INSTALL spatial; LOAD spatial;")
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute("SET s3_region = 'us-west-2';")

    con.execute(f"""
        COPY (
            SELECT id, geometry, names, categories, confidence
            FROM read_parquet(
                '{OVERTURE_S3_BASE}/theme=places/type=place/*',
                hive_partitioning=true
            )
            WHERE bbox.xmin >= {AZ_BBOX['xmin']}
              AND bbox.xmax <= {AZ_BBOX['xmax']}
              AND bbox.ymin >= {AZ_BBOX['ymin']}
              AND bbox.ymax <= {AZ_BBOX['ymax']}
        ) TO '{RAW_DIR}/overture_places_az.parquet'
        (FORMAT PARQUET);
    """)
    print("  Places saved.")


def download_azgfd_gmus():
    print("Downloading AZGFD Game Management Unit boundaries...")
    with httpx.Client(timeout=120, follow_redirects=True) as client:
        response = client.get(AZGFD_GMU_URL)
        response.raise_for_status()
        with open(RAW_DIR / "azgfd_gmu.geojson", "w") as f:
            f.write(response.text)
    print("  GMU boundaries saved.")


def download_blm_sma():
    print("Downloading BLM Surface Management Agency data for Arizona...")
    all_features = []
    page_size = 1000

    bbox = f"{AZ_BBOX['xmin']},{AZ_BBOX['ymin']},{AZ_BBOX['xmax']},{AZ_BBOX['ymax']}"

    with httpx.Client(timeout=120) as client:
        for agency_name, layer_id in BLM_SMA_LAYERS.items():
            print(f"  Querying {agency_name} layer ({layer_id})...")
            offset = 0
            
            while True:
                url = f"{BLM_SMA_BASE_URL}/{layer_id}/query"
                params = {
                    "geometry": bbox,
                    "geometryType": "esriGeometryEnvelope",
                    "inSR": "4326",
                    "spatialRel": "esriSpatialRelIntersects",
                    "outFields": "SMA_ID,ADMIN_DEPT_CODE,ADMIN_AGENCY_CODE,ADMIN_UNIT_NAME,ADMIN_UNIT_TYPE",
                    "f": "json",
                    "resultOffset": offset,
                    "resultRecordCount": page_size,
                    "outSR": "4326",
                }
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("error"):
                    print(f"    Error: {data['error']}")
                    break

                features = data.get("features", [])
                if not features:
                    break

                for f in features:
                    attrs = f.get("attributes", {})
                    attrs["ADMIN_AGENCY_CODE"] = agency_name if agency_name != "USFS" else "FS"
                    attrs["ADMIN_AGENCY_CODE"] = "FWS" if attrs["ADMIN_AGENCY_CODE"] == "FWS" else attrs["ADMIN_AGENCY_CODE"]
                    all_features.append({
                        "type": "Feature",
                        "geometry": f.get("geometry"),
                        "properties": attrs,
                    })

                print(f"    Fetched {len(all_features)} total features...")

                if len(features) < page_size:
                    break
                offset += page_size

    geojson = {"type": "FeatureCollection", "features": all_features}
    with open(RAW_DIR / "blm_sma_az.geojson", "w") as f:
        json.dump(geojson, f)
    print(f"  BLM SMA saved ({len(all_features)} features).")


def download_az_boundary():
    import geopandas as gpd
    print("Downloading Arizona state boundary...")
    zip_path = RAW_DIR / "cb_2022_us_state_500k.zip"
    extract_dir = RAW_DIR / "census_states"

    with httpx.Client(timeout=120) as client:
        response = client.get(AZ_BOUNDARY_URL)
        response.raise_for_status()
        with open(zip_path, "wb") as f:
            f.write(response.content)

    extract_dir.mkdir(exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)

    shp_files = list(extract_dir.glob("*.shp"))
    if not shp_files:
        raise FileNotFoundError("No shapefile found in census download")
    
    states_gdf = gpd.read_file(shp_files[0])
    az_gdf = states_gdf[states_gdf["STUSPS"] == "AZ"]
    az_gdf = az_gdf.to_crs("EPSG:4326")
    az_gdf.to_file(RAW_DIR / "az_boundary.geojson", driver="GeoJSON")

    zip_path.unlink()
    for f in extract_dir.glob("*"):
        f.unlink()
    extract_dir.rmdir()
    print("  Arizona boundary saved.")


def download_usfs_forests():
    print("Downloading USFS Administrative Forest boundaries...")
    zip_path = RAW_DIR / "usfs_forests.zip"
    extract_dir = RAW_DIR / "usfs_forests"

    with httpx.Client(timeout=300) as client:
        response = client.get(USFS_FOREST_URL)
        response.raise_for_status()
        with open(zip_path, "wb") as f:
            f.write(response.content)

    extract_dir.mkdir(exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)

    zip_path.unlink()
    print("  USFS forest boundaries saved.")


def main():
    print("=" * 60)
    print("AZ Hunt Planner - Data Download Pipeline")
    print("=" * 60)

    download_az_boundary()
    download_azgfd_gmus()
    download_blm_sma()
    download_usfs_forests()
    download_overture_transportation()
    download_overture_base_layers()
    download_overture_buildings()
    download_overture_places()

    print("=" * 60)
    print("Download complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
