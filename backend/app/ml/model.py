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


PROFILES_PATH = os.path.join(os.path.dirname(__file__), "crop_profiles.json")
_profiles = None

def get_profiles():
    global _profiles
    if _profiles is None:
        if os.path.exists(PROFILES_PATH):
            with open(PROFILES_PATH, "r") as f:
                _profiles = json.load(f)
        else:
            _profiles = {}
    return _profiles

def predict_crops_with_evidence(features: list[float], top_n: int = 22) -> list[dict]:
    results = predict_crops(features, top_n=22)
    profiles = get_profiles()
    
    feature_display_names = {
        "N": "Nitrogen",
        "P": "Phosphorus",
        "K": "Potassium",
        "temperature": "Temperature",
        "humidity": "Humidity",
        "ph": "pH",
        "rainfall": "Rainfall"
    }
    
    for result in results:
        crop = result["crop"]
        evidence = {}
        if crop in profiles:
            crop_profile = profiles[crop]
            feature_matches = []
            
            for i, feature_name in enumerate(FEATURE_NAMES):
                user_val = features[i]
                prof = crop_profile.get(feature_name, {})
                
                mean = prof.get("mean", 0)
                std = prof.get("std", 0)
                min_val = prof.get("min", 0)
                max_val = prof.get("max", 0)
                q1 = prof.get("q1", 0)
                q3 = prof.get("q3", 0)
                
                if q1 <= user_val <= q3:
                    match_quality = "excellent"
                    match_percentage = 100.0
                elif min_val <= user_val <= max_val:
                    match_quality = "good"
                    dist = abs(user_val - mean)
                    max_dist = max(abs(max_val - mean), abs(mean - min_val))
                    if max_dist == 0:
                        match_percentage = 100.0
                    else:
                        match_percentage = max(60.0, 100.0 - (dist / max_dist) * 40.0)
                elif (mean - 2*std) <= user_val <= (mean + 2*std):
                    match_quality = "moderate"
                    dist = abs(user_val - mean)
                    range_size = 2 * std
                    if range_size == 0:
                        match_percentage = 60.0
                    else:
                        match_percentage = max(30.0, 60.0 - (dist / range_size) * 30.0)
                else:
                    match_quality = "poor"
                    dist = abs(user_val - mean)
                    if mean == 0:
                        match_percentage = 0.0
                    else:
                        match_percentage = max(0.0, 30.0 * (1 - (dist / mean)))
                        match_percentage = min(30.0, match_percentage) # ensure doesn't exceed 30
                
                match_percentage = round(match_percentage, 1)
                
                feature_matches.append({
                    "feature": feature_name,
                    "label": feature_display_names.get(feature_name, feature_name),
                    "user_value": user_val,
                    "optimal_min": min_val,
                    "optimal_max": max_val,
                    "optimal_mean": mean,
                    "match_quality": match_quality,
                    "match_percentage": match_percentage,
                    "in_range": match_quality in ["excellent", "good"]
                })
                
            overall = sum(f["match_percentage"] for f in feature_matches) / len(feature_matches)
            strong_matches = [f["feature"] for f in feature_matches if f["match_quality"] in ["excellent", "good"]]
            weak_matches = [f["feature"] for f in feature_matches if f["match_quality"] == "poor"]
            
            evidence = {
                "feature_matches": feature_matches,
                "overall_match_percentage": round(overall, 1),
                "strong_matches": strong_matches,
                "weak_matches": weak_matches,
                "dataset_sample_count": 100
            }
        
        result["evidence"] = evidence
        
    return results[:top_n]
