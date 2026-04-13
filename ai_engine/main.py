from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

import cv2
import numpy as np
import urllib.request
import os
import tempfile
import joblib
import pandas as pd
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter


from contextlib import asynccontextmanager

# ---------------- PRECISE MODEL CONFIG ----------------
MODEL_PATH = "price_model.pkl"
ENCODER_PATH = "label_encoders.pkl"
xg_model = None
encoders = None

def load_xgboost_model():
    global xg_model, encoders
    try:
        print("INIT: Starting model load sequence...")
        if os.path.exists(MODEL_PATH):
            xg_model = joblib.load(MODEL_PATH)
            print(f"INFO: Precisely trained XGBoost model loaded from {MODEL_PATH}")
        else:
            print(f"ERROR: Model file NOT FOUND at {MODEL_PATH}")
            
        if os.path.exists(ENCODER_PATH):
            encoders = joblib.load(ENCODER_PATH)
            print(f"INFO: Label encoders loaded from {ENCODER_PATH}")
        else:
            print(f"ERROR: Encoder file NOT FOUND at {ENCODER_PATH}")
            
    except Exception as e:
        print(f"WARNING: Precise model loading failed: {e}. Falling back to heuristic mode.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    load_xgboost_model()
    yield
    # Shutdown

app = FastAPI(title="GeoValuator AI Engine", version="1.0", lifespan=lifespan)

# Setup OpenTelemetry Tracing
try:
    from opentelemetry import trace
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.sdk.resources import SERVICE_NAME, Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

    resource = Resource(attributes={
        SERVICE_NAME: "geovaluator-ai-engine"
    })
    tracer_provider = TracerProvider(resource=resource)
    # Check if a provider is already set to avoid the "Overriding" warning if uvicorn reloads
    try:
        trace.set_tracer_provider(tracer_provider)
    except:
        pass
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
except Exception as e:
    print(f"Tracing setup skipped or failed: {e}")

# Enable CORS for all origins

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ INPUT MODELS ============
class RiskAnalysisInput(BaseModel):
    owner_absence_days: int
    has_boundary_wall: bool
    nearby_disputes_count: int
    location_tier: str  # 'Urban', 'Rural'
    pixel_change_percentage: float = 0
    month: int = 1

class PricePredictionInput(BaseModel):
    # Flexible input to support both legacy and high-fidelity modes
    location: Optional[str] = "Bapatla"
    sq_yards: Optional[int] = 0
    Area_Acres: Optional[float] = None
    Land_Use: Optional[str] = None
    Latitude: Optional[float] = None
    Longitude: Optional[float] = None
    Zone_Type: Optional[str] = None
    Verified: Optional[str] = "No"
    Region_Label: Optional[str] = "Coastal"
    Distance_to_Town_km: Optional[float] = 5.0
    Distance_to_Beach_km: Optional[float] = 2.5
    Distance_to_Highway_km: Optional[float] = 1.0
    Road_Connectivity_Score: Optional[int] = 3
    Encumbrance_Status: Optional[str] = "Clear"
    Kabja_Risk_Score: Optional[int] = 10

class EncroachmentDetectionInput(BaseModel):
    old_image_url: str
    new_image_url: str
    threshold: float = 0.15

# ============ ROOT ENDPOINT ============
@app.get("/")
def root():
    return {
        "message": "GeoValuator AI Engine running",
        "version": "1.0",
        "endpoints": [
            "/analyze-risk",
            "/predict-price",
            "/detect-encroachment",
            "/analyze-land-health",
            "/docs"
        ]
    }

# ============ FEATURE 1: KABJA RISK ANALYSIS ============
@app.post("/analyze-risk")
def analyze_risk(data: RiskAnalysisInput):
    """
    Predictive Land Kabja Risk Engine
    Analyzes risk factors and returns comprehensive risk assessment
    """
    risk_score = 0
    factors = []

# ... (lines 1-89)
    # Factor 1: Owner Absence
    if data.owner_absence_days > 180:
        risk_score += 40
        factors.append("CRITICAL: Owner absence >6 months (likely encroachment)")
    elif data.owner_absence_days > 90:
        risk_score += 20
        factors.append("WARNING: Owner absent 3-6 months")

    # Factor 2: Physical Boundary
    if not data.has_boundary_wall:
        risk_score += 30
        factors.append("HIGH: No boundary wall/fencing detected")
    else:
        factors.append("SAFE: Physical boundary exists")

    # Factor 3: Nearby Disputes
    if data.nearby_disputes_count > 0:
        risk_score += (data.nearby_disputes_count * 15)
        factors.append(f"WARNING: {data.nearby_disputes_count} legal dispute(s) detected nearby")

    # Factor 4: Satellite Imagery Changes
    is_harvest_season = data.month in [3, 4, 9, 10]
    if data.pixel_change_percentage > 10:
        if data.location_tier == 'Rural' and is_harvest_season:
            factors.append("INFO: Seasonal farming activity detected (expected)")
        else:
            risk_score += 40
            factors.append("CRITICAL: Unauthorized construction detected via satellite")

    # Determine Status
    status = "Safe"
    status_indicator = "[SAFE]"
    if risk_score > 60:
        status = "High Risk"
        status_indicator = "[DANGER]"
    elif risk_score > 30:
        status = "Moderate Warning"
        status_indicator = "[WARNING]"

    ai_suggestion = (
        "Immediate Action Required: Visit land, document current state, increase monitoring frequency."
        if risk_score > 60
        else "Routine inspection recommended within 30 days."
    )

    return {
        "risk_score": min(risk_score, 100),
        "status": f"{status_indicator} {status}",
# ...
        "risk_percentage": f"{min(risk_score, 100)}%",
        "risk_factors": factors,
        "ai_suggestion": ai_suggestion,
        "analysis_timestamp": datetime.now().isoformat(),
        "confidence": "High" if data.pixel_change_percentage > 0 else "Medium"
    }

# ============ FEATURE 2: AI PRICE PREDICTION ============
@app.post("/predict-price")
def predict_price(data: PricePredictionInput):
    """
    AI Agent Price Prediction Engine
    Upgraded to use XGBoost for Bapatla region with heuristic fallback for other areas.
    """
    # 1. Check if we should use the Precise XGBoost Model
    if xg_model is not None and encoders is not None:
        try:
            # Prepare input dictionary for XGBoost
            # Flatten/Normalize from input
            input_dict = {
                "Area_Acres": data.Area_Acres if data.Area_Acres is not None else (data.sq_yards / 4840.0 if data.sq_yards > 0 else 1.0),
                "Land_Use": data.Land_Use or "Agricultural",
                "Latitude": data.Latitude or 15.912,
                "Longitude": data.Longitude or 80.467,
                "Zone_Type": data.Zone_Type or "Zone-B",
                "Verified": 1 if str(data.Verified).lower() == "yes" else 0,
                "Region_Label": data.Region_Label or "Coastal",
                "Distance_to_Town_km": data.Distance_to_Town_km or 5.0,
                "Distance_to_Beach_km": data.Distance_to_Beach_km or 2.5,
                "Distance_to_Highway_km": data.Distance_to_Highway_km or 1.0,
                "Road_Connectivity_Score": data.Road_Connectivity_Score or 3,
                "Encumbrance_Status": data.Encumbrance_Status or "Clear",
                "Kabja_Risk_Score": data.Kabja_Risk_Score or 10
            }

            # Encode Categoricals
            for col, encoder in encoders.items():
                if col in input_dict:
                    val = str(input_dict[col])
                    try:
                        input_dict[col] = encoder.transform([val])[0]
                    except:
                        input_dict[col] = 0 # Default unseen
            
            # Ensure correct column order for XGBoost
            expected_features = [
                "Area_Acres", "Land_Use", "Latitude", "Longitude", 
                "Zone_Type", "Verified", "Region_Label", 
                "Distance_to_Town_km", "Distance_to_Beach_km", 
                "Distance_to_Highway_km", "Road_Connectivity_Score", 
                "Encumbrance_Status", "Kabja_Risk_Score"
            ]
            
            df_input = pd.DataFrame([input_dict])[expected_features]
            prediction = xg_model.predict(df_input)[0]
            # Convert raw prediction in INR into Lakhs
            predicted_price_lakhs = float(max(0, prediction)) / 100000.0

            # Feature Impact
            importances = xg_model.feature_importances_
            feature_insights = sorted(
                zip(expected_features, [float(i) for i in importances]),
                key=lambda x: x[1], reverse=True
            )[:3]

            return {
                "success": True,
                "engine": "XGBoost-V1",
                "predicted_price_lakhs": round(predicted_price_lakhs, 2),
                "currency": "INR (Lakhs)",
                "top_drivers": [{"feature": f, "impact": round(i, 4)} for f, i in feature_insights],
                "analysis_timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"XGBoost Prediction Error: {e}")
            # Fall through to heuristic

    # 2. Heuristic Fallback (Original Logic)
    base_rates = {
        "kukatpally": 45000, "jubilee hills": 120000, "hitech city": 95000,
        "banjara hills": 110000, "gachibowli": 85000, "kondapur": 75000,
        "ameerpet": 65000, "rural": 12000, "bapatla": 25000
    }

    loc_key = next((k for k in base_rates if k in (data.location or "rural").lower()), "rural")
    rate = base_rates[loc_key]
    sq_yards = data.sq_yards or (data.Area_Acres * 4840 if data.Area_Acres else 1000)
    current_value = rate * sq_yards

    growth_factor = 1.10
    predicted_1year = int(current_value * growth_factor)

    return {
        "success": True,
        "engine": "Heuristic-Fallback",
        "current_total_value": f"₹{current_value:,.0f}",
        "predicted_price_lakhs": round(current_value / 100000, 2),
        "prediction_1_year": f"₹{predicted_1year:,.0f}",
        "market_sentiment": "Stable",
        "analysis_timestamp": datetime.now().isoformat()
    }

# ============ FEATURE 3: ENCROACHMENT DETECTION (Satellite) ============
@app.post("/detect-encroachment")
def detect_encroachment(data: EncroachmentDetectionInput):
    """
    Satellite Image Analysis for Encroachment Detection
    Compares old vs new satellite images to detect unauthorized construction
    """
    try:
        # Download images from URLs
        temp_dir = tempfile.gettempdir()
        old_img_path = os.path.join(temp_dir, "old_image.jpg")
        new_img_path = os.path.join(temp_dir, "new_image.jpg")

        urllib.request.urlretrieve(data.old_image_url, old_img_path)
        urllib.request.urlretrieve(data.new_image_url, new_img_path)

        # Read images
        old_img = cv2.imread(old_img_path)
        new_img = cv2.imread(new_img_path)

        if old_img is None or new_img is None:
            return {
                "encroachment_detected": False,
                "error": "Could not load satellite images",
                "change_percentage": 0
            }

        # Resize to same dimensions
        height, width = old_img.shape[:2]
        new_img = cv2.resize(new_img, (width, height))

        # Convert to grayscale
        old_gray = cv2.cvtColor(old_img, cv2.COLOR_BGR2GRAY)
        new_gray = cv2.cvtColor(new_img, cv2.COLOR_BGR2GRAY)

        # Compute difference
        diff = cv2.absdiff(old_gray, new_gray)

        # Apply threshold
        _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)

        # Calculate percentage of changed pixels
        total_pixels = thresh.size
        changed_pixels = cv2.countNonZero(thresh)
        change_percentage = (changed_pixels / total_pixels) * 100

        # Cleanup
        os.remove(old_img_path)
        os.remove(new_img_path)

        encroachment_detected = change_percentage > data.threshold

        return {
            "encroachment_detected": encroachment_detected,
            "change_percentage": round(change_percentage, 2),
            "threshold_used": data.threshold,
            "status": "ENCROACHMENT LIKELY" if encroachment_detected else "NO MAJOR CHANGES",
            "ai_recommendation": "Immediate investigation required" if encroachment_detected else "Status remains stable",
            "analysis_timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        return {
            "encroachment_detected": None,
            "error": f"Analysis failed: {str(e)}",
            "change_percentage": 0
        }

# ============ LEGACY ENDPOINT (BACKWARD COMPATIBLE) ============
@app.get("/analyze-land-health")
def analyze_land(
    region_type: str = "Urban",
    owner_absence_days: int = 0,
    nearby_disputes: int = 0,
    pixel_change_percentage: float = 0,
    month: int = 1
):
    """Legacy endpoint for backward compatibility"""
    data = RiskAnalysisInput(
        owner_absence_days=owner_absence_days,
        has_boundary_wall=True,
        nearby_disputes_count=nearby_disputes,
        location_tier=region_type,
        pixel_change_percentage=pixel_change_percentage,
        month=month
    )
    risk_response = analyze_risk(data)
    
    return {
        "lhi_score": max(0, 100 - risk_response["risk_score"]),
        "risk_status": risk_response["status"],
        "kabja_probability": min(risk_response["risk_score"], 99),
        "alerts": risk_response["risk_factors"],
        "analysis_timestamp": risk_response["analysis_timestamp"]
    }

@app.get("/predict-value")
def predict_value(base_price: float, area_code: str = "URBAN"):
    """Legacy endpoint for backward compatibility"""
    growth_factor = 1.08 if area_code == "URBAN" else 1.04
    predicted = base_price * growth_factor
    return {
        "current_value": base_price,
        "predicted_next_year": predicted,
        "growth_rate": f"{int((growth_factor - 1) * 100)}%"
    }

if __name__ == "__main__":
    import uvicorn
    # Use 5001 for the unified AI engine as per our new architecture
    uvicorn.run("main:app", host="127.0.0.1", port=5001, reload=True)
