# KrishiVani (कृषिवाणी) — Smart Crop Advisory System

> **SIH25010**: Smart Crop Advisory System for Small and Marginal Farmers.

KrishiVani is a modern, profit-aware agricultural advisory web application built with **React**, **FastAPI**, and **scikit-learn**. It leverages offline Random Forest machine learning models alongside real-time data from **OpenWeatherMap** and **data.gov.in (Agmarknet)** to deliver personalized crop recommendations, live mandi price intelligence, and weather-based daily farm management advisories with browser-based automatic voice readout (TTS) in **English**, **हिन्दी (Hindi)**, and **ਪੰਜਾਬੀ (Punjabi)**.

---

## 🌟 Key Features

1. **Farmer Authentication & Live GPS Geolocation**:
   - Secure Phone Number & Password registration and login.
   - **Google Sign-In** button ready for cloud OAuth integration.
   - Online GPS auto-detection with reverse geocoding to village and state level.
   - Smart redirection: New or incomplete profiles route directly to the Farmer Profile Registration page, while existing farmers access the Home Dashboard immediately.

2. **Profit-Aware AI Crop Recommendations**:
   - Trained on the 2,200-sample Crop Recommendation dataset with **99.55% validation accuracy** across 22 crops.
   - Profit-aware ranking formula:
     $$\text{Final Score} = 0.6 \times \text{Agronomic Suitability} + 0.4 \times \text{Normalized Mandi Price}$$
   - Displays top recommended crop with suitability percentage, live/benchmark mandi prices, and market demand indicators.

3. **Weather-Based Crop Management & 5-Day Advisories**:
   - 5-day weather forecast with temperature highs/lows, rain probability, humidity, and wind speed.
   - Smart rule engine for rain runoff alerts, pesticide drift warnings, frost protection, and fungal/rust disease risk mitigation.

4. **Live Mandi Market Intelligence (Agmarknet)**:
   - Real-time commodity arrivals and price quotes from national agricultural markets (`api.data.gov.in`).
   - Modal, minimum, and maximum prices with trend indicators and demand levels.

5. **Multilingual UI & Auto-TTS Voice Output**:
   - Full native localization in **English**, **हिन्दी (Hindi)**, and **ਪੰਜਾਬੀ (Punjabi)**.
   - SpeechSynthesis engine that reads out crop recommendations and farm advisories upon rendering.

6. **Stitch-Aligned Modern UI**:
   - Material Design 3 theme matching Google Stitch specifications.
   - Responsive layout with bottom navigation bar and mobile-first card design.

---

## 🏗️ Architecture

```
KrishiVani/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint, CORS & routing
│   │   ├── config.py                # App configuration & API keys
│   │   ├── database.py              # SQLite ORM configuration
│   │   ├── models.py                # SQLAlchemy Models (User, FarmerProfile)
│   │   ├── schemas.py               # Pydantic data schemas
│   │   ├── routers/                 # API endpoints (auth, profile, predict, forecast, market, soil)
│   │   ├── services/                # OpenWeatherMap, Agmarknet, and Advisory services
│   │   ├── ml/                      # Random Forest training & inference (crop_model.joblib)
│   │   └── data/                    # Crop dataset, Soil Health Card data, Commodity mapping
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Main application orchestrator
    │   ├── context/AuthContext.jsx  # Farmer session management
    │   ├── components/              # Dashboard, Recommendations, Forecast, Mandi, Profile, Auth
    │   ├── hooks/                   # useSpeechSynthesis hook
    │   ├── i18n/                    # English, Hindi, Punjabi translation files
    │   ├── data/                    # Crop translations & advisory templates
    │   └── styles/                  # Tailwind CSS styling
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js v18+ & npm**

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Train the ML model (if not already trained)
python app/ml/train_model.py

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Verification & ML Accuracy

- **Random Forest Classifier**: Validation Accuracy **99.55%** on stratified 80/20 test split.
- **Resilient Fallback**: If OpenWeatherMap or Agmarknet APIs are temporarily unreachable or rate-limited, the system degrades to benchmark state averages and agronomic suitability rankings with visual notices.
