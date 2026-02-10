
import React from 'react';
import { ChevronLeft, Shield, Smartphone, Info } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black italic uppercase">Settings</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">App Info</h3>
        
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Local Privacy</h4>
              <p className="text-sm text-slate-500 mt-1">
                All workout data is stored locally in your browser. No data is sent to external servers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl">
              <Smartphone className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200">Standalone App</h4>
              <p className="text-sm text-slate-500 mt-1">
                LiftLog works offline. Add it to your home screen via your browser menu for a full-screen experience.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase">
            <Info className="w-3 h-3" />
            Version 1.2.0 - Standalone Edition
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
