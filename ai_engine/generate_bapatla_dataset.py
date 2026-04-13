import numpy as np
import pandas as pd

np.random.seed(42)

# =========================
# CONFIGURATION
# =========================
N = 2500

# Central Coordinates (Bapatla approx)
TOWN_CENTER_LAT = 15.904
TOWN_CENTER_LON = 80.467

BEACH_LAT = 15.875
BEACH_LON = 80.480

HIGHWAY_LAT = 15.890
HIGHWAY_LON = 80.470

# Zone base prices (per acre)
ZONE_BASE_PRICE = {
    "Zone-A": 6000000,   # ₹60L
    "Zone-B": 3500000,   # ₹35L
    "Zone-C": 1800000    # ₹18L
}

# Land use multipliers
LAND_USE_MULT = {
    "Commercial": 1.45,
    "Residential": 1.20,
    "Mixed": 1.30,
    "Agricultural": 0.85
}

ENCUMBRANCE_EFFECT = {
    "Clear": 1.00,
    "Minor": 0.92,
    "Disputed": 0.78
}

LAND_USE_OPTIONS = list(LAND_USE_MULT.keys())
ZONE_OPTIONS = list(ZONE_BASE_PRICE.keys())
ENCUMBRANCE_OPTIONS = list(ENCUMBRANCE_EFFECT.keys())

# =========================
# HELPER FUNCTIONS
# =========================

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat/2)**2 + np.cos(lat1)*np.cos(lat2)*np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    return R * c

def town_effect(dist):
    if dist < 5:
        return 1.20
    elif dist < 12:
        return 1.10
    else:
        return 0.95

def beach_effect(dist):
    if dist < 3:
        return 1.25
    elif dist < 8:
        return 1.12
    else:
        return 1.00

# =========================
# DATA GENERATION
# =========================

data = []

for i in range(N):
    survey_no = 2000 + i
    
    # Random geo spread within 20km radius
    lat = TOWN_CENTER_LAT + np.random.normal(0, 0.05)
    lon = TOWN_CENTER_LON + np.random.normal(0, 0.05)

    zone = np.random.choice(ZONE_OPTIONS, p=[0.4, 0.35, 0.25])
    land_use = np.random.choice(LAND_USE_OPTIONS)
    verified = np.random.choice([0, 1], p=[0.3, 0.7])
    encumbrance = np.random.choice(ENCUMBRANCE_OPTIONS, p=[0.75, 0.15, 0.10])

    area_acres = round(np.random.uniform(0.5, 10), 2)

    dist_town = haversine(lat, lon, TOWN_CENTER_LAT, TOWN_CENTER_LON)
    dist_beach = haversine(lat, lon, BEACH_LAT, BEACH_LON)
    dist_highway = haversine(lat, lon, HIGHWAY_LAT, HIGHWAY_LON)

    road_score = np.random.randint(1, 6)
    schools = np.random.poisson(3)
    hospitals = np.random.poisson(2)
    commercial_density = np.random.uniform(0.1, 1.0)
    dispute_count = np.random.poisson(0.5)

    # =========================
    # PRICE CALCULATION
    # =========================
    base_price = ZONE_BASE_PRICE[zone]
    land_mult = LAND_USE_MULT[land_use]
    legal_mult = ENCUMBRANCE_EFFECT[encumbrance]

    location_mult = (
        town_effect(dist_town) *
        beach_effect(dist_beach)
    )

    infra_mult = 1 + (road_score * 0.04)
    verified_bonus = 1.05 if verified == 1 else 0.97

    deterministic_price = (
        base_price *
        land_mult *
        location_mult *
        infra_mult *
        legal_mult *
        verified_bonus
    )

    # Controlled Gaussian noise (5%)
    noise = np.random.normal(1, 0.05)
    final_price = deterministic_price * noise

    data.append([
        survey_no,
        area_acres,
        land_use,
        zone,
        lat,
        lon,
        round(dist_town, 2),
        round(dist_beach, 2),
        round(dist_highway, 2),
        road_score,
        schools,
        hospitals,
        round(commercial_density, 2),
        dispute_count,
        encumbrance,
        verified,
        int(final_price)
    ])

# =========================
# CREATE DATAFRAME
# =========================

columns = [
    "Survey_No",
    "Area_Acres",
    "Land_Use",
    "Zone_Type",
    "Latitude",
    "Longitude",
    "Distance_to_Town_km",
    "Distance_to_Beach_km",
    "Distance_to_Highway_km",
    "Road_Connectivity_Score",
    "Nearby_Schools_Count",
    "Nearby_Hospitals_Count",
    "Commercial_Density_Index",
    "Dispute_Count",
    "Encumbrance_Status",
    "Verified",
    "Market_Price_Per_Acre"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("bapatla_synthetic_land_dataset.csv", index=False)

print("Dataset generated successfully.")
print("Rows:", len(df))
print("Saved as: bapatla_synthetic_land_dataset.csv")