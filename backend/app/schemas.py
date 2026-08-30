from typing import Optional, List
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class UserSignup(BaseModel):
    name: str = Field(..., example="Harpreet Singh")
    phone: str = Field(..., example="9876543210")
    password: str = Field(..., min_length=4, example="farmer123")

class UserLogin(BaseModel):
    phone: str = Field(..., example="9876543210")
    password: str = Field(..., example="farmer123")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    phone: str
    has_completed_profile: bool

# --- Profile Schemas ---
class FarmerProfileCreate(BaseModel):
    full_name: str
    phone: str
    village_or_city: str
    district: Optional[str] = ""
    state: str
    latitude: float
    longitude: float
    farm_size: float = 2.0
    farm_size_unit: str = "Acres"
    preferred_language: str = "en"
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    rainfall: float
    selected_crop: Optional[str] = "rice"

class FarmerProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: str
    village_or_city: str
    district: str
    state: str
    latitude: float
    longitude: float
    farm_size: float
    farm_size_unit: str
    preferred_language: str
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    rainfall: float
    selected_crop: Optional[str]

    class Config:
        from_attributes = True

# --- Crop Prediction Schemas ---
class PredictRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    rainfall: float
    latitude: float
    longitude: float
    state: Optional[str] = None
    district: Optional[str] = None

class CropRecommendation(BaseModel):
    crop: str
    crop_display_name: str
    suitability_score: float
    suitability_percentage: float
    mandi_price: Optional[float] = None
    price_trend: Optional[str] = "stable" # up, down, stable
    market: Optional[str] = None
    demand_level: str = "Medium" # High, Medium, Moderate
    final_score: float
    is_top_pick: bool = False

class PredictResponse(BaseModel):
    weather: dict
    recommendations: List[CropRecommendation]
    market_data_available: bool
    weather_available: bool

# --- Weather & Advisory Schemas ---
class ForecastRequest(BaseModel):
    crop: str = "rice"
    latitude: float
    longitude: float
    state: Optional[str] = None

class DailyAdvisory(BaseModel):
    date: str
    day_name: str
    temp_high: float
    temp_low: float
    humidity: float
    rain_prob: float
    wind_speed: float
    weather_condition: str
    weather_icon: str
    advisory_keys: List[str]
    advisory_notes: List[str]
    is_spray_safe: bool
    is_irrigation_needed: bool

class ForecastResponse(BaseModel):
    crop: str
    current_weather: dict
    forecast: List[DailyAdvisory]
    urgent_alerts: List[dict]
    weather_available: bool

# --- Soil Defaults Schemas ---
class StateSoilData(BaseModel):
    state: str
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    rainfall: float
    major_crops: List[str]
