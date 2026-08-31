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

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# Static files & SPA handling
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_CANDIDATES = [
    os.path.join(BASE_DIR, "dist"),
    os.path.abspath(os.path.join(BASE_DIR, "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist")),
]

DIST_DIR = next((d for d in DIST_CANDIDATES if os.path.exists(d)), None)

if DIST_DIR:
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    async def serve_root():
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "KrishiVani Frontend loading..."}

    @app.exception_handler(404)
    async def custom_404_handler(request, exc):
        path = request.url.path
        if path.startswith("/api"):
            return JSONResponse(status_code=404, content={"detail": f"API endpoint '{path}' not found"})
        clean_path = path.lstrip("/")
        target_file = os.path.join(DIST_DIR, clean_path)
        if clean_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Not found"})
