import os
import json
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_model.joblib")
META_PATH = os.path.join(os.path.dirname(__file__), "model_meta.json")

_model = None
_meta = None

FEATURE_NAMES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

def get_model():
    global _model, _meta
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            from .train_model import train_and_save
            train_and_save()
        _model = joblib.load(MODEL_PATH)
        if os.path.exists(META_PATH):
            with open(META_PATH, "r") as f:
                _meta = json.load(f)
    return _model, _meta

def predict_crops(features: list[float], top_n: int = 22) -> list[dict]:
    """
    Given features [N, P, K, temperature, humidity, ph, rainfall],
    returns all crops sorted by predicted probability (suitability score).
    """
    model, meta = get_model()
    df_features = pd.DataFrame([features], columns=FEATURE_NAMES)
    
    probs = model.predict_proba(df_features)[0]
    classes = model.classes_
    
    results = []
    for crop_name, prob in zip(classes, probs):
        results.append({
            "crop": crop_name,
            "suitability_score": round(float(prob), 4),
            "suitability_percentage": round(float(prob) * 100, 1)
        })
    
    results.sort(key=lambda x: x["suitability_score"], reverse=True)
    return results[:top_n]
