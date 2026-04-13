import pandas as pd
import numpy as np
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score, mean_absolute_error

# 1. Load Data
df = pd.read_csv("bapatla_hybrid_research_dataset.csv")

# 2. Preprocessing (Matches train_price_model.py)
columns_to_drop = ["Owner_Name", "Location_URL", "Survey_No"]
df = df.drop(columns=[col for col in columns_to_drop if col in df.columns])

if "Verified" in df.columns:
    df["Verified"] = df["Verified"].str.strip().str.lower().map({"yes": 1, "no": 0})

encoders = {}
for col in df.select_dtypes(include=["object"]).columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))

# 3. Train/Test Split
X = df.drop(columns=["Market_Price_Per_Acre"])
y = df["Market_Price_Per_Acre"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train XGBoost (Optimized Parameters)
model = xgb.XGBRegressor(
    n_estimators=400,
    max_depth=7,
    learning_rate=0.07,
    subsample=0.9,
    colsample_bytree=0.8,
    random_state=42
)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# 5. Visualizations
plt.figure(figsize=(12, 6))

# Plot 1: Actual vs Predicted
plt.subplot(1, 2, 1)
sns.scatterplot(x=y_test, y=y_pred, alpha=0.6, color='#3498db')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
plt.title(f"Actual vs. Predicted Land Prices\n(R2 Score: {r2_score(y_test, y_pred):.4f})", fontsize=12)
plt.xlabel("Actual Price (Lakhs)")
plt.ylabel("AI Predicted Price (Lakhs)")
plt.grid(True, alpha=0.3)

# Plot 2: Feature Importance
plt.subplot(1, 2, 2)
importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=True)
importances.tail(10).plot(kind='barh', color='#2ecc71')
plt.title("Top 10 Feature Importances", fontsize=12)
plt.xlabel("Relative Importance Score")
plt.tight_layout()

# Save the plot
plt.savefig("model_performance_plots.png", dpi=300)
print("Plots generated and saved as 'model_performance_plots.png'")
plt.show()
