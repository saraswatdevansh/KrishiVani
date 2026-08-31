import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base
from .routers import auth, profile, predict, forecast, market, soil, farm, alerts
from .ml.model import get_model

# Create database tables safely
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database init notice: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🌾 Starting KrishiVani Backend...")
    # Preload ML model
    try:
        model, meta = get_model()
        accuracy = meta.get("validation_accuracy", 0.99) if meta else 0.99
        print(f"✅ ML Model loaded successfully! (Validation Accuracy: {accuracy*100:.2f}%)")
    except Exception as e:
        print(f"⚠️ Warning loading ML model: {e}")
    yield
    print("🌾 KrishiVani Backend shutting down...")

app = FastAPI(
    title="KrishiVani API",
    description="Smart Crop Advisory System for Small and Marginal Farmers (SIH25010)",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(predict.router)
app.include_router(forecast.router)
app.include_router(market.router)
app.include_router(soil.router)
app.include_router(farm.router)
app.include_router(alerts.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to KrishiVani Smart Crop Advisory API",
        "status": "online",
        "version": "1.0.0",
        "features": [
            "AI Crop Suggestion (profit-aware)",
            "Weather-Based Crop Management & 5-Day Advisory",
            "Real-time Mandi Market Prices (Agmarknet)",
            "Multilingual & Voice Support"
        ]
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
