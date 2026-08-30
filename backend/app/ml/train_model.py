import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "Crop_recommendation.csv")
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "crop_model.joblib")
META_SAVE_PATH = os.path.join(os.path.dirname(__file__), "model_meta.json")

def train_and_save():
    print(f"Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    target_col = 'label'
    
    X = df[feature_cols]
    y = df[target_col]
    
    print(f"Dataset shape: {df.shape}, Unique crops: {y.nunique()}")
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    clf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("=" * 60)
    print(f"✅ Random Forest Model Validation Accuracy: {accuracy * 100:.2f}%")
    print("=" * 60)
    
    classes = list(clf.classes_)
    
    # Save model
    joblib.dump(clf, MODEL_SAVE_PATH)
    print(f"Model saved to: {MODEL_SAVE_PATH}")
    
    # Save metadata
    meta = {
        "model_type": "RandomForestClassifier",
        "validation_accuracy": float(accuracy),
        "features": feature_cols,
        "classes": classes,
        "num_classes": len(classes),
        "total_samples": len(df)
    }
    with open(META_SAVE_PATH, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Metadata saved to: {META_SAVE_PATH}")
    
    return clf, accuracy

if __name__ == "__main__":
    train_and_save()
