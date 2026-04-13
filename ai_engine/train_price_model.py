import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb

# ---------------- LOAD DATA ----------------
df = pd.read_csv("bapatla_hybrid_research_dataset.csv")

# ---------------- DROP NON-ML COLUMNS ----------------
columns_to_drop = ["Owner_Name", "Location_URL"]
df = df.drop(columns=[col for col in columns_to_drop if col in df.columns])

# ---------------- CLEAN VERIFIED ----------------
if "Verified" in df.columns:
    df["Verified"] = df["Verified"].str.strip().str.lower()
    df["Verified"] = df["Verified"].map({"yes": 1, "no": 0})

# ---------------- ENCODE ALL REMAINING OBJECT COLUMNS ----------------
encoders = {}
for col in df.select_dtypes(include=["object"]).columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le

# ---------------- FEATURES & TARGET ----------------
X = df.drop(columns=["Market_Price_Per_Acre"])

if "Survey_No" in X.columns:
    X = X.drop(columns=["Survey_No"])

y = df["Market_Price_Per_Acre"]

# ---------------- SPLIT ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ---------------- MODELS ----------------
lr = LinearRegression()
lr.fit(X_train, y_train)
y_pred_lr = lr.predict(X_test)

rf = RandomForestRegressor(n_estimators=300, max_depth=14, random_state=42)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)

xgb_model = xgb.XGBRegressor(
    n_estimators=400,
    max_depth=7,
    learning_rate=0.07,
    subsample=0.9,
    colsample_bytree=0.8,
    random_state=42
)
xgb_model.fit(X_train, y_train)
y_pred_xgb = xgb_model.predict(X_test)

# ---------------- EVALUATION ----------------
def evaluate(name, y_true, y_pred):
    r2 = r2_score(y_true, y_pred)
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))

    print(f"\n{name} Results")
    print("R2:", round(r2, 4))
    print("MAE:", round(mae, 2))
    print("RMSE:", round(rmse, 2))

evaluate("Linear Regression", y_test, y_pred_lr)
evaluate("Random Forest", y_test, y_pred_rf)
evaluate("XGBoost", y_test, y_pred_xgb)

# ---------------- SAVE BEST MODEL ----------------
joblib.dump(xgb_model, "price_model.pkl")
joblib.dump(encoders, "label_encoders.pkl")
importances = xgb_model.feature_importances_
feature_names = X.columns

importance_df = pd.DataFrame({
    "Feature": feature_names,
    "Importance": importances
}).sort_values(by="Importance", ascending=False)

print("\nTop 10 Feature Importances:")
print(importance_df.head(10))
print("\nModel training complete. Saved as price_model.pkl")