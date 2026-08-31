import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_DEMO_PROFILE = {
    id: 1,
    full_name: 'Harpreet Singh',
    phone: '9876543210',
    village_or_city: 'Khanna',
    district: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.7046,
    longitude: 76.2215,
    farm_size: 4.5,
    farm_size_unit: 'acres',
    preferred_language: 'en',
    nitrogen: 85.0,
    phosphorus: 46.0,
    potassium: 35.0,
    ph: 7.2,
    rainfall: 650.0,
    selected_crop: 'rice'
  };

  const initAuth = async () => {
    const token = localStorage.getItem('krishivani_token');
    const storedProfile = localStorage.getItem('krishivani_farmer_profile');

    if (!token) {
      // User is logged out. Keep them on the Login screen!
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    if (token === 'demo_token') {
      const demoUser = {
        user_id: 1,
        name: 'Harpreet Singh',
        phone: '9876543210',
        has_completed_profile: true
      };
      setUser(demoUser);
      setProfile(storedProfile ? JSON.parse(storedProfile) : DEFAULT_DEMO_PROFILE);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      const prof = data.profile || (storedProfile ? JSON.parse(storedProfile) : null);
      setUser({
        user_id: data.user_id,
        name: data.name,
        phone: data.phone,
        has_completed_profile: data.has_completed_profile || !!prof
      });
      setProfile(prof);
    } catch (err) {
      console.warn('Using local cached session:', err);
      if (storedProfile) {
        const prof = JSON.parse(storedProfile);
        setUser({
          user_id: prof.user_id || Date.now(),
          name: prof.full_name || 'Farmer',
          phone: prof.phone || '',
          has_completed_profile: true
        });
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (phone, password) => {
    // 1. Instant Demo Account Login
    if (phone === '9876543210') {
      localStorage.setItem('krishivani_token', 'demo_token');
      localStorage.setItem('krishivani_farmer_profile', JSON.stringify(DEFAULT_DEMO_PROFILE));
      
      const demoCrops = [
        {
          id: 101,
          user_id: 1,
          crop_name: 'rice',
          season: 'kharif',
          sowing_date: '2026-06-15',
          status: 'active'
        },
        {
          id: 102,
          user_id: 1,
          crop_name: 'mungbean',
          season: 'zaid',
          sowing_date: '2026-07-20',
          status: 'active'
        }
      ];
      localStorage.setItem('krishivani_registered_crops', JSON.stringify(demoCrops));

      const demoUser = {
        user_id: 1,
        name: 'Harpreet Singh',
        phone: '9876543210',
        has_completed_profile: true
      };
      setUser(demoUser);
      setProfile(DEFAULT_DEMO_PROFILE);
      return demoUser;
    }

    // 2. Real User Login
    try {
      const data = await api.login({ phone, password });
      localStorage.setItem('krishivani_token', data.access_token);
      setUser({
        user_id: data.user_id,
        name: data.name,
        phone: data.phone,
        has_completed_profile: data.has_completed_profile
      });
      if (data.has_completed_profile) {
        try {
          const prof = await api.getProfile();
          setProfile(prof);
        } catch (e) {
          console.warn('Could not fetch profile:', e);
        }
      }
      return data;
    } catch (e) {
      const storedProfile = localStorage.getItem('krishivani_farmer_profile');
      const prof = storedProfile ? JSON.parse(storedProfile) : null;
      const localUser = {
        user_id: Date.now(),
        name: prof?.full_name || 'Farmer',
        phone,
        has_completed_profile: !!prof
      };
      localStorage.setItem('krishivani_token', `local_token_${Date.now()}`);
      setUser(localUser);
      setProfile(prof);
      return localUser;
    }
  };

  const signup = async (name, phone, password) => {
    // Clear old caches so new account starts fresh
    localStorage.removeItem('krishivani_farmer_profile');
    localStorage.removeItem('krishivani_registered_crops');
    
    try {
      const data = await api.signup({ name, phone, password });
      localStorage.setItem('krishivani_token', data.access_token);
      const newUser = {
        user_id: data.user_id,
        name: data.name || name,
        phone: data.phone || phone,
        has_completed_profile: false
      };
      setUser(newUser);
      setProfile(null);
      return newUser;
    } catch (e) {
      localStorage.setItem('krishivani_token', `local_token_${Date.now()}`);
      const newUser = {
        user_id: Date.now(),
        name,
        phone,
        has_completed_profile: false
      };
      setUser(newUser);
      setProfile(null);
      return newUser;
    }
  };

  const saveFarmerProfile = async (profileData) => {
    localStorage.setItem('krishivani_farmer_profile', JSON.stringify(profileData));
    const saved = await api.saveProfile(profileData);
    setProfile(saved);
    setUser(prev => prev ? { ...prev, has_completed_profile: true } : prev);
    return saved;
  };

  const updateActiveCrop = async (cropName) => {
    await api.selectCrop(cropName);
    setProfile(prev => prev ? { ...prev, selected_crop: cropName } : prev);
  };

  const logout = () => {
    localStorage.removeItem('krishivani_token');
    localStorage.removeItem('krishivani_farmer_profile');
    localStorage.removeItem('krishivani_registered_crops');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        hasCompletedProfile: user?.has_completed_profile || !!profile,
        login,
        signup,
        saveFarmerProfile,
        updateActiveCrop,
        logout,
        refreshProfile: initAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
