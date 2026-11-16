import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Database,
  Check,
  Sparkles,
  Server,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import { mockProfile } from '../data/mockData';

export default function Settings() {
  const [userName, setUserName] = useState(mockProfile.name);
  const [currency] = useState('Indian Rupee (INR - ₹)');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <SectionHeader
        badge={
          <Badge variant="default" size="sm">
            Configuration
          </Badge>
        }
        title="Application Settings"
        description="Manage your profile parameters, financial digital twin sync preferences, and API configuration."
      />

      {/* Profile Form */}
      <form onSubmit={handleSave} className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <User className="h-4 w-4 text-emerald-400" />
            <span>Digital Twin Profile</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personal details used to benchmark your financial health score
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Currency Standard</label>
            <input
              type="text"
              value={currency}
              disabled
              className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 rounded-xl px-3.5 py-2.5 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Occupation & Persona</label>
            <input
              type="text"
              defaultValue={mockProfile.occupation}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Location</label>
            <input
              type="text"
              defaultValue={mockProfile.location}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Changes update your in-memory twin state
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition flex items-center space-x-1.5"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>
      </form>

      {/* Backend & Environment Integration */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4 text-xs">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Server className="h-4 w-4 text-teal-400" />
            <span>Backend Integration & API Service</span>
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Environment endpoints connecting React to FastAPI
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="font-semibold text-white">FastAPI Base URL</p>
              <p className="text-slate-400 text-[11px] font-mono">http://localhost:8000/api</p>
            </div>
            <Badge variant="success" size="sm">
              Proxy Configured
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Gemini API Service</p>
              <p className="text-slate-400 text-[11px]">Phase 3 Integration Slot</p>
            </div>
            <Badge variant="purple" size="sm">
              Ready for Key
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
