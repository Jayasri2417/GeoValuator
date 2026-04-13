import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict

# ---------------- CONFIGURATION ----------------
MODEL_PATH = "price_model.pkl"
ENCODER_PATH = "label_encoders.pkl"

app = FastAPI(title="GeoValuator Prediction Service")

# ---------------- GLOBAL MODELS ----------------
model = None
encoders = None

@app.on_event("startup")
def load_models():
    global model, encoders
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print(f"✅ Loaded model from {MODEL_PATH}")
        else:
            print(f"❌ Model file not found at {MODEL_PATH}")

        if os.path.exists(ENCODER_PATH):
            encoders = joblib.load(ENCODER_PATH)
            print(f"✅ Loaded encoders from {ENCODER_PATH}")
        else:
            print(f"❌ Encoders file not found at {ENCODER_PATH}")
    except Exception as e:
        print(f"🔥 Error loading models: {str(e)}")

# ---------------- SCHEMAS ----------------
class LandInput(BaseModel):
    Area_Acres: float = Field(..., example=5.2)
    Land_Use: str = Field(..., example="Agricultural")
    Latitude: float = Field(..., example=15.912)
    Longitude: float = Field(..., example=80.467)
    Zone_Type: str = Field(..., example="Zone-A")
    Verified: str = Field(..., example="Yes")
    Region_Label: str = Field(..., example="Coastal")
    Distance_to_Town_km: float = Field(..., example=5.0)
    Distance_to_Beach_km: float = Field(..., example=2.5)
    Distance_to_Highway_km: float = Field(..., example=1.0)
    Road_Connectivity_Score: int = Field(..., example=4)
    Encumbrance_Status: str = Field(..., example="Clear")
    Kabja_Risk_Score: int = Field(..., example=2)

# ---------------- PREDICTION LOGIC ----------------
@app.post("/predict-price")
async def predict_price(data: LandInput):
    if model is None or encoders is None:
        raise HTTPException(status_code=500, detail="Models not loaded on server.")

    try:
        # Convert Pydantic model to dict
        input_dict = data.dict()
        
        # 1. Preprocess 'Verified' (Yes/No -> 1/0)
        verified_val = str(input_dict["Verified"]).strip().lower()
        input_dict["Verified"] = 1 if verified_val == "yes" else 0
        
        # 2. Categorical Encoding
        for col, encoder in encoders.items():
            if col in input_dict:
                val = str(input_dict[col])
                try:
                    # Use the encoder
                    input_dict[col] = encoder.transform([val])[0]
                except ValueError:
                    # Handle unseen categories: Use first class or a default if possible
                    # In production, we might want to log this.
                    print(f"⚠️ Unseen value '{val}' for column '{col}'. Defaulting to first class.")
                    input_dict[col] = 0 

        # 3. Create DataFrame with correct column order
        # The order must match exactly what X_train had.
        # From training script:
        expected_features = [
            "Area_Acres", "Land_Use", "Latitude", "Longitude", 
            "Zone_Type", "Verified", "Region_Label", 
            "Distance_to_Town_km", "Distance_to_Beach_km", 
            "Distance_to_Highway_km", "Road_Connectivity_Score", 
            "Encumbrance_Status", "Kabja_Risk_Score"
        ]
        
        df_input = pd.DataFrame([input_dict])
        df_input = df_input[expected_features] # Reorder

        # 4. Predict
        prediction = model.predict(df_input)[0]
        
        # XGBoost can sometimes return negative values if not constrained
        predicted_price = float(max(0, prediction))

        # 5. Feature Importance Insight (Basic)
        importances = model.feature_importances_
        feature_insights = sorted(
            zip(expected_features, [float(i) for i in importances]),
            key=lambda x: x[1], reverse=True
        )[:5]

        return {
            "success": True,
            "predicted_price_lakhs": round(predicted_price, 2),
            "currency": "INR (Lakhs)",
            "unit": "Per Acre",
            "top_drivers": [{"feature": f, "impact": round(i, 4)} for f, i in feature_insights]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
