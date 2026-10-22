'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Check,
  Sparkles,
  TrendingUp,
  CreditCard,
  Shield,
  Users,
  ExternalLink,
  ChevronDown,
  Info,
  Sliders,
  Lock,
} from 'lucide-react';
import { fetchAdminSettings, updateAdminSettings } from '../../../lib/api/admin';
import { AdminSettingsData, AdminRolePermissionRow } from '../../../lib/types/admin';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('general');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAdminSettings();
        setSettings(res.settings);
      } catch (err) {
        console.error('Failed to load admin settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await updateAdminSettings(settings);
      setSettings(res.settings);
      setSaveSuccessMsg('System settings saved successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof AdminSettingsData>(
    key: K,
    value: AdminSettingsData[K],
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const togglePermission = (roleIndex: number, field: keyof AdminRolePermissionRow) => {
    if (!settings) return;
    const updatedPerms = [...settings.permissions];
    const row = { ...updatedPerms[roleIndex] };
    (row[field] as boolean) = !row[field];
    updatedPerms[roleIndex] = row;
    setSettings({ ...settings, permissions: updatedPerms });
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { id: 'general', label: 'General' },
    { id: 'ai', label: 'AI' },
    { id: 'product-intelligence', label: 'Product Intelligence' },
    { id: 'payments', label: 'Payments' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {saveSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900">
            System Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Configure global system settings and platform-wide preferences.
          </p>
        </div>

        {/* Save Changes button and Last Saved */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-right">
          <span className="text-[11px] text-zinc-400">Last saved: {settings.last_saved}</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#EA580C] text-white hover:bg-[#C2410C] rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save changes'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SETTINGS LAYOUT (LEFT MINI NAV + 3-COLUMN CARDS) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Mini Nav (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-2 shadow-2xs space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                  activeNav === item.id
                    ? 'bg-orange-50 text-[#EA580C] font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* System Health Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>System Health</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">All systems operational</p>
            <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
              <span>Uptime</span>
              <span className="font-semibold text-zinc-900">{settings.uptime}</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500">
              <span>Last checked</span>
              <span>{settings.last_health_check}</span>
            </div>
            <a
              href="#status"
              className="mt-2 block text-center py-1.5 px-2 rounded-lg border border-zinc-200 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center justify-center gap-1"
            >
              <span>View Status Page</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* 3-Column Settings Cards (10 cols) */}
        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* ======================================================= */}
          {/* COLUMN 1 */}
          {/* ======================================================= */}
          <div className="space-y-5">
            {/* 1. AI Configuration */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>AI Configuration</span>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Default AI Model</label>
                <div className="relative">
                  <select
                    value={settings.default_ai_model}
                    onChange={(e) => updateSetting('default_ai_model', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
                    <option value="OpenAI GPT-4-turbo">OpenAI GPT-4-turbo</option>
                    <option value="Anthropic Claude 3.5 Sonnet">Anthropic Claude 3.5 Sonnet</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Fallback Model</label>
                <div className="relative">
                  <select
                    value={settings.fallback_model}
                    onChange={(e) => updateSetting('fallback_model', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Anthropic Claude 3.5 Sonnet">Anthropic Claude 3.5 Sonnet</option>
                    <option value="OpenAI GPT-4o-mini">OpenAI GPT-4o-mini</option>
                    <option value="Google Gemini 1.5 Pro">Google Gemini 1.5 Pro</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <span>Default Creativity</span>
                    <Info className="w-3 h-3 text-zinc-400" />
                  </div>
                  <span className="font-mono text-zinc-900 border border-zinc-200 rounded px-1.5 py-0.5 bg-zinc-50">
                    {settings.default_creativity}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.default_creativity}
                  onChange={(e) => updateSetting('default_creativity', parseFloat(e.target.value))}
                  className="w-full accent-[#EA580C] cursor-pointer"
                />
              </div>
            </div>

            {/* 2. Product Intelligence */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                <span>Product Intelligence</span>
              </div>

              <div>
                <div className="flex items-center gap-1 text-zinc-500 mb-1">
                  <span>Data refresh interval</span>
                  <Info className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="relative">
                  <select
                    value={settings.data_refresh_interval}
                    onChange={(e) => updateSetting('data_refresh_interval', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Every 6 hours">Every 6 hours</option>
                    <option value="Every 12 hours">Every 12 hours</option>
                    <option value="Every 24 hours">Every 24 hours</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-zinc-500 mb-1">
                  <span>Trend calculation window</span>
                  <Info className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="relative">
                  <select
                    value={settings.trend_calculation_window}
                    onChange={(e) => updateSetting('trend_calculation_window', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="30 days">30 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-zinc-500 mb-1">
                  <span>Minimum data points for trend</span>
                  <Info className="w-3 h-3 text-zinc-400" />
                </div>
                <input
                  type="number"
                  value={settings.min_data_points_for_trend}
                  onChange={(e) =>
                    updateSetting('min_data_points_for_trend', parseInt(e.target.value, 10))
                  }
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Trend score algorithm</label>
                <div className="relative">
                  <select
                    value={settings.trend_score_algorithm}
                    onChange={(e) => updateSetting('trend_score_algorithm', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Weighted Momentum v2">Weighted Momentum v2</option>
                    <option value="Exponential Decay v1">Exponential Decay v1</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>
            </div>

            {/* 3. Tax Configuration */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tax Configuration</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-zinc-600">
                  <span>Enable tax collection</span>
                  <Info className="w-3 h-3 text-zinc-400" />
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_tax_collection}
                  onChange={(e) => updateSetting('enable_tax_collection', e.target.checked)}
                  className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Tax display mode</label>
                <div className="relative">
                  <select
                    value={settings.tax_display_mode}
                    onChange={(e) => updateSetting('tax_display_mode', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Inclusive">Inclusive</option>
                    <option value="Exclusive">Exclusive</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Origin country</label>
                <div className="relative">
                  <select
                    value={settings.origin_country}
                    onChange={(e) => updateSetting('origin_country', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="United States">United States</option>
                    <option value="France">France</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-zinc-600">
                  <span>EU VAT reverse charge</span>
                  <Info className="w-3 h-3 text-zinc-400" />
                </div>
                <input
                  type="checkbox"
                  checked={settings.eu_vat_reverse_charge}
                  onChange={(e) => updateSetting('eu_vat_reverse_charge', e.target.checked)}
                  className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                />
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 2 */}
          {/* ======================================================= */}
          <div className="space-y-5">
            {/* 1. AI Generation Limits */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>AI Generation Limits</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600">Max generations per user / day</span>
                <input
                  type="number"
                  value={settings.max_generations_per_user_day}
                  onChange={(e) =>
                    updateSetting('max_generations_per_user_day', parseInt(e.target.value, 10))
                  }
                  className="w-20 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs text-right font-medium"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600">Max generations per admin / day</span>
                <input
                  type="number"
                  value={settings.max_generations_per_admin_day}
                  onChange={(e) =>
                    updateSetting('max_generations_per_admin_day', parseInt(e.target.value, 10))
                  }
                  className="w-20 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs text-right font-medium"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600">Max tokens per generation</span>
                <input
                  type="number"
                  value={settings.max_tokens_per_generation}
                  onChange={(e) =>
                    updateSetting('max_tokens_per_generation', parseInt(e.target.value, 10))
                  }
                  className="w-20 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs text-right font-medium"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600">Concurrent generations per org</span>
                <input
                  type="number"
                  value={settings.concurrent_generations_per_org}
                  onChange={(e) =>
                    updateSetting('concurrent_generations_per_org', parseInt(e.target.value, 10))
                  }
                  className="w-20 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs text-right font-medium"
                />
              </div>
            </div>

            {/* 2. Trend Calculation Settings */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Trend Calculation Settings</span>
              </div>

              {/* Weight: Growth Velocity */}
              <div>
                <div className="flex justify-between text-zinc-600 mb-1">
                  <span>Weight: Growth Velocity</span>
                  <span className="font-semibold text-zinc-900">
                    {settings.weight_growth_velocity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.weight_growth_velocity}
                  onChange={(e) =>
                    updateSetting('weight_growth_velocity', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[#EA580C] cursor-pointer"
                />
              </div>

              {/* Weight: Search Volume */}
              <div>
                <div className="flex justify-between text-zinc-600 mb-1">
                  <span>Weight: Search Volume</span>
                  <span className="font-semibold text-zinc-900">
                    {settings.weight_search_volume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.weight_search_volume}
                  onChange={(e) =>
                    updateSetting('weight_search_volume', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[#EA580C] cursor-pointer"
                />
              </div>

              {/* Weight: Competition */}
              <div>
                <div className="flex justify-between text-zinc-600 mb-1">
                  <span>Weight: Competition</span>
                  <span className="font-semibold text-zinc-900">
                    {settings.weight_competition}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.weight_competition}
                  onChange={(e) =>
                    updateSetting('weight_competition', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[#EA580C] cursor-pointer"
                />
              </div>

              {/* Weight: Profit Margin */}
              <div>
                <div className="flex justify-between text-zinc-600 mb-1">
                  <span>Weight: Profit Margin</span>
                  <span className="font-semibold text-zinc-900">
                    {settings.weight_profit_margin}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.weight_profit_margin}
                  onChange={(e) =>
                    updateSetting('weight_profit_margin', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[#EA580C] cursor-pointer"
                />
              </div>

              {/* Minimum trend score to show */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-600">Minimum trend score to show</span>
                <input
                  type="number"
                  value={settings.min_trend_score_to_show}
                  onChange={(e) =>
                    updateSetting('min_trend_score_to_show', parseInt(e.target.value, 10))
                  }
                  className="w-16 border border-zinc-200 rounded-xl px-2 py-1 text-xs text-right font-medium"
                />
              </div>
            </div>

            {/* 3. Security */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>Security</span>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Session duration</label>
                <div className="relative">
                  <select
                    value={settings.session_duration}
                    onChange={(e) => updateSetting('session_duration', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="8 hours">8 hours</option>
                    <option value="24 hours">24 hours</option>
                    <option value="7 days">7 days</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Idle session timeout</label>
                <div className="relative">
                  <select
                    value={settings.idle_session_timeout}
                    onChange={(e) => updateSetting('idle_session_timeout', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Force re-authentication</label>
                <div className="relative">
                  <select
                    value={settings.force_re_authentication}
                    onChange={(e) => updateSetting('force_re_authentication', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Every 7 days">Every 7 days</option>
                    <option value="Every 14 days">Every 14 days</option>
                    <option value="Every 30 days">Every 30 days</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-600">IP allowlist</span>
                <button
                  type="button"
                  className="px-3 py-1 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Manage IPs
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* COLUMN 3 */}
          {/* ======================================================= */}
          <div className="space-y-5">
            {/* 1. AI Cost Thresholds */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>AI Cost Thresholds</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Monthly AI spend alert threshold</span>
                  <input
                    type="checkbox"
                    checked={settings.alert_threshold_enabled}
                    onChange={(e) => updateSetting('alert_threshold_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-500 font-semibold">
                    USD
                  </span>
                  <input
                    type="number"
                    value={settings.monthly_ai_spend_alert_threshold}
                    onChange={(e) =>
                      updateSetting('monthly_ai_spend_alert_threshold', parseFloat(e.target.value))
                    }
                    className="flex-1 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Monthly AI spend hard limit</span>
                  <input
                    type="checkbox"
                    checked={settings.hard_limit_enabled}
                    onChange={(e) => updateSetting('hard_limit_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-500 font-semibold">
                    USD
                  </span>
                  <input
                    type="number"
                    value={settings.monthly_ai_spend_hard_limit}
                    onChange={(e) =>
                      updateSetting('monthly_ai_spend_hard_limit', parseFloat(e.target.value))
                    }
                    className="flex-1 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-zinc-600">Block generation when limit reached</span>
                <input
                  type="checkbox"
                  checked={settings.block_generation_when_limit_reached}
                  onChange={(e) =>
                    updateSetting('block_generation_when_limit_reached', e.target.checked)
                  }
                  className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                />
              </div>
            </div>

            {/* 2. Payments */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Payments</span>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Payment Provider</label>
                <div className="relative">
                  <select
                    value={settings.payment_provider}
                    onChange={(e) => updateSetting('payment_provider', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Stripe">Stripe</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Checkout.com">Checkout.com</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Currency</label>
                <div className="relative">
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="USD - US Dollar ($)">USD - US Dollar ($)</option>
                    <option value="EUR - Euro (€)">EUR - Euro (€)</option>
                    <option value="GBP - British Pound (£)">GBP - British Pound (£)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Tax calculation</label>
                <div className="relative">
                  <select
                    value={settings.tax_calculation}
                    onChange={(e) => updateSetting('tax_calculation', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600">Default tax rate</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={settings.default_tax_rate}
                    onChange={(e) => updateSetting('default_tax_rate', parseFloat(e.target.value))}
                    className="w-16 border border-zinc-200 rounded-xl px-2 py-1 text-xs text-right font-medium"
                  />
                  <span className="text-zinc-500">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600">Invoice prefix</span>
                <input
                  type="text"
                  value={settings.invoice_prefix}
                  onChange={(e) => updateSetting('invoice_prefix', e.target.value)}
                  className="w-20 border border-zinc-200 rounded-xl px-2 py-1 text-xs font-mono font-medium"
                />
              </div>
            </div>

            {/* 3. Authentication Policy */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-2 border-b border-zinc-100">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Authentication Policy</span>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Two-factor authentication</label>
                <div className="relative">
                  <select
                    value={settings.two_factor_authentication}
                    onChange={(e) => updateSetting('two_factor_authentication', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Required for Admins">Required for Admins</option>
                    <option value="Optional for all">Optional for all</option>
                    <option value="Required for all">Required for all</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600">Password minimum length</span>
                <input
                  type="number"
                  value={settings.password_minimum_length}
                  onChange={(e) =>
                    updateSetting('password_minimum_length', parseInt(e.target.value, 10))
                  }
                  className="w-16 border border-zinc-200 rounded-xl px-2 py-1 text-xs text-right font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Password complexity</label>
                <div className="relative">
                  <select
                    value={settings.password_complexity}
                    onChange={(e) => updateSetting('password_complexity', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Strong">Strong</option>
                    <option value="Medium">Medium</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Enforce password rotation</label>
                <div className="relative">
                  <select
                    value={settings.enforce_password_rotation}
                    onChange={(e) => updateSetting('enforce_password_rotation', e.target.value)}
                    className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-800"
                  >
                    <option value="Every 90 days">Every 90 days</option>
                    <option value="Every 180 days">Every 180 days</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM FULL-WIDTH TABLE: ADMIN PERMISSIONS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 font-bold text-sm text-zinc-900">
          <Users className="w-4 h-4 text-zinc-500" />
          <span>Admin Permissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FB] text-zinc-400 text-[11px] font-semibold uppercase tracking-wider select-none">
              <tr>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-3 text-center">Dashboard Access</th>
                <th className="py-3 px-3 text-center">Product Intelligence</th>
                <th className="py-3 px-3 text-center">AI Generation</th>
                <th className="py-3 px-3 text-center">Payments</th>
                <th className="py-3 px-3 text-center">Integrations</th>
                <th className="py-3 px-3 text-center">System Settings</th>
                <th className="py-3 px-4 text-center">User Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {settings.permissions.map((row, roleIdx) => (
                <tr key={row.role} className="hover:bg-zinc-50/70 transition">
                  <td className="py-3 px-4 font-bold text-zinc-900">{row.role}</td>

                  {/* Dashboard Access */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.dashboard_access}
                      onChange={() => togglePermission(roleIdx, 'dashboard_access')}
                      className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                  </td>

                  {/* Product Intelligence */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.product_intelligence}
                      onChange={() => togglePermission(roleIdx, 'product_intelligence')}
                      className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                  </td>

                  {/* AI Generation */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.ai_generation}
                      onChange={() => togglePermission(roleIdx, 'ai_generation')}
                      className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                  </td>

                  {/* Payments */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.payments}
                      onChange={() => togglePermission(roleIdx, 'payments')}
                      className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                  </td>

                  {/* Integrations */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.integrations}
                      onChange={() => togglePermission(roleIdx, 'integrations')}
                      className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                  </td>

                  {/* System Settings */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.system_settings}
                      onChange={() => togglePermission(roleIdx, 'system_settings')}
                      className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                  </td>

                  {/* User Management */}
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={row.user_management}
                      onChange={() => togglePermission(roleIdx, 'user_management')}
                      className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
