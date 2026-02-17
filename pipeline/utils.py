from pathlib import Path

AZ_BBOX = {
    "xmin": -114.82,
    "ymin": 31.33,
    "xmax": -109.04,
    "ymax": 37.00,
}

OVERTURE_RELEASE = "2026-01-21.0"
OVERTURE_S3_BASE = f"s3://overturemaps-us-west-2/release/{OVERTURE_RELEASE}"

DATA_DIR = Path(__file__).parent.parent / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
TILES_DIR = DATA_DIR / "tiles"

AGENCY_ACCESS_MAP = {
    "BLM": "public_blm",
    "FS": "public_usfs",
    "NPS": "public_nps",
    "FWS": "public_fws",
    "BOR": "public_bor",
    "DOD": "restricted_military",
    "STP": "state_trust",
}

HUNT_RELEVANT_ROAD_CLASSES = {"track", "path", "footway", "service", "tertiary", "unclassified"}

HUNT_POI_CATEGORIES = [
    "trailhead",
    "campground",
    "ranger_station",
    "parking",
    "rest_area",
    "picnic_area",
]

AZGFD_GMU_URL = "https://hub.arcgis.com/api/download/v1/items/9b4aa5c5f1014363bf3139ed931e205d/geojson?layers=0"

BLM_SMA_BASE_URL = "https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_Cached_without_PriUnk/MapServer"

BLM_SMA_LAYERS = {
    "BLM": 7,
    "NPS": 8,
    "USFS": 9,
    "FWS": 10,
    "USBR": 11,
    "DOD": 6,
    "STATE": 14,
}

AZ_BOUNDARY_URL = "https://www2.census.gov/geo/tiger/GENZ2022/shp/cb_2022_us_state_500k.zip"

USFS_FOREST_URL = "https://data.fs.usda.gov/geodata/edw/edw_resources/shp/BdyAdm_LSRS_AdministrativeForest.zip"
