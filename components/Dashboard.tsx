import React, { useMemo } from 'react';
import { Workout, WorkoutSession } from '../types.ts';
import { Play, Edit2, Trash2, Calendar, ClipboardList, Activity, Zap, TrendingUp, ChevronRight } from 'lucide-react';

interface DashboardProps {
  workouts: Workout[];
  history: WorkoutSession[];
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onStart: (workout: Workout) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workouts, history, onEdit, onDelete, onStart }) => {
  const quickStats = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentHistory = history.filter(s => new Date(s.date) > oneWeekAgo);
    const totalVolume = recentHistory.reduce((acc, s) => 
      acc + s.exercises.reduce((exAcc, ex) => exAcc + (ex.weight * ex.reps * ex.sets), 0), 0
    );
    return {
      weeklyWorkouts: recentHistory.length,
      weeklyVolume: Math.round(totalVolume / 1000)
    };
  }, [history]);

  return (
    <div className="space-y-10 pb-20">
      {/* QUICK STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">7D Workouts</span>
          </div>
          <div className="text-4xl font-black text-white">{quickStats.weeklyWorkouts}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">7D Volume</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white">{quickStats.weeklyVolume}</span>
            <span className="text-sm font-bold text-slate-600 uppercase">k</span>
          </div>
        </div>
      </div>

      {/* ROUTINES */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">My Routines</h2>
        </div>

        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
            <ClipboardList className="w-12 h-12 text-slate-800 mb-4" />
            <p className="text-slate-600 text-sm">No routines created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {workouts.map((workout) => (
              <div key={workout.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{workout.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{workout.exercises.length} Exercises</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(workout)} className="p-2 text-slate-500 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(workout.id)} className="p-2 text-slate-500 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <button
                  onClick={() => onStart(workout)}
                  className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-[1.8rem] transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-widest text-sm italic"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Session
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