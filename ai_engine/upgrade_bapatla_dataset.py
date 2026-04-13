import pandas as pd
import numpy as np

np.random.seed(42)

# -------- LOAD ORIGINAL REAL DATA --------
df_original = pd.read_csv("../server/uploads/bapatla_land_dataset.csv")

expanded_rows = []

# -------- REGION CLASSIFICATION --------
def classify_region(lat, lon):
    if lat < 15.90:
        return "Coastal"
    elif lat < 15.92:
        return "Town Core"
    elif lon > 80.48:
        return "Highway Belt"
    else:
        return "Rural"

# -------- ECONOMIC BASE (Reduced dominance) --------
zone_base = {
    "Zone-A": 6000000,
    "Zone-B": 4200000,
    "Zone-C": 2600000
}

region_multiplier = {
    "Coastal": 1.5,
    "Town Core": 1.35,
    "Highway Belt": 1.25,
    "Rural": 0.95
}

land_use_multiplier = {
    "Commercial": 1.45,
    "Residential": 1.25,
    "Mixed": 1.30,
    "Agriculture": 0.85
}

legal_multiplier = {
    "Clear": 1.0,
    "Minor": 0.80,
    "Disputed": 0.55
}

statuses = ["Clear", "Minor", "Disputed"]

# -------- EXPANSION LOOP --------
for _, row in df_original.iterrows():

    for i in range(18):  # Increased expansion → stronger dataset

        new_row = row.copy()

        # Area variation
        new_row["Area_Acres"] = max(
            0.5,
            row["Area_Acres"] * np.random.uniform(0.85, 1.15)
        )

        region = classify_region(row["Latitude"], row["Longitude"])
        new_row["Region_Label"] = region

        # -------- REGION-DEPENDENT DISTANCES --------
        if region == "Coastal":
            town_dist = np.random.uniform(5, 14)
            beach_dist = np.random.uniform(0.2, 1.5)
            highway_dist = np.random.uniform(3, 9)
        elif region == "Town Core":
            town_dist = np.random.uniform(0.3, 2)
            beach_dist = np.random.uniform(4, 10)
            highway_dist = np.random.uniform(2, 6)
        elif region == "Highway Belt":
            town_dist = np.random.uniform(3, 9)
            beach_dist = np.random.uniform(5, 12)
            highway_dist = np.random.uniform(0.2, 1.5)
        else:
            town_dist = np.random.uniform(7, 15)
            beach_dist = np.random.uniform(6, 15)
            highway_dist = np.random.uniform(5, 12)

        new_row["Distance_to_Town_km"] = town_dist
        new_row["Distance_to_Beach_km"] = beach_dist
        new_row["Distance_to_Highway_km"] = highway_dist

        # -------- STRONGER INFRASTRUCTURE --------
        connectivity = np.random.randint(1, 6)
        new_row["Road_Connectivity_Score"] = connectivity

        # -------- LEGAL STATUS --------
        status = np.random.choice(statuses, p=[0.7, 0.2, 0.1])
        new_row["Encumbrance_Status"] = status

        if status == "Disputed":
            risk = np.random.randint(65, 95)
        elif status == "Minor":
            risk = np.random.randint(35, 65)
        else:
            risk = np.random.randint(5, 25)

        new_row["Kabja_Risk_Score"] = risk

        # -------- PRICE CALCULATION (STRONGER EFFECTS) --------
        base = zone_base.get(row["Zone_Type"], 3500000)
        region_mult = region_multiplier[region]
        land_mult = land_use_multiplier.get(row["Land_Use"], 1.0)
        legal_mult = legal_multiplier[status]

        # STRONGER infrastructure boost (now up to 25%)
        infra_mult = 1 + (connectivity * 0.07)

        # STRONGER distance decay
        town_decay = 1 - (town_dist * 0.025)
        beach_decay = 1 - (beach_dist * 0.035)
        highway_decay = 1 - (highway_dist * 0.02)

        price = base * region_mult * land_mult * legal_mult * infra_mult
        price = price * town_decay * beach_decay * highway_decay

        noise = np.random.normal(0, 0.025)
        final_price = price * (1 + noise)

        new_row["Market_Price_Per_Acre"] = int(final_price)

        expanded_rows.append(new_row)

# -------- FINAL DATAFRAME --------
df_expanded = pd.DataFrame(expanded_rows)

df_expanded.to_csv("bapatla_hybrid_research_dataset.csv", index=False)

print("Strong hybrid dataset created.")
print("Total rows:", len(df_expanded))