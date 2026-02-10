
import React, { useMemo } from 'react';
import { Workout } from '../types';
import { Play, Edit2, Trash2, Calendar, ClipboardList, Smartphone, ArrowRight } from 'lucide-react';

interface DashboardProps {
  workouts: Workout[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onStart: (workout: Workout) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workouts, onEdit, onDelete, onStart }) => {
  // Sort workouts so the one performed furthest away (or never) is at the top
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => {
      const timeA = a.lastPerformed ? new Date(a.lastPerformed).getTime() : 0;
      const timeB = b.lastPerformed ? new Date(b.lastPerformed).getTime() : 0;
      return timeA - timeB; // Ascending: Never/Oldest first
    });
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6">
          <ClipboardList className="w-10 h-10 text-slate-700" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Workouts Yet</h2>
        <p className="text-slate-400 mb-8 max-w-xs">
          Your training journey starts here. Create your first workout routine to begin logging.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-400 uppercase tracking-widest">My Routines</h2>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded uppercase">Sorted by Stale First</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedWorkouts.map((workout) => (
          <div 
            key={workout.id} 
            className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-900/10"
          >
            {!workout.lastPerformed && (
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg rotate-3 z-10">
                READY TO START
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {workout.name}
                </h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-1">{workout.description || 'No description'}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(workout)}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(workout.id)}
                  className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{workout.exercises.length} Exercises</span>
              </div>
              {workout.lastPerformed && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Last: {new Date(workout.lastPerformed).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onStart(workout)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-950/20 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Session
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-900/30 border border-slate-800/50 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl">
            <Smartphone className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200">Use this on your phone</h4>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Open this page in Safari or Chrome, tap the Share icon, and select <span className="text-slate-300 font-semibold">"Add to Home Screen"</span> to install LiftLog as a native app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
