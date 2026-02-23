import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import duckdb
import httpx
import json
import time
import zipfile
import geopandas as gpd
from pipeline.utils import (
    AZ_BBOX,
    OVERTURE_S3_BASE,
    RAW_DIR,
    AZGFD_GMU_URL,
    BLM_SMA_BASE_URL,
    BLM_SMA_FEATURES_LAYERS,
    AZ_BOUNDARY_URL,
    Timer,
)

RAW_DIR.mkdir(parents=True, exist_ok=True)


def file_exists(path: Path, min_size_mb: float = 0.001) -> bool:
    if not path.exists():
        return False
    if path.stat().st_size < min_size_mb * 1_000_000:
        return False
    return True


def download_overture_transportation():
    with Timer("download_overture_transportation"):
        output_path = RAW_DIR / "overture_transportation_az.parquet"
        if file_exists(output_path, min_size_mb=1):
            print("  Transportation already downloaded, skipping.")
            return

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
            ) TO '{output_path}'
            (FORMAT PARQUET);
        """)
        print("  Transportation segments saved.")


def download_overture_places():
    with Timer("download_overture_places"):
        output_path = RAW_DIR / "overture_places_az.parquet"
        if file_exists(output_path, min_size_mb=1):
            print("  Places already downloaded, skipping.")
            return

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
            ) TO '{output_path}'
            (FORMAT PARQUET);
        """)
        print("  Places saved.")


def download_azgfd_gmus():
    with Timer("download_azgfd_gmus"):
        output_path = RAW_DIR / "azgfd_gmu.geojson"
        if file_exists(output_path, min_size_mb=1):
            print("  GMU boundaries already downloaded, skipping.")
            return

        print("Downloading AZGFD Game Management Unit boundaries...")
        with httpx.Client(timeout=120, follow_redirects=True) as client:
            response = client.get(AZGFD_GMU_URL)
            response.raise_for_status()
            with open(output_path, "w") as f:
                f.write(response.text)
        print("  GMU boundaries saved.")


def download_blm_sma():
    with Timer("download_blm_sma"):
        output_path = RAW_DIR / "blm_sma_az.geojson"
        if file_exists(output_path, min_size_mb=0.1):
            print("  BLM SMA already downloaded, skipping.")
            return

        print("Downloading BLM Surface Management Agency data (FEATURES layers)...")
        all_features = []
        page_size = 500
        
        xmin, ymin, xmax, ymax = AZ_BBOX['xmin'], AZ_BBOX['ymin'], AZ_BBOX['xmax'], AZ_BBOX['ymax']
        
        tiled_bboxes_2x2 = [
            f"{xmin},{ymin},{(xmin+xmax)/2},{(ymin+ymax)/2}",
            f"{(xmin+xmax)/2},{ymin},{xmax},{(ymin+ymax)/2}",
            f"{xmin},{(ymin+ymax)/2},{(xmin+xmax)/2},{ymax}",
            f"{(xmin+xmax)/2},{(ymin+ymax)/2},{xmax},{ymax}",
        ]
        
        full_bbox = f"{xmin},{ymin},{xmax},{ymax}"

        def convert_arcgis_to_geojson(arcgis_geom):
            if not arcgis_geom:
                return None
            if 'rings' in arcgis_geom:
                rings = arcgis_geom['rings']
                if len(rings) == 1:
                    return {'type': 'Polygon', 'coordinates': rings}
                else:
                    return {'type': 'MultiPolygon', 'coordinates': [[ring] for ring in rings]}
            if 'x' in arcgis_geom and 'y' in arcgis_geom:
                return {'type': 'Point', 'coordinates': [arcgis_geom['x'], arcgis_geom['y']]}
            if 'paths' in arcgis_geom:
                paths = arcgis_geom['paths']
                if len(paths) == 1:
                    return {'type': 'LineString', 'coordinates': paths[0]}
                else:
                    return {'type': 'MultiLineString', 'coordinates': paths}
            return arcgis_geom

        with httpx.Client(timeout=120) as client:
            for agency_name, layer_id in BLM_SMA_FEATURES_LAYERS.items():
                agency_start = time.time()
                print(f"  Querying {agency_name} layer ({layer_id})...")
                agency_count = 0
                
                use_tiled = agency_name in ["BLM", "STATE"]
                bboxes = tiled_bboxes_2x2 if use_tiled else [full_bbox]
                
                for bbox in bboxes:
                    offset = 0
                    while True:
                        url = f"{BLM_SMA_BASE_URL}/{layer_id}/query"
                        params = {
                            "geometry": bbox,
                            "geometryType": "esriGeometryEnvelope",
                            "inSR": "4326",
                            "spatialRel": "esriSpatialRelIntersects",
                            "outFields": "SMA_ID,ADMIN_DEPT_CODE,ADMIN_AGENCY_CODE,ADMIN_UNIT_NAME",
                            "f": "json",
                            "resultOffset": offset,
                            "resultRecordCount": page_size,
                            "outSR": "4326",
                        }
                        try:
                            response = client.get(url, params=params)
                            response.raise_for_status()
                            data = response.json()
                        except Exception as e:
                            print(f"    Error on bbox: {e}")
                            break

                        if data.get("error"):
                            if use_tiled:
                                print(f"    Tile error: {data['error'].get('message', 'unknown')}")
                            break

                        features = data.get("features", [])
                        if not features:
                            break

                        for f in features:
                            attrs = f.get("attributes", {})
                            agency_code = agency_name
                            if agency_name == "USFS":
                                agency_code = "FS"
                            elif agency_name == "STATE":
                                agency_code = "STP"
                            attrs["ADMIN_AGENCY_CODE"] = agency_code
                            
                            geojson_geom = convert_arcgis_to_geojson(f.get("geometry"))
                            
                            all_features.append({
                                "type": "Feature",
                                "geometry": geojson_geom,
                                "properties": attrs,
                            })
                            agency_count += 1

                        if len(features) < page_size:
                            break
                        offset += page_size
                
                agency_elapsed = time.time() - agency_start
                print(f"    {agency_name}: {agency_count} features in {agency_elapsed:.1f}s")

        geojson = {"type": "FeatureCollection", "features": all_features}
        with open(output_path, "w") as f:
            json.dump(geojson, f)
        print(f"  BLM SMA saved ({len(all_features)} total features).")


def download_az_boundary():
    with Timer("download_az_boundary"):
        output_path = RAW_DIR / "az_boundary.geojson"
        if file_exists(output_path, min_size_mb=0.001):
            print("  Arizona boundary already downloaded, skipping.")
            return

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
        az_gdf.to_file(output_path, driver="GeoJSON")

        zip_path.unlink()
        for f in extract_dir.glob("*"):
            f.unlink()
        extract_dir.rmdir()
        print("  Arizona boundary saved.")


def main():
    pipeline_start = time.time()
    print("=" * 60)
    print("AZ Hunt Planner - Data Download Pipeline")
    print("=" * 60)

    download_az_boundary()
    download_azgfd_gmus()
    download_blm_sma()
    download_overture_transportation()
    download_overture_places()

    pipeline_elapsed = time.time() - pipeline_start
    print("=" * 60)
    print(f"Download complete! Total time: {pipeline_elapsed:.1f}s")
    print("=" * 60)


if __name__ == "__main__":
    main()
