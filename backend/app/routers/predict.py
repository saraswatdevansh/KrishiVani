import asyncio
from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas import PredictRequest, PredictResponse, CropRecommendation
from ..services.weather import get_current_weather
from ..services.market import get_mandi_prices, fetch_state_records_from_agmarknet
from ..ml.model import predict_crops

router = APIRouter(prefix="/api", tags=["Crop Prediction"])

# Prettified English names for display
CROP_PRETTY_NAMES = {
    "rice": "Paddy / Rice (धान)",
    "maize": "Maize / Corn (मक्का)",
    "chickpea": "Chickpea / Bengal Gram (चना)",
    "kidneybeans": "Kidney Beans / Rajma (राजमा)",
    "pigeonpeas": "Pigeon Peas / Arhar (अरहर/तूर)",
    "mothbeans": "Moth Beans (मोठ)",
    "mungbean": "Green Gram / Moong (मूंग)",
    "blackgram": "Black Gram / Urad (उड़द)",
    "lentil": "Lentil / Masoor (मसूर)",
    "pomegranate": "Pomegranate (अनार)",
    "banana": "Banana (केला)",
    "mango": "Mango (आम)",
    "grapes": "Grapes (अंगूर)",
    "watermelon": "Watermelon (तरबूज)",
    "muskmelon": "Muskmelon (खरबूजा)",
    "apple": "Apple (सेब)",
    "orange": "Orange (संतरा)",
    "papaya": "Papaya (पपीता)",
    "coconut": "Coconut (नारियल)",
    "cotton": "Cotton (कपास)",
    "jute": "Jute / Pat (पटसन)",
    "coffee": "Coffee (कॉफ़ी)"
}

# Agro-climatic geographical constraints
GEO_RESTRICTED_CROPS = {
    "coffee": ["karnataka", "kerala", "tamil nadu", "andhra pradesh"],
    "apple": ["jammu and kashmir", "himachal pradesh", "uttarakhand"],
    "coconut": ["kerala", "tamil nadu", "andhra pradesh", "karnataka", "odisha", "west bengal", "goa", "maharashtra"],
    "jute": ["west bengal", "assam", "bihar", "odisha"]
}

def is_crop_geographically_viable(crop: str, state: str) -> bool:
    crop_lower = crop.lower().strip()
    state_lower = state.lower().strip()
    if crop_lower in GEO_RESTRICTED_CROPS:
        allowed_states = GEO_RESTRICTED_CROPS[crop_lower]
        return any(st in state_lower or state_lower in st for st in allowed_states)
    return True

@router.post("/predict", response_model=PredictResponse)
async def predict_crop_suitability(req: PredictRequest):
    target_state = (req.state or "Punjab").strip().title()
    
    # 1. Fetch live weather and state mandi records concurrently
    weather_task = get_current_weather(req.latitude, req.longitude)
    state_batch_task = fetch_state_records_from_agmarknet(target_state)
    
    weather, _ = await asyncio.gather(weather_task, state_batch_task)
    
    temp = weather.get("temperature", 28.0)
    humidity = weather.get("humidity", 60.0)
    weather_avail = weather.get("is_live", False)
    
    # 2. Build 7-feature vector [N, P, K, temp, humidity, ph, rainfall]
    features = [
        float(req.nitrogen),
        float(req.phosphorus),
        float(req.potassium),
        float(temp),
        float(humidity),
        float(req.ph),
        float(req.rainfall)
    ]
    
    # 3. Predict suitability for all 22 crops
    all_crop_predictions = predict_crops(features, top_n=22)
    
    # 4. Filter by regional agro-climatic viability and minimum suitability threshold
    viable_candidates = []
    for item in all_crop_predictions:
        crop_name = item["crop"]
        if not is_crop_geographically_viable(crop_name, target_state):
            continue
        viable_candidates.append(item)
        if len(viable_candidates) >= 8:
            break
            
    if not viable_candidates:
        viable_candidates = all_crop_predictions[:5]
        
    # 5. Fetch mandi market prices in parallel for viable crops
    market_avail = False
    price_tasks = [
        get_mandi_prices(item["crop"], state=target_state, district=req.district)
        for item in viable_candidates
    ]
    market_results = await asyncio.gather(*price_tasks)
    
    candidates_with_prices = []
    for item, market_data in zip(viable_candidates, market_results):
        crop_name = item["crop"]
        if market_data.get("is_live", False):
            market_avail = True
            
        modal_price = market_data.get("modal_price", 2500.0)
        candidates_with_prices.append({
            "crop": crop_name,
            "suitability_score": item["suitability_score"],
            "suitability_percentage": item["suitability_percentage"],
            "modal_price": modal_price,
            "min_price": market_data.get("min_price", modal_price * 0.9),
            "max_price": market_data.get("max_price", modal_price * 1.1),
            "market": market_data.get("market", f"{target_state} Mandi"),
            "price_trend": market_data.get("trend", "stable"),
            "demand_level": market_data.get("demand", "Medium")
        })
        
    # 6. Gated Profit-Aware Re-ranking Formula
    # Final = Suitability * (0.75 + 0.25 * NormalizedPrice)
    max_price = max([c["modal_price"] for c in candidates_with_prices]) if candidates_with_prices else 10000.0
    if max_price <= 0:
        max_price = 10000.0
        
    for c in candidates_with_prices:
        norm_price = c["modal_price"] / max_price
        # Gated multiplicative boost ensures unviable crops never jump ahead of suitable crops
        final_score = c["suitability_score"] * (0.75 + (0.25 * norm_price))
        c["final_score"] = round(final_score, 4)
        
    # Sort by final_score descending
    candidates_with_prices.sort(key=lambda x: x["final_score"], reverse=True)
    top_3 = candidates_with_prices[:3]
    
    # Format recommendations
    recommendations: List[CropRecommendation] = []
    for idx, c in enumerate(top_3):
        recommendations.append(CropRecommendation(
            crop=c["crop"],
            crop_display_name=CROP_PRETTY_NAMES.get(c["crop"], c["crop"].capitalize()),
            suitability_score=c["suitability_score"],
            suitability_percentage=c["suitability_percentage"],
            mandi_price=c["modal_price"],
            price_trend=c["price_trend"],
            market=c["market"],
            demand_level=c["demand_level"],
            final_score=c["final_score"],
            is_top_pick=(idx == 0)
        ))
        
    return PredictResponse(
        weather=weather,
        recommendations=recommendations,
        market_data_available=market_avail,
        weather_available=weather_avail
    )
