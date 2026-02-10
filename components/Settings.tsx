
import React from 'react';
import { AppSettings } from '../types';
import { ChevronLeft, Sparkles, Shield, Info, Smartphone } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, onBack }) => {
  const toggleAi = () => {
    onUpdateSettings({ ...settings, enableAiFeatures: !settings.enableAiFeatures });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black italic uppercase">Settings</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Experimental Features</h3>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl mt-1">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">AI Routine Generation</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Enable AI-powered workout building using Gemini 2.0 Flash. This helps generate routines based on specific goals.
              </p>
            </div>
          </div>
          <button 
            onClick={toggleAi}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableAiFeatures ? 'bg-emerald-600' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableAiFeatures ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">App Info</h3>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl">
              <Shield className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Local Privacy</h4>
              <p className="text-sm text-slate-500 mt-1">
                All workout data is stored locally in your browser's storage. No data is sent to external servers except for AI generation requests if enabled.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl">
              <Smartphone className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Progressive Web App</h4>
              <p className="text-sm text-slate-500 mt-1">
                LiftLog works offline. Add it to your home screen for the best experience.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase">
            <Info className="w-3 h-3" />
            Version 1.2.0 - Stable
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
