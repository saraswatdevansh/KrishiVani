import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const token = localStorage.getItem('krishivani_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser({
        user_id: data.user_id,
        name: data.name,
        phone: data.phone,
        has_completed_profile: data.has_completed_profile
      });
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('krishivani_token');
      setUser(null);
      setProfile(null);
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
