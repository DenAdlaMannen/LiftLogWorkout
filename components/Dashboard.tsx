
import React, { useMemo } from 'react';
import { Workout, WorkoutSession } from '../types.ts';
import { Play, Edit2, Trash2, Calendar, ClipboardList } from 'lucide-react';

interface DashboardProps {
  workouts: Workout[];
  history: WorkoutSession[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onStart: (workout: Workout) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workouts, onEdit, onDelete, onStart }) => {
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => {
      const timeA = a.lastPerformed ? new Date(a.lastPerformed).getTime() : 0;
      const timeB = b.lastPerformed ? new Date(b.lastPerformed).getTime() : 0;
      return timeA - timeB;
    });
  }, [workouts]);

  return (
    <div className="space-y-10 pb-10">
      {/* BRANDING HEADER */}
      <div className="pt-4">
        <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
          LIFT<span className="text-emerald-500">LOG</span>
        </h1>
      </div>

      {/* ROUTINES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">My Routines</h2>
          {workouts.length > 0 && (
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">AUTO-SORTED</span>
          )}
        </div>

        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-slate-900/10 border border-dashed border-slate-800 rounded-[2rem]">
            <ClipboardList className="w-12 h-12 text-slate-800 mb-4" />
            <h2 className="text-xl font-bold text-slate-400">Empty Log</h2>
            <p className="text-slate-600 text-sm mt-2">Create your first routine to start training.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedWorkouts.map((workout) => (
              <div 
                key={workout.id} 
                className="group relative bg-slate-900 border border-slate-800 rounded-[2rem] p-6 hover:border-emerald-500 transition-all shadow-xl"
              >
                {!workout.lastPerformed && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg rotate-3 z-10">
                    NEW
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                      {workout.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{workout.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onEdit(workout)}
                      className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(workout.id)}
                      className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                    <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{workout.exercises.length} EXERCISES</span>
                  </div>
                  {workout.lastPerformed && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{new Date(workout.lastPerformed).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onStart(workout)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Training
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;