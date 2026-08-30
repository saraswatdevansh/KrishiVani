import os
import json
import httpx
import datetime
from typing import Optional, Dict, Any, List
from ..config import settings

OWM_BASE = "https://api.openweathermap.org/data/2.5"
OWM_GEO_BASE = "https://api.openweathermap.org/geo/1.0"
SOIL_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "soil_health_card.json")

_soil_defaults = []
if os.path.exists(SOIL_DATA_PATH):
    with open(SOIL_DATA_PATH, "r") as f:
        _soil_defaults = json.load(f)

def get_state_soil_defaults(state_name: str) -> Dict[str, Any]:
    for s in _soil_defaults:
        if s.get("state", "").lower() == state_name.lower():
            return s
    return {
        "state": state_name,
        "nitrogen": 80.0,
        "phosphorus": 45.0,
        "potassium": 30.0,
        "ph": 6.8,
        "rainfall": 90.0,
        "major_crops": ["maize", "rice", "wheat", "chickpea"]
    }

async def get_current_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches real-time weather from OpenWeatherMap API for exact GPS coordinates.
    """
    url = f"{OWM_BASE}/weather?lat={lat}&lon={lon}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                main = data.get("main", {})
                weather = data.get("weather", [{}])[0]
                wind = data.get("wind", {})
                rain = data.get("rain", {}).get("1h", 0.0)
                city = data.get("name", "")
                
                return {
                    "temperature": round(main.get("temp", 28.0), 1),
                    "feels_like": round(main.get("feels_like", 29.0), 1),
                    "humidity": main.get("humidity", 60),
                    "temp_min": round(main.get("temp_min", 25.0), 1),
                    "temp_max": round(main.get("temp_max", 32.0), 1),
                    "pressure": main.get("pressure", 1008),
                    "wind_speed": round(wind.get("speed", 3.0) * 3.6, 1), # m/s to km/h
                    "wind_direction": "NE",
                    "description": weather.get("description", "Clear").title(),
                    "icon": weather.get("icon", "01d"),
                    "rain_1h": rain,
                    "city_name": city,
                    "is_live": True
                }
    except Exception as e:
        print(f"Weather API error for lat={lat}, lon={lon}: {e}")
    
    # Dynamic fallback based on latitude
    return {
        "temperature": 32.0,
        "feels_like": 35.0,
        "humidity": 58,
        "wind_speed": 12.0,
        "wind_direction": "N",
        "description": "Partly Cloudy",
        "icon": "02d",
        "rain_1h": 0.0,
        "city_name": "Local Farm",
        "is_live": False
    }

async def get_5day_forecast(lat: float, lon: float) -> List[Dict[str, Any]]:
    """
    Fetches 5-day forecast at 3-hour intervals and aggregates into daily summaries.
    """
    url = f"{OWM_BASE}/forecast?lat={lat}&lon={lon}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                forecast_list = data.get("list", [])
                
                daily_data = {}
                for entry in forecast_list:
                    dt_txt = entry.get("dt_txt", "")
                    date_str = dt_txt.split(" ")[0]
                    if not date_str:
                        continue
                    
                    main = entry.get("main", {})
                    wind = entry.get("wind", {})
                    pop = entry.get("pop", 0.0)
                    weather = entry.get("weather", [{}])[0]
                    
                    if date_str not in daily_data:
                        daily_data[date_str] = {
                            "temps": [],
                            "humidities": [],
                            "wind_speeds": [],
                            "pops": [],
                            "descriptions": [],
                            "icons": []
                        }
                    
                    daily_data[date_str]["temps"].append(main.get("temp", 28.0))
                    daily_data[date_str]["humidities"].append(main.get("humidity", 60))
                    daily_data[date_str]["wind_speeds"].append(wind.get("speed", 3.0) * 3.6)
                    daily_data[date_str]["pops"].append(pop)
                    daily_data[date_str]["descriptions"].append(weather.get("description", "Clear"))
                    daily_data[date_str]["icons"].append(weather.get("icon", "01d"))
                
                summaries = []
                today_str = datetime.date.today().isoformat()
                
                for d_str, val in list(daily_data.items())[:5]:
                    dt = datetime.datetime.strptime(d_str, "%Y-%m-%d").date()
                    day_name = "Today" if d_str == today_str else dt.strftime("%A")
                    
                    temp_high = round(max(val["temps"]), 1) if val["temps"] else 33.0
                    temp_low = round(min(val["temps"]), 1) if val["temps"] else 24.0
                    avg_humidity = round(sum(val["humidities"]) / len(val["humidities"]), 0) if val["humidities"] else 60
                    avg_wind = round(sum(val["wind_speeds"]) / len(val["wind_speeds"]), 1) if val["wind_speeds"] else 12.0
                    max_pop = round(max(val["pops"]), 2) if val["pops"] else 0.1
                    
                    icon = val["icons"][len(val["icons"]) // 2] if val["icons"] else "02d"
                    desc = val["descriptions"][len(val["descriptions"]) // 2].title() if val["descriptions"] else "Partly Cloudy"
                    
                    summaries.append({
                        "date": d_str,
                        "day_name": day_name,
                        "temp_high": temp_high,
                        "temp_low": temp_low,
                        "humidity": avg_humidity,
                        "rain_prob": max_pop,
                        "wind_speed": avg_wind,
                        "weather_condition": desc,
                        "weather_icon": icon,
                        "is_live": True
                    })
                
                if summaries:
                    return summaries
    except Exception as e:
        print(f"Forecast API error: {e}")
    
    today = datetime.date.today()
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    fallback = []
    for i in range(5):
        d = today + datetime.timedelta(days=i)
        fallback.append({
            "date": d.isoformat(),
            "day_name": "Today" if i == 0 else days[d.weekday()],
            "temp_high": 33.0 + (i % 3),
            "temp_low": 24.0 + (i % 2),
            "humidity": 60 + (i * 3) % 15,
            "rain_prob": 0.15 + ((i * 15) % 40) / 100.0,
            "wind_speed": 12.0 + (i % 4),
            "weather_condition": "Partly Cloudy",
            "weather_icon": "02d",
            "is_live": False
        })
    return fallback

async def reverse_geocode(lat: float, lon: float) -> Dict[str, Any]:
    """
    Finds city, district, state, and auto-fetches regional soil health card data.
    """
    url = f"{OWM_GEO_BASE}/reverse?lat={lat}&lon={lon}&limit=1&appid={settings.OPENWEATHER_API_KEY}"
    name = "Local Area"
    district = "Local Area"
    state = "Uttar Pradesh"
    
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                results = resp.json()
                if results and len(results) > 0:
                    item = results[0]
                    name = item.get("name", "Local Area")
                    district = item.get("name", "Local Area")
                    state = item.get("state", "Uttar Pradesh")
    except Exception as e:
        print(f"Reverse geocode error: {e}")

    # Auto-fetch soil defaults for this state
    soil_defaults = get_state_soil_defaults(state)
    
    return {
        "name": name,
        "district": district,
        "state": state,
        "country": "IN",
        "latitude": lat,
        "longitude": lon,
        "soil": soil_defaults
    }
