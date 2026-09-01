# 🌾 KrishiVani (कृषिवाणी) — Smart Crop Advisory & Voice AI System

> **SIH25010**: Smart Crop Advisory System for Small and Marginal Farmers.
>
> 🌐 **Live Web App**: [https://krishivani-app.vercel.app](https://krishivani-app.vercel.app) | [https://krishivani.vercel.app](https://krishivani.vercel.app)  
> 📞 **Voice AI Helpline (IVR)**: Integrated with **Sarvam AI (Saarika + Bulbul + Samvaad)** for feature-phone and dial-in advisory.

---

## 📖 Overview

**KrishiVani (कृषिवाणी)** is an end-to-end, profit-aware smart agricultural advisory platform designed to empower small and marginal Indian farmers. It combines **Supervised Machine Learning (Random Forest)**, **Statistical Evidence Engines**, **ICAR Package of Practices**, real-time **OpenWeatherMap** agro-meteorological forecasting, and live **Agmarknet Mandi prices**.

To bridge the digital divide for farmers without smartphones or internet access, KrishiVani features an **Omnichannel Voice AI Helpline (IVR)** powered by **Sarvam AI**, enabling farmers to access personalized crop lifecycle tracking, weather advisories, and mandi rates simply by making a phone call in their native language (**Hindi, English, or Punjabi**).

---

## 🌟 Key Features

### 1. 🤖 Evidence-Backed AI Crop Recommendations
- **99.55% Validation Accuracy** using a Random Forest Classifier trained on 2,200 agricultural samples across 22 crops.
- **Statistical Evidence Engine** (`crop_profiles.json`): Provides transparent *"Why This Crop?"* explainability with per-nutrient match bars ($N, P, K, \text{pH}, \text{Rainfall}, \text{Temperature}, \text{Humidity}$).
- **Gated Profit-Aware Re-ranking Formula**:
  $$\text{Final Score} = 0.65 \times \text{Agronomic Suitability} + 0.35 \times \text{Normalized Mandi Price}$$
  Combines biological suitability with live market demand so farmers maximize income per acre.

### 2. 🌱 Personalized Farm & Crop Lifecycle Tracking
- **ICAR-Aligned Growth Engine** (`crop_lifecycle.json` with 2,017 lines of agronomic science covering 22 crops).
- Dynamically tracks growth stages from sowing date (*Nursery $\rightarrow$ Tillering $\rightarrow$ Panicle Initiation $\rightarrow$ Flowering $\rightarrow$ Grain Filling $\rightarrow$ Harvest*).
- Displays visual progress bars, countdowns to next stage, and stage-specific fertilizer top-dressing schedules (e.g., Urea timing at 21 DAT).

### 3. 🌤️ Agro-Meteorological Weather & Spray Safety
- 5-day hyper-local weather forecast with 4-parameter grid: Temperature, Humidity, Wind Speed, and Rain Probability.
- **Smart Advisory Engine**:
  - **Pesticide Spray Safety**: Alerts if wind $> 20\text{ km/h}$ or rain probability $> 40\%$ to prevent chemical drift or runoff.
  - **Fungal & Rust Risk Alarm**: Triggers when humidity exceeds $78\%$ during warm spells.
  - **Irrigation Guidance**: Recommends early morning/evening irrigation during heat stress.

### 4. 📈 Real-Time APMC Mandi Market Intelligence
- Ingests live commodity arrival and modal price records from the **Ministry of Agriculture's Agmarknet API** (`data.gov.in`).
- Displays modal, minimum, and maximum prices, price trends, and demand indicators across state and district APMC mandis.

### 5. 📞 Voice AI Telephony Helpline (Sarvam IVR)
- Zero-app accessibility for rural farmers via standard phone calls.
- **Speech-to-Text (STT)**: Sarvam **Saarika** (optimized for Indian dialects and ambient field noise).
- **Conversational Intelligence**: Sarvam **Samvaad Indic LLM** conditioned with ICAR Package of Practices (RAG) + live backend Tool Calling.
- **Text-to-Speech (TTS)**: Sarvam **Bulbul** (natural neural Hindi and regional voice).
- **Kisan Call Centre Escalation**: Automatic transfer to Toll-Free `1800-180-1551` for complex human queries.

### 6. 🌐 Multilingual Accessibility & Cloud Database
- Full native localization in **हिन्दी (Hindi)**, **English**, and **ਪੰਜਾਬੀ (Punjabi)** with auto-TTS browser speech synthesis.
- Backed by **Supabase Cloud PostgreSQL** with client-side offline fallback resilience.

---

## 🏗️ System Architecture

```
KrishiVani/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & middleware
│   │   ├── database.py              # Supabase & SQLite ORM configuration
│   │   ├── models.py                # SQLAlchemy Models (User, FarmerProfile, RegisteredCrop)
│   │   ├── schemas.py               # Pydantic schemas with evidence models
│   │   ├── routers/
│   │   │   ├── auth.py              # JWT authentication & session management
│   │   │   ├── profile.py           # Farmer profile & GPS geolocation
│   │   │   ├── predict.py           # ML prediction & statistical evidence engine
│   │   │   ├── forecast.py          # Weather forecast & agro-advisory
│   │   │   ├── market.py            # Agmarknet live mandi rates
│   │   │   ├── farm.py              # Crop registration & lifecycle tracking
│   │   │   ├── alerts.py            # Urgent dashboard alerts & notifications
│   │   │   └── ivr.py               # Sarvam Voice Agent IVR webhook endpoints
│   │   ├── services/                # OpenWeatherMap, Agmarknet, and Advisory services
│   │   ├── ml/                      # Random Forest training & inference pipeline
│   │   └── data/                    # crop_lifecycle.json, crop_profiles.json, soil defaults
│   ├── requirements.txt
│   └── venv/
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Main application router & orchestrator
    │   ├── context/AuthContext.jsx  # Supabase & Local authentication context
    │   ├── components/              # Dashboard, PersonalisedFarming, MyFarm, Weather, Mandi
    │   ├── services/api.js          # API client with dual-tier cloud/local fallback
    │   ├── hooks/                   # useSpeechSynthesis hook
    │   ├── i18n/                    # en.json, hi.json, pa.json translations
    │   └── data/                    # Crop translations & static data
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

# Train the ML Model and generate crop statistical profiles
python -m app.ml.train_model

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Voice AI IVR Tunnel (For Sarvam Voice Agents)
```bash
# In a separate terminal, expose port 8000
./ngrok http 8000
```
Map your ngrok URL (`https://<id>.ngrok-free.dev/api/ivr/...`) to the Sarvam Agent Tools dashboard.

---

## 🧪 Machine Learning & Validation

| Parameter | Specification |
| :--- | :--- |
| **Model Type** | Random Forest Classifier (`n_estimators=100`, `max_depth=15`) |
| **Validation Accuracy** | **99.55%** on stratified 80/20 train-test split |
| **Target Classes** | 22 Major Indian Crops (Rice, Wheat, Maize, Cotton, Chickpea, etc.) |
| **Input Features** | 7 Parameters: $N, P, K$, Temperature, Humidity, pH, Rainfall |
| **Explainability** | Empirical Quantile Matching ($Q_1, Q_3, \text{Min}, \text{Max}$) per feature |
| **Data Sources** | ICAR Package of Practices, Agmarknet (`data.gov.in`), OpenWeatherMap |

---

## 🛡️ License

This project is built for the **Smart India Hackathon (SIH)**. Distributed under the MIT License.
