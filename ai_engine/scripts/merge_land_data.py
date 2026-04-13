import pandas as pd
import json
import os
import sys
from ai_engine.logic import risk_engine

# Define file paths
# Assuming the script is run from project root or ai_engine/scripts/
# Adjust paths to look for files in the project root by default
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
FACILITIES_FILE = os.path.join(BASE_DIR, 'bapatla_land_realistic_facilities.csv')
CORRECTED_FILE = os.path.join(BASE_DIR, 'Bapatla_Land_Dataset_Corrected.csv')
OUTPUT_FILE = os.path.join(BASE_DIR, 'ai_engine/scripts/master_land_data.json')

def load_data():
    """Load the two CSV datasets."""
    if not os.path.exists(FACILITIES_FILE):
        print(f"Error: Facilities file not found at {FACILITIES_FILE}")
        return None, None
    
    if not os.path.exists(CORRECTED_FILE):
        print(f"Error: Corrected file not found at {CORRECTED_FILE}")
        return None, None

    print("Loading datasets...")
    df_facilities = pd.read_csv(FACILITIES_FILE)
    df_corrected = pd.read_csv(CORRECTED_FILE)
    return df_facilities, df_corrected

def merge_datasets(df_facilities, df_corrected):
    """Merge datasets using Survey_No as the primary key."""
    print("Merging datasets...")
    
    # Select columns from corrected dataset to override or enrich
    # Adjust these column names based on actual file content if they differ
    # For now, I'm assuming standard names or using what was in the user prompt
    cols_to_use_from_corrected = ['Survey_No', 'StreetName', 'Zone_Type']
    
    # Filter only columns that exist
    existing_cols = [c for c in cols_to_use_from_corrected if c in df_corrected.columns]
    
    # Add suffixes to distinguish columns during merge
    df_corrected_subset = df_corrected[existing_cols]

    # Left join to keep all rich facility data
    master_df = pd.merge(df_facilities, df_corrected_subset, on='Survey_No', how='left', suffixes=('', '_new'))
    
    return master_df

def resolve_conflicts(df):
    """Resolve column conflicts and clean data."""
    print("Resolving conflicts and cleaning data...")
    
    # 1. Update Street Names if corrected version exists
    if 'StreetName_new' in df.columns:
        df['StreetName'] = df['StreetName_new'].fillna(df['StreetName'])
        df.drop(columns=['StreetName_new'], inplace=True)
        
    # 2. Update Zone Type if new version exists
    # Check if 'Zone_Type' exists in original or new
    if 'Zone_Type_new' in df.columns:
         if 'Zone_Type' in df.columns:
            df['Zone_Type'] = df['Zone_Type_new'].fillna(df['Zone_Type'])
         else:
            df['Zone_Type'] = df['Zone_Type_new']
         df.drop(columns=['Zone_Type_new'], inplace=True)

    # 3. Clean up NaNs for JSON export (NaN is invalid in standard JSON)
    df = df.where(pd.notnull(df), None)
    
    return df

def map_to_schema(row):
    """Map a DataFrame row to the MongoDB Land Schema structure."""
    
    # Helper to clean string lists (e.g., "School A, School B")
    def clean_list(val):
        if not val or val is None or val == "":
            return []
        return [x.strip() for x in str(val).split(',')]

    # Helper for geometry
    lat = row.get('Latitude')
    lng = row.get('Longitude')
    coordinates = []
    if lat and lng:
        try:
             coordinates = [float(lng), float(lat)] # GeoJSON is [Lng, Lat]
        except:
             pass

    return {
        "property_id": row.get('Property_ID', f"BPT-{row.get('Survey_No')}"),
        "owner_name": row.get('Owner_Name'),
        "survey_number": str(row.get('Survey_No')),
        "location": {
            "type": "Point",
            "coordinates": coordinates
        },
        "address": {
            "street": row.get('StreetName'),
            "village": row.get('Village', 'Bapatla'),
            "city": "Bapatla",
            "state": "Andhra Pradesh",
            "pincode": str(row.get('Pincode', '522101')).replace('.0', '')
        },
        "land_use": row.get('Land_Use', row.get('Zone_Type', 'Other')),
        "area_acres": row.get('Area_Acres'),
        "market_price": row.get('Market_Price'),
        "market_price_per_acre": row.get('Market_Price_Per_Acre'),
        "dist_main_road_m": row.get('Dist_Main_Road_m'),
        "dist_railway_m": row.get('Dist_Railway_m'),
        "road_connectivity_score": row.get('Road_Connectivity_Score'),
        "public_transport": row.get('Public_Transport'),
        "nearby_schools": clean_list(row.get('Nearby_Schools')),
        "nearby_hospitals": clean_list(row.get('Nearby_Hospital')), # Note: 'Hospital' singular in user prompt example?
        "encumbrance_status": row.get('Encumbrance_Status', 'Clear'),
        "registration_year": int(row.get('Registration_Year')) if row.get('Registration_Year') else None,
        
        # AI Fields
        "kabja_risk_score": row.get('Kabja_Risk_Score'),
        "lhi_score": row.get('LHI_Score'),
        "risk_level": row.get('Risk_Level'),
        
        "is_watch_active": True
    }

def main():
    df_facilities, df_corrected = load_data()
    
    if df_facilities is None:
        print("Skipping merge due to missing files. Please ensure CSV files are in the project root.")
        return

    master_df = merge_datasets(df_facilities, df_corrected)
    master_df = resolve_conflicts(master_df)
    
    # --- NEW: Apply AI Logic ---
    print("Running Kabja Risk Engine & LHI Scoring...")
    master_df = risk_engine.apply_intelligence(master_df)
    # ---------------------------
    
    # Convert to list of dicts mapped to schema
    json_data = [map_to_schema(row) for _, row in master_df.iterrows()]
    
    # Save to JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(json_data, f, indent=2)
        
    print(f"Successfully created master dataset with {len(json_data)} properties.")
    print(f"Output saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
