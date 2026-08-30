// In development and production, connect directly to FastAPI backend on port 8000 or relative proxy
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = isLocal ? 'http://localhost:8000/api' : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('krishivani_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Auth
  async signup(data) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async login(data) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Profile
  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async saveProfile(profileData) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  async selectCrop(cropName) {
    const res = await fetch(`${API_BASE}/profile/select-crop?crop_name=${encodeURIComponent(cropName)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Predictions & ML
  async predictCrops(soilData) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(soilData),
    });
    return handleResponse(res);
  },

  // Forecast & Advisory
  async getForecast(crop, latitude, longitude, state) {
    const res = await fetch(`${API_BASE}/forecast`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        crop,
        latitude,
        longitude,
        state
      }),
    });
    return handleResponse(res);
  },

  // Market Prices
  async getMarketPrices(commodity, state, district) {
    const params = new URLSearchParams();
    if (commodity) params.append('commodity', commodity);
    if (state) params.append('state', state);
    if (district) params.append('district', district);

    const res = await fetch(`${API_BASE}/market-prices?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Soil defaults & reverse geocode
  async getSoilDefaults() {
    const res = await fetch(`${API_BASE}/soil-defaults`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async reverseGeocode(lat, lon) {
    const res = await fetch(`${API_BASE}/geocode/reverse?lat=${lat}&lon=${lon}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  }
};
