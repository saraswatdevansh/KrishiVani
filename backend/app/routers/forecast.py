from fastapi import APIRouter
from typing import List
from ..schemas import ForecastRequest, ForecastResponse, DailyAdvisory
from ..services.weather import get_current_weather, get_5day_forecast
from ..services.advisory import generate_daily_advisory, generate_urgent_alerts

router = APIRouter(prefix="/api", tags=["Weather & Forecast"])

@router.post("/forecast", response_model=ForecastResponse)
async def get_crop_weather_advisory(req: ForecastRequest):
    # 1. Fetch current weather and 5-day forecast
    current_weather = await get_current_weather(req.latitude, req.longitude)
    daily_forecasts = await get_5day_forecast(req.latitude, req.longitude)
    
    # 2. Build daily advisories
    advisory_list: List[DailyAdvisory] = []
    for day in daily_forecasts:
        adv = generate_daily_advisory(req.crop, day)
        advisory_list.append(DailyAdvisory(
            date=day["date"],
            day_name=day["day_name"],
            temp_high=day["temp_high"],
            temp_low=day["temp_low"],
            humidity=day["humidity"],
            rain_prob=day["rain_prob"],
            wind_speed=day["wind_speed"],
            weather_condition=day["weather_condition"],
            weather_icon=day["weather_icon"],
            advisory_keys=adv["advisory_keys"],
            advisory_notes=adv["advisory_notes"],
            is_spray_safe=adv["is_spray_safe"],
            is_irrigation_needed=adv["is_irrigation_needed"]
        ))
        
    # 3. Generate urgent alerts
    alerts = generate_urgent_alerts(req.crop, current_weather, daily_forecasts)
    
    return ForecastResponse(
        crop=req.crop,
        current_weather=current_weather,
        forecast=advisory_list,
        urgent_alerts=alerts,
        weather_available=current_weather.get("is_live", False)
    )
