import React, { useState, useEffect } from 'react';
import { Workout, AppView, WorkoutSession, BodyWeightEntry } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import WorkoutEditor from './components/WorkoutEditor.tsx';
import ActiveWorkout from './components/ActiveWorkout.tsx';
import Analytics from './components/Analytics.tsx';
import { Plus, Dumbbell, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [bodyWeightHistory, setBodyWeightHistory] = useState<BodyWeightEntry[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  
  useEffect(() => {
    const savedWorkouts = localStorage.getItem('liftlog_workouts');
    const savedHistory = localStorage.getItem('liftlog_history');
    const savedWeight = localStorage.getItem('liftlog_weight');
    if (savedWorkouts) {
      try { setWorkouts(JSON.parse(savedWorkouts)); } catch (e) { console.error(e); }
    }
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    if (savedWeight) {
      try { setBodyWeightHistory(JSON.parse(savedWeight)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('liftlog_workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('liftlog_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('liftlog_weight', JSON.stringify(bodyWeightHistory));
  }, [bodyWeightHistory]);

  const handleCreateNew = () => {
    setEditingWorkout(null);
    setView('EDITOR');
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setView('EDITOR');
  };

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
    setView('SESSION');
  };

  const handleSaveWorkout = (workout: Workout) => {
    setWorkouts(prev => {
      const index = prev.findIndex(w => w.id === workout.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = workout;
        return next;
      }
      return [...prev, workout];
    });
    setView('DASHBOARD');
  };

  const handleFinishWorkout = (session: WorkoutSession) => {
    setHistory(prev => [...prev, session]);
    setWorkouts(prev => prev.map(w => 
      w.id === session.workoutId ? { ...w, lastPerformed: session.date } : w
    ));
    setView('DASHBOARD');
  };

  const handleAddWeight = (entry: BodyWeightEntry) => {
    setBodyWeightHistory(prev => {
      const filtered = prev.filter(e => e.date !== entry.date);
      return [...filtered, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
  };

  const handleDeleteWorkout = (id: string) => {
    if (window.confirm("Delete this routine?")) {
      setWorkouts(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleBackToDashboard = () => setView('DASHBOARD');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* APP HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('DASHBOARD')}>
          <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white italic uppercase">
            Lift<span className="text-emerald-500">Log</span>
          </h1>
        </div>
        
        <div className="flex gap-2">
          {view === 'DASHBOARD' && (
            <>
              <button
                onClick={() => setView('ANALYTICS')}
                className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-full text-slate-400 hover:text-emerald-400 transition-all hover:bg-slate-800"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-full transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Routine</span>
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full no-scrollbar">
        {view === 'DASHBOARD' && (
          <Dashboard 
            workouts={workouts} 
            history={history}
            onEdit={handleEdit} 
            onDelete={handleDeleteWorkout}
            onStart={handleStartWorkout}
          />
        )}
        {view === 'EDITOR' && (
          <WorkoutEditor 
            workout={editingWorkout} 
            onSave={handleSaveWorkout} 
            onCancel={handleBackToDashboard} 
          />
        )}
        {view === 'SESSION' && activeWorkout && (
          <ActiveWorkout 
            workout={activeWorkout} 
            history={history}
            onFinish={handleFinishWorkout}
            onCancel={handleBackToDashboard}
          />
        )}
        {view === 'ANALYTICS' && (
          <Analytics 
            history={history}
            bodyWeightHistory={bodyWeightHistory}
            onAddWeight={handleAddWeight}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
};

export default App;