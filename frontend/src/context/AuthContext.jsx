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
      // Auto-initialize demo profile for seamless experience
      const prof = storedProfile ? JSON.parse(storedProfile) : DEFAULT_DEMO_PROFILE;
      localStorage.setItem('krishivani_token', 'demo_guest_token');
      localStorage.setItem('krishivani_farmer_profile', JSON.stringify(prof));
      setUser({
        user_id: 1,
        name: prof.full_name || 'Harpreet Singh',
        phone: prof.phone || '9876543210',
        has_completed_profile: true
      });
      setProfile(prof);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser({
        user_id: data.user_id || 1,
        name: data.name || 'Harpreet Singh',
        phone: data.phone || '9876543210',
        has_completed_profile: true
      });
      if (data.profile) {
        setProfile(data.profile);
      } else {
        const prof = storedProfile ? JSON.parse(storedProfile) : DEFAULT_DEMO_PROFILE;
        setProfile(prof);
      }
    } catch (err) {
      console.warn('Using local cached session:', err);
      const prof = storedProfile ? JSON.parse(storedProfile) : DEFAULT_DEMO_PROFILE;
      setUser({
        user_id: 1,
        name: prof.full_name || 'Harpreet Singh',
        phone: prof.phone || '9876543210',
        has_completed_profile: true
      });
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (phone, password) => {
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
  };

  const signup = async (name, phone, password) => {
    localStorage.removeItem('krishivani_farmer_profile');
    localStorage.removeItem('krishivani_registered_crops');
    const data = await api.signup({ name, phone, password });
    localStorage.setItem('krishivani_token', data.access_token);
    setUser({
      user_id: data.user_id,
      name: data.name,
      phone: data.phone,
      has_completed_profile: false
    });
    setProfile(null);
    return data;
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
