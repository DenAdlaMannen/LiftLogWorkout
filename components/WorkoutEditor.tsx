
import React, { useState, useEffect } from 'react';
import { Workout, Exercise } from '../types';
import { Plus, Trash2, Save, X, Sparkles, Loader2, GripVertical } from 'lucide-react';
import { generateWorkout } from '../services/geminiService';

interface WorkoutEditorProps {
  workout: Workout | null;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
  enableAi: boolean;
}

const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ workout, onSave, onCancel, enableAi }) => {
  const [name, setName] = useState(workout?.name || '');
  const [description, setDescription] = useState(workout?.description || '');
  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises || []);
  const [aiGoal, setAiGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleAiGenerate = async () => {
    if (!aiGoal) return;
    setIsGenerating(true);
    try {
      const generated = await generateWorkout(aiGoal);
      if (generated.name) setName(generated.name);
      if (generated.description) setDescription(generated.description);
      if (generated.exercises) {
        setExercises(generated.exercises.map(e => ({
          ...e,
          id: Math.random().toString(36).substr(2, 9)
        })));
      }
      setAiGoal('');
    } catch (e) {
      alert("AI generation failed. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{workout ? 'Edit Workout' : 'New Routine'}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* AI Helper Card - Hidden behind feature flag */}
        {enableAi && (
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              AI Workout Builder
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text"
                placeholder="e.g., Build explosive power for soccer"
                className="flex-1 bg-slate-900 border border-emerald-900/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                disabled={isGenerating}
              />
              <button 
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiGoal}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate
              </button>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Workout Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Push Day Intensity"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Focus on mind-muscle connection..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[80px]"
            />
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Exercises</h3>
          <button 
            onClick={addExercise}
            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>
        </div>

        {exercises.length === 0 && (
          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            No exercises added yet. Click "Add Exercise" to start building your routine.
          </div>
        )}

        <div className="space-y-3">
          {exercises.map((ex, index) => (
            <div key={ex.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500">
                  {index + 1}
                </div>
                <input 
                  type="text"
                  placeholder="Exercise Name"
                  className="flex-1 bg-transparent border-b border-slate-700 py-1 focus:outline-none focus:border-emerald-500 transition-all font-bold text-lg"
                  value={ex.name}
                  onChange={(e) => updateExercise(ex.id, { name: e.target.value })}
                />
                <button 
                  onClick={() => removeExercise(ex.id)}
                  className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Sets</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center font-bold"
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.id, { sets: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Reps</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center font-bold"
                    value={ex.targetReps}
                    onChange={(e) => updateExercise(ex.id, { targetReps: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Weight (kg)</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center font-bold"
                    value={ex.targetWeight}
                    onChange={(e) => updateExercise(ex.id, { targetWeight: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Footer Actions */}
      <div className="sticky bottom-4 left-0 right-0 py-4 flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
        >
          <Save className="w-5 h-5" />
          Save Workout
        </button>
      </div>
    </div>
  );
};

export default WorkoutEditor;
