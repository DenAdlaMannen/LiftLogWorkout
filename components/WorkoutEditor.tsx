
import React, { useState } from 'react';
import { Workout, Exercise } from '../types.ts';
import { Plus, Trash2, X } from 'lucide-react';

interface WorkoutEditorProps {
  workout: Workout | null;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ workout, onSave, onCancel }) => {
  const [name, setName] = useState(workout?.name || '');
  const [description, setDescription] = useState(workout?.description || '');
  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises || []);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      targetReps: 10,
      targetWeight: 0,
      sets: 3,
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Workout name is required");
      return;
    }
    const finalWorkout: Workout = {
      id: workout?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      exercises,
      lastPerformed: workout?.lastPerformed,
    };
    onSave(finalWorkout);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          {workout ? 'Edit' : 'New'} <span className="text-emerald-500">Routine</span>
        </h2>
        <button onClick={onCancel} className="p-2 bg-slate-900 rounded-full text-slate-400">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6 shadow-xl">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Workout Name</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Push Day"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none text-xl font-bold transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Notes / Goals</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Routine details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none min-h-[100px] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Exercises</h3>
          <button 
            onClick={addExercise}
            className="text-emerald-500 hover:text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {exercises.length === 0 && (
          <div className="py-12 text-center text-slate-600 border border-dashed border-slate-800 rounded-[2rem]">
            Tap "Add" to include exercises.
          </div>
        )}

        <div className="space-y-4">
          {exercises.map((ex, index) => (
            <div key={ex.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-black text-white">
                  {index + 1}
                </div>
                <input 
                  type="text"
                  placeholder="Exercise Name"
                  className="flex-1 bg-transparent border-b border-slate-800 py-1 focus:border-emerald-500 outline-none font-bold text-lg transition-colors"
                  value={ex.name}
                  onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                />
                <button onClick={() => removeExercise(ex.id)} className="p-2 text-slate-600 hover:text-rose-500">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Sets</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center font-bold" value={ex.sets} onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Reps</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center font-bold" value={ex.targetReps} onChange={(e) => updateExercise(ex.id, { targetReps: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Weight</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center font-bold" value={ex.targetWeight} onChange={(e) => updateExercise(ex.id, { targetWeight: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 flex gap-4">
        <button onClick={onCancel} className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-sm">Cancel</button>
        <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-sm">Save Routine</button>
      </div>
    </div>
  );
};

export default WorkoutEditor;