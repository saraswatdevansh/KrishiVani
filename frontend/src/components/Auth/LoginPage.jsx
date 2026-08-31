import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = ({ onCompleteAuth, onOpenLanguage }) => {
  const { t, i18n } = useTranslation();
  const { login, signup } = useAuth();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fillDemoCredentials = () => {
    setPhone('9876543210');
    setPassword('farmer123');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUpMode) {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (phone.length < 10) {
          throw new Error('Please enter a valid 10-digit mobile number');
        }
        const data = await signup(name.trim(), phone.trim(), password);
        onCompleteAuth({ isNewUser: true, data });
      } else {
        if (phone.length < 10) {
          throw new Error('Please enter a valid 10-digit mobile number');
        }
        const data = await login(phone.trim(), password);
        onCompleteAuth({ isNewUser: !data.has_completed_profile, data });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuthClick = () => {
    // Future OAuth placeholder
    alert("Google Sign-In integration is reserved for cloud deployment. Please use Phone Number & Password for local MVP testing.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 max-w-md mx-auto relative overflow-hidden">
      {/* Top Language button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onOpenLanguage}
          className="flex items-center gap-1.5 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/60 text-xs font-semibold text-primary shadow-sm hover:bg-surface"
        >
          <span className="material-symbols-outlined text-[16px]">translate</span>
          {i18n.language === 'hi' ? 'हिन्दी' : i18n.language === 'pa' ? 'ਪੰਜਾਬੀ' : 'English'}
        </button>
      </div>

      {/* Main Card Container */}
      <div className="w-full bg-surface-container-lowest rounded-3xl shadow-card border border-outline-variant/40 overflow-hidden flex flex-col">
        {/* Hero Agricultural Image with Gradient */}
        <div className="h-44 w-full relative overflow-hidden bg-primary/20">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
            alt="Agricultural Fields"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent"></div>
          
          {/* Logo Badge */}
          <div className="absolute bottom-2 left-6 flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-outline-variant/30 flex items-center justify-center overflow-hidden">
              <img 
                src="/assets/logo.png" 
                alt="KrishiVani Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-xl text-primary tracking-tight">KRISHIVANI</h1>
              <p className="text-[11px] text-on-surface-variant font-medium">Smart AI Advisory for Farmers</p>
            </div>
          </div>
        </div>

        {/* Auth Form Body */}
        <div className="p-6 pt-3 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">
              {isSignUpMode ? t('login.btn_signup') : t('login.btn_login')}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {t('login.welcome_title')}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-error-container/60 border border-error/30 text-on-error-container px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-error">error</span>
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Full Name field if Sign Up */}
            {isSignUpMode && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">
                  {t('login.name_label')}
                </label>
                <div className="flex items-center bg-surface-container-low border border-outline-variant/70 rounded-xl px-3 h-11 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">person</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('login.name_placeholder')}
                    className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>
            )}

            {/* Phone Number Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">
                {t('login.phone_label')}
              </label>
              <div className="flex items-center bg-surface-container-low border border-outline-variant/70 rounded-xl h-11 overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <div className="px-3 bg-surface-container border-r border-outline-variant/60 text-xs font-bold text-on-surface flex items-center justify-center h-full">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder={t('login.phone_placeholder')}
                  className="flex-1 px-3 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 tracking-wider font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">
                {t('login.password_label')}
              </label>
              <div className="flex items-center bg-surface-container-low border border-outline-variant/70 rounded-xl px-3 h-11 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant mr-2">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.password_placeholder')}
                  className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Link */}
            {!isSignUpMode && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-[11px] text-primary hover:text-primary-container font-semibold flex items-center gap-1 cursor-pointer transition-colors bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20"
                >
                  <span className="material-symbols-outlined text-[13px]">badge</span>
                  <span>Demo: Harpreet Singh (9876543210)</span>
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full h-11 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              ) : (
                <>
                  <span>{isSignUpMode ? t('login.btn_signup') : t('login.btn_login')}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-outline-variant/40"></div>
            <span className="text-[11px] text-on-surface-variant font-medium">{t('login.or_continue')}</span>
            <div className="flex-1 h-px bg-outline-variant/40"></div>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleAuthClick}
            className="w-full h-11 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant rounded-xl font-medium text-xs text-on-surface flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{t('login.google_auth')}</span>
          </button>

          {/* Toggle Login / Signup */}
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setPhone('');
                setName('');
                setPassword('');
                setErrorMsg('');
              }}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {isSignUpMode ? t('login.switch_to_login') : t('login.switch_to_signup')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
