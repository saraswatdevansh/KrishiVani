from typing import List, Dict, Any

ADVISORY_DESCRIPTIONS = {
    "delay_fertilizer": "Rain expected: Delay fertilizer & urea top-dressing to prevent nutrient leaching.",
    "check_drainage": "Heavy rain forecast: Ensure drainage channels in fields are clear to prevent waterlogging.",
    "irrigation_recommended": "Dry weather ahead: Recommended to schedule light early morning or evening irrigation.",
    "delay_spraying": "High wind speeds: Postpone foliar pesticide and insecticide spraying to avoid drift.",
    "fungal_alert": "High humidity & warm weather: Elevated risk of fungal infections (Blast, Leaf Spot, Rust). Inspect lower foliage.",
    "heat_stress": "High temperature alert: Apply organic mulch around crop roots to conserve soil moisture.",
    "frost_protection": "Low nighttime temperature: Provide light irrigation or smoke covers to prevent frost damage.",
    "ideal_fieldwork": "Clear and stable weather: Optimal conditions for weeding, harvesting, and field operations.",
    "pesticide_favorable": "Calm weather with moderate humidity: Safe window for pest management spray if required."
}

def generate_daily_advisory(crop: str, forecast_day: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates intelligent rule-based farming advisories for a given day's forecast.
    """
    temp_high = forecast_day.get("temp_high", 30.0)
    temp_low = forecast_day.get("temp_low", 22.0)
    humidity = forecast_day.get("humidity", 60.0)
    rain_prob = forecast_day.get("rain_prob", 0.0)
    wind_speed = forecast_day.get("wind_speed", 10.0)
    
    advisory_keys = []
    advisory_notes = []
    
    is_spray_safe = True
    is_irrigation_needed = False
    
    # 1. Rain & Moisture Rules
    if rain_prob >= 0.50:
        advisory_keys.append("delay_fertilizer")
        advisory_notes.append(ADVISORY_DESCRIPTIONS["delay_fertilizer"])
        is_spray_safe = False
        is_irrigation_needed = False
        if rain_prob >= 0.70:
            advisory_keys.append("check_drainage")
            advisory_notes.append(ADVISORY_DESCRIPTIONS["check_drainage"])
    elif rain_prob < 0.20 and temp_high >= 32.0:
        advisory_keys.append("irrigation_recommended")
        advisory_notes.append(ADVISORY_DESCRIPTIONS["irrigation_recommended"])
        is_irrigation_needed = True

    # 2. Wind Rules
    if wind_speed >= 22.0:
        advisory_keys.append("delay_spraying")
        advisory_notes.append(ADVISORY_DESCRIPTIONS["delay_spraying"])
        is_spray_safe = False

    # 3. Disease & Fungal Rules
    if humidity >= 78.0 and 20.0 <= temp_high <= 34.0:
        advisory_keys.append("fungal_alert")
        advisory_notes.append(ADVISORY_DESCRIPTIONS["fungal_alert"])

    # 4. Temperature Extremes
    if temp_high >= 38.0:
        advisory_keys.append("heat_stress")
        advisory_notes.append(ADVISORY_DESCRIPTIONS["heat_stress"])
        is_irrigation_needed = True
    elif temp_low <= 10.0:
        advisory_keys.append("frost_protection")
        advisory_notes.append(ADVISORY_DESCRIPTIONS["frost_protection"])

    # 5. Favorable Conditions
    if not advisory_keys:
        advisory_keys.append("ideal_fieldwork")
        advisory_notes.append(ADVISORY_DESCRIPTIONS["ideal_fieldwork"])
        
    if is_spray_safe and not ("delay_spraying" in advisory_keys or "delay_fertilizer" in advisory_keys):
        if humidity < 70 and wind_speed < 18:
            advisory_keys.append("pesticide_favorable")
            advisory_notes.append(ADVISORY_DESCRIPTIONS["pesticide_favorable"])

    # Crop specific additions
    crop_lower = crop.lower() if crop else "rice"
    if "rice" in crop_lower and rain_prob >= 0.4:
        advisory_notes.append("Paddy water management: Maintain 2-3 cm standing water; open spillways if rain exceeds 50mm.")
    elif "cotton" in crop_lower and rain_prob >= 0.5:
        advisory_notes.append("Cotton alert: Prevent stagnant water around roots to avoid root rot and boll shedding.")
    elif "wheat" in crop_lower and humidity > 80:
        advisory_notes.append("Wheat advisory: Inspect field borders for initial signs of Yellow Rust.")

    return {
        "advisory_keys": advisory_keys,
        "advisory_notes": advisory_notes,
        "is_spray_safe": is_spray_safe,
        "is_irrigation_needed": is_irrigation_needed
    }

def generate_urgent_alerts(crop: str, current_weather: Dict[str, Any], forecast_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates high-priority urgent alert badges for the dashboard.
    """
    alerts = []
    
    # Check next 48h rain
    high_rain_days = [f for f in forecast_list[:2] if f.get("rain_prob", 0) >= 0.6]
    if high_rain_days:
        alerts.append({
            "id": "rain-alert-48h",
            "type": "weather",
            "severity": "urgent", # red
            "title": "Weather Alert: Heavy Rain Expected",
            "description": "High precipitation predicted in the next 48 hours. Avoid irrigation and ensure field drainage channels are clear.",
            "icon": "cloud_alert",
            "timestamp": "Now"
        })
        
    # Check humidity for yellow rust / fungal alert
    high_humidity = any(f.get("humidity", 0) >= 80 for f in forecast_list[:3])
    if high_humidity or crop.lower() == "wheat":
        alerts.append({
            "id": "farm-advisory-rust",
            "type": "crop",
            "severity": "warning", # orange
            "title": "Urgent Farm Advisory: Pest/Rust Watch",
            "description": f"Environmental conditions favorable for fungal spore growth on {crop.title()}. Inspect field edges and lower leaf canopy immediately.",
            "icon": "warning",
            "timestamp": "1h ago"
        })
        
    # Market alert
    alerts.append({
        "id": "market-trend-wheat",
        "type": "market",
        "severity": "info", # green
        "title": "Market Price Alert: Mandi Update",
        "description": "High modal prices and strong demand recorded in nearby regional mandis for this week's arrivals.",
        "icon": "payments",
        "timestamp": "Today"
    })
    
    return alerts
