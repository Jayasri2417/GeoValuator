import pandas as pd
import numpy as np

def get_kabja_risk(row):
    """
    Calculate the Kabja (Encroachment) Risk Score (0-100%).
    Logic: Risk is higher if land is disputed, near main roads, or vacant.
    """
    risk_score = 0
    
    # Factor 1: Legal Status (High Impact)
    # Handle NaN or different casing
    status = str(row.get('Encumbrance_Status', '')).strip().lower()
    if status != 'clear':
        risk_score += 40
        
    # Factor 2: Location Vulnerability (Closer to road = higher risk)
    try:
        dist = float(row.get('Dist_Main_Road_m', 1000)) # Default to far if missing
        if dist < 500:
            risk_score += 20
    except (ValueError, TypeError):
        pass # Ignore if invalid data
        
    # Factor 3: Land Use (Agriculture/Vacant is easier to encroach than Urban)
    zone = str(row.get('Zone_Type', '')).title()
    if zone in ['Agriculture', 'Mixed', 'Vacant']:
        risk_score += 15
        
    # Factor 4: Market Value (High value attracts fraud)
    try:
        price = float(row.get('Market_Price_Per_Acre', 0))
        if price > 500000:
            risk_score += 10
    except (ValueError, TypeError):
        pass

    return min(risk_score, 100) # Cap at 100%

def get_lhi_score(row):
    """
    Calculate Land Health Index (LHI) - A 'Credit Score' for land (0-100).
    """
    base_score = 100
    
    # Deduct for Risks
    status = str(row.get('Encumbrance_Status', '')).strip().lower()
    if status != 'clear':
        base_score -= 30
    
    # Deduct for poor connectivity
    try:
        conn_score = float(row.get('Road_Connectivity_Score', 0))
        if conn_score < 2.0:
            base_score -= 10
    except (ValueError, TypeError):
        pass
        
    # Bonus for Infrastructure
    # Check if fields are not empty/NaN
    schools = row.get('Nearby_Schools')
    hospitals = row.get('Nearby_Hospital')
    
    has_schools = pd.notna(schools) and str(schools).strip() != ''
    has_hospitals = pd.notna(hospitals) and str(hospitals).strip() != ''
    
    if has_schools and has_hospitals:
        base_score += 5
        
    return max(0, min(base_score, 100)) # Ensure 0-100 range

def apply_intelligence(df):
    """
    Apply risk and health scoring to the dataframe.
    """
    # Ensure column names match what pandas loaded (Case Sensitive)
    # We will handle slight variations in specific functions if needed
    
    df['Kabja_Risk_Score'] = df.apply(get_kabja_risk, axis=1)
    df['LHI_Score'] = df.apply(get_lhi_score, axis=1)
    
    # Generate Status Labels
    df['Risk_Level'] = pd.cut(df['Kabja_Risk_Score'], 
                              bins=[-1, 20, 50, 100], 
                              labels=['Safe', 'Moderate', 'High Risk'])
    
    # Convert Categorical to String for JSON serialization
    df['Risk_Level'] = df['Risk_Level'].astype(str)
    
    return df
