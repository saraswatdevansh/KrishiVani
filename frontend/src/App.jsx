import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterFarmer } from './components/Auth/RegisterFarmer';
import { Dashboard } from './components/Dashboard';
import { PersonalisedFarming } from './components/PersonalisedFarming';
import { WeatherForecast } from './components/WeatherForecast';
import { MarketPrices } from './components/MarketPrices';
import { AlertsView } from './components/AlertsView';
import { FarmerProfileView } from './components/FarmerProfileView';
import { LanguageModal } from './components/LanguageModal';

export const App = () => {
  const { isAuthenticated, hasCompletedProfile, loading, profile } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isManualRegisterMode, setIsManualRegisterMode] = useState(false);
  const [targetWeatherCrop, setTargetWeatherCrop] = useState(null);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  // 1. Loading Splash Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center p-1.5 shadow-md border border-primary/20 overflow-hidden animate-pulse">
          <img src="/assets/logo.png" alt="KrishiVani Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <h1 className="font-extrabold text-xl text-primary tracking-tight">KRISHIVANI</h1>
          <p className="text-xs text-on-surface-variant">Loading smart crop advisory...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Login / Signup Page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onCompleteAuth={({ isNewUser }) => {
            if (isNewUser) {
              setIsManualRegisterMode(true);
            }
          }}
          onOpenLanguage={() => setIsLanguageModalOpen(true)}
        />
        <LanguageModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
        />
      </>
    );
  }

  // 3. Authenticated but Profile Incomplete or Editing -> Register Farmer Page
  if (!hasCompletedProfile || isManualRegisterMode) {
    return (
      <>
        <RegisterFarmer
          onRegistrationComplete={() => {
            setIsManualRegisterMode(false);
            setActiveTab('home');
          }}
        />
        <LanguageModal
          isOpen={isLanguageModalOpen}
          onClose={() => setIsLanguageModalOpen(false)}
        />
      </>
    );
  }

  // 4. Main App Shell (Post-Login & Registered)
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        hasUnreadAlerts={hasUnreadAlerts}
        onOpenLanguage={() => setIsLanguageModalOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenAlerts={() => setActiveTab('advise')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'home' && (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenSoilModal={() => setActiveTab('farming')}
          />
        )}

        {activeTab === 'farming' && (
          <PersonalisedFarming
            onNavigateWeather={(crop) => {
              setTargetWeatherCrop(crop);
              setActiveTab('weather');
            }}
          />
        )}

        {activeTab === 'mandi' && <MarketPrices />}

        {activeTab === 'weather' && (
          <WeatherForecast
            targetCrop={targetWeatherCrop || profile?.selected_crop || 'rice'}
          />
        )}

        {activeTab === 'advise' && (
          <AlertsView 
            hasUnreadAlerts={hasUnreadAlerts}
            onMarkAllRead={() => setHasUnreadAlerts(false)}
          />
        )}

        {activeTab === 'profile' && (
          <FarmerProfileView
            onEditProfile={() => setIsManualRegisterMode(true)}
            onOpenLanguage={() => setIsLanguageModalOpen(true)}
          />
        )}
      </main>

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
    </div>
  );
};
export default App;
