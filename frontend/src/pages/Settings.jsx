import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';

const Settings = () => {
  const { user, loading, updateProfile } = useAuth();
  const lastUserIdRef = useRef(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    incomeFrequency: 'Monthly',
    incomeSources: '',
    priorities: 'Saving',
    riskTolerance: 'Moderate'
  });

  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null;
      return;
    }
    if (lastUserIdRef.current === user._id) return;

    const initialData = {
      incomeFrequency: user.incomeFrequency || 'Monthly',
      incomeSources: user.incomeSources || '',
      priorities: user.priorities || 'Saving',
      riskTolerance: user.riskTolerance || 'Moderate'
    };

    setFormData(initialData);
    lastUserIdRef.current = user._id;
    setHasChanges(false);
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
    setStatus({ type: '', message: '' });
  };

  const handleReset = () => {
    if (!user) return;
    setStatus({ type: '', message: '' });
    setFormData({
      incomeFrequency: user.incomeFrequency || 'Monthly',
      incomeSources: user.incomeSources || '',
      priorities: user.priorities || 'Saving',
      riskTolerance: user.riskTolerance || 'Moderate'
    });
    setHasChanges(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user || isSaving) return;
    setIsSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        incomeFrequency: formData.incomeFrequency,
        incomeSources: formData.incomeSources,
        priorities: formData.priorities,
        riskTolerance: formData.riskTolerance
      };

      const data = await updateProfile(payload);

      if (data?.success) {
        setFormData({
          incomeFrequency: data.user?.incomeFrequency || 'Monthly',
          incomeSources: data.user?.incomeSources || '',
          priorities: data.user?.priorities || 'Saving',
          riskTolerance: data.user?.riskTolerance || 'Moderate'
        });
        setStatus({
          type: 'success',
          message: 'Your financial profile has been updated successfully!'
        });
        setHasChanges(false);

        setTimeout(() => {
          setStatus({ type: '', message: '' });
        }, 5000);
      } else {
        setStatus({
          type: 'error',
          message: data?.message || 'Unable to save changes. Please try again.'
        });
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to save changes. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const fieldInfo = {
    incomeFrequency: 'How often you receive income',
    incomeSources: 'e.g., Salary, Freelance, Investments',
    priorities: 'Your primary financial goal',
    riskTolerance: 'Your comfort level with investment risk'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-24">
      <AppNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 hover:gap-3 mb-4"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-4">
              Configuration
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Financial Profile
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Customize your financial preferences to get personalized insights and recommendations tailored to your goals.
            </p>
          </div>
        </header>

        {/* Status Messages */}
        {status.message && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl mb-6 animate-slideDown ${status.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}
            role="alert"
          >
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              {status.type === 'success' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <p className="flex-1 text-sm font-medium">{status.message}</p>
            <button
              onClick={() => setStatus({ type: '', message: '' })}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss message"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Income Information Section */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-shadow duration-300 hover:shadow-md">
            <div className="flex gap-4 pb-6 mb-6 border-b-2 border-slate-100 dark:border-slate-700">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                  Income Information
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Help us understand your income patterns
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Frequency */}
              <div className="space-y-2">
                <label
                  htmlFor="incomeFrequency"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Income Frequency
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {fieldInfo.incomeFrequency}
                </p>
                <div className="relative">
                  <select
                    id="incomeFrequency"
                    name="incomeFrequency"
                    value={formData.incomeFrequency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 outline-none text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-500 appearance-none cursor-pointer pr-10"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Income Sources */}
              <div className="space-y-2">
                <label
                  htmlFor="incomeSources"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Income Sources
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {fieldInfo.incomeSources}
                </p>
                <input
                  id="incomeSources"
                  type="text"
                  name="incomeSources"
                  value={formData.incomeSources}
                  onChange={handleChange}
                  placeholder="Enter your income sources"
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500"
                />
              </div>
            </div>
          </section>

          {/* Financial Goals Section */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-shadow duration-300 hover:shadow-md">
            <div className="flex gap-4 pb-6 mb-6 border-b-2 border-slate-100 dark:border-slate-700">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                  Financial Goals & Preferences
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Define your financial priorities and risk appetite
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Priorities */}
              <div className="space-y-2">
                <label
                  htmlFor="priorities"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Financial Priorities
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {fieldInfo.priorities}
                </p>
                <div className="relative">
                  <select
                    id="priorities"
                    name="priorities"
                    value={formData.priorities}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 outline-none text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-500 appearance-none cursor-pointer pr-10"
                  >
                    <option value="Saving">Saving</option>
                    <option value="Investing">Investing</option>
                    <option value="Debt Payoff">Debt Payoff</option>
                    <option value="Balanced">Balanced</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-2">
                <label
                  htmlFor="riskTolerance"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Risk Tolerance
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {fieldInfo.riskTolerance}
                </p>
                <div className="relative">
                  <select
                    id="riskTolerance"
                    name="riskTolerance"
                    value={formData.riskTolerance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 outline-none text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-500 appearance-none cursor-pointer pr-10"
                  >
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </form>

        {/* Sticky Footer */}
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-2xl z-50 transition-transform duration-300 ${hasChanges ? 'translate-y-0' : 'translate-y-full'
            }`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium animate-pulse">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>You have unsaved changes</span>
                </div>
              )}

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading || isSaving || !user || !hasChanges}
                  className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSave}
                  disabled={loading || isSaving || !user || !hasChanges}
                  className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;