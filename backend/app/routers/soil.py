import os
import json
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from ..schemas import StateSoilData
from ..services.weather import reverse_geocode

router = APIRouter(prefix="/api", tags=["Soil & Geolocation"])

SOIL_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "soil_health_card.json")

@router.get("/soil-defaults", response_model=List[StateSoilData])
def get_soil_defaults():
    if os.path.exists(SOIL_DATA_PATH):
        with open(SOIL_DATA_PATH, "r") as f:
            data = json.load(f)
            return data
    return []

@router.get("/geocode/reverse")
@router.get("/reverse-geocode")
async def get_reverse_location(lat: float = Query(...), lon: float = Query(...)):
    res = await reverse_geocode(lat, lon)
    return res
