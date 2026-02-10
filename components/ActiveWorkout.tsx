
import React, { useState, useEffect, useMemo } from 'react';
import { Workout, WorkoutSession, ExerciseSession } from '../types.ts';
import { ChevronLeft, ChevronRight, CheckCircle, Timer, Trophy, X, TrendingUp, Plus, Minus, Trash2, StickyNote, History, Info, Calendar, Zap } from 'lucide-react';

interface SetData {
  weight: number;
  reps: number;
}

interface ActiveWorkoutProps {
  workout: Workout;
  history: WorkoutSession[];
  onFinish: (session: WorkoutSession) => void;
  onCancel: () => void;
}

const Sparkline: React.FC<{ data: number[], color?: string, height?: number }> = ({ data, color = "#10b981", height = 30 }) => {
  if (data.length < 2) return <div className="text-[10px] text-slate-600 font-bold uppercase italic">No history</div>;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 5;
  const width = 200;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ workout, history, onFinish, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState<string | null>(null);
  const [showPrevNote, setShowPrevNote] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const lastPerformedMap = useMemo(() => {
    const map = new Map<string, number>();
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sortedHistory.forEach(session => {
      session.exercises.forEach(ex => {
        map.set(ex.name.toLowerCase(), new Date(session.date).getTime());
      });
    });
    return map;
  }, [history]);

  const sortedExercises = useMemo(() => {
    return [...workout.exercises].sort((a, b) => {
      const timeA = lastPerformedMap.get(a.name.toLowerCase()) || 0; 
      const timeB = lastPerformedMap.get(b.name.toLowerCase()) || 0;
      if (timeA !== timeB) return timeA - timeB;
      return workout.exercises.indexOf(a) - workout.exercises.indexOf(b);
    });
  }, [workout.exercises, lastPerformedMap]);
  
  const [liveSessionData, setLiveSessionData] = useState<Record<string, SetData[]>>(() => {
    const initialData: Record<string, SetData[]> = {};
    const exerciseHistoryMap = new Map<string, ExerciseSession>();
    [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(session => {
      session.exercises.forEach(ex => {
        exerciseHistoryMap.set(ex.name.toLowerCase(), ex);
      });
    });

    sortedExercises.forEach(ex => {
      const prevExData = exerciseHistoryMap.get(ex.name.toLowerCase());
      if (prevExData) {
        initialData[ex.id] = Array.from({ length: prevExData.sets }, () => ({
          weight: prevExData.weight,
          reps: prevExData.reps
        }));
      } else {
        initialData[ex.id] = Array.from({ length: ex.sets }, () => ({
          weight: ex.targetWeight,
          reps: ex.targetReps
        }));
      }
    });
    return initialData;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalExercises = sortedExercises.length;
  const progress = (completedExercises.size / totalExercises) * 100;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const exerciseStats = useMemo(() => {
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const statsMap = new Map<string, { oneRM: number[], volume: number[], lastNote?: string, lastDate?: string }>();

    sortedExercises.forEach(ex => {
      const oneRMs: number[] = [];
      const volumes: number[] = [];
      let lastNote: string | undefined;
      let lastDate: string | undefined;
      sortedHistory.forEach(session => {
        const found = session.exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
        if (found) {
          const oneRM = found.weight / (1.0278 - (0.0278 * found.reps));
          const volume = found.weight * found.reps * found.sets;
          oneRMs.push(Math.round(oneRM));
          volumes.push(volume);
          if (found.note) lastNote = found.note;
          lastDate = session.date;
        }
      });
      statsMap.set(ex.id, { oneRM: oneRMs, volume: volumes, lastNote, lastDate });
    });
    return statsMap;
  }, [history, sortedExercises]);

  const handleNext = () => currentIndex < totalExercises - 1 && setCurrentIndex(currentIndex + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

  const toggleComplete = (id: string) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateSetData = (exId: string, setIndex: number, field: keyof SetData, delta: number) => {
    setLiveSessionData(prev => {
      const sets = [...prev[exId]];
      sets[setIndex] = { ...sets[setIndex], [field]: Math.max(0, sets[setIndex][field] + delta) };
      return { ...prev, [exId]: sets };
    });
  };

  const handleFinish = () => {
    const session: WorkoutSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      workoutId: workout.id,
      exercises: Array.from(completedExercises).map(id => {
        const ex = sortedExercises.find(e => e.id === id)!;
        const sets = liveSessionData[id];
        const bestSet = sets.reduce((best, curr) => {
          const curr1RM = curr.weight / (1.0278 - (0.0278 * curr.reps));
          const best1RM = best.weight / (1.0278 - (0.0278 * best.reps));
          return curr1RM > best1RM ? curr : best;
        }, sets[0]);
        return {
          name: ex.name,
          weight: bestSet.weight,
          reps: bestSet.reps,
          sets: sets.length,
          note: notes[id] || ''
        };
      })
    };
    onFinish(session);
  };

  if (showSummary) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/50">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-black mb-4 italic uppercase tracking-tighter">Session Over</h2>
        <div className="grid grid-cols-2 gap-4 w-full mb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">Duration</span>
            <span className="text-2xl font-bold text-white">{formatTime(seconds)}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">Completed</span>
            <span className="text-2xl font-bold text-white">{completedExercises.size}/{totalExercises}</span>
          </div>
        </div>
        <button onClick={handleFinish} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-900/30 text-lg uppercase tracking-wider active:scale-95">
          Finish & Log
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[900px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><Timer className="w-5 h-5" /></div>
          <span className="text-xl font-mono font-bold text-white">{formatTime(seconds)}</span>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-900 rounded-full border border-slate-800"><X className="w-5 h-5" /></button>
      </div>

      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="w-full h-full flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {sortedExercises.map((ex, i) => {
            const stats = exerciseStats.get(ex.id);
            const sets = liveSessionData[ex.id] || [];
            const isCompleted = completedExercises.has(ex.id);
            const isNoteActive = showNoteInput === ex.id;
            const hasLastNote = !!stats?.lastNote;
            
            return (
              <div key={ex.id} className="w-full h-full flex-shrink-0 px-1">
                <div className={`bg-slate-900 border-2 rounded-[2rem] p-5 sm:p-7 h-full flex flex-col transition-all duration-300 ${i === currentIndex ? 'border-emerald-500/30 opacity-100 scale-100 shadow-2xl shadow-emerald-500/10' : 'border-slate-800 opacity-20 scale-95'}`}>
                  
                  <div className="relative text-center mb-4">
                    <div className="flex justify-center items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Ex {i + 1} / {totalExercises}</span>
                      {i === 0 && (
                        <span className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase shadow-lg shadow-emerald-900/40">
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          Top Priority
                        </span>
                      )}
                      {stats?.lastDate && (
                        <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded text-[8px] font-black text-slate-500 uppercase">
                          <Calendar className="w-2.5 h-2.5" />
                          Last: {new Date(stats.lastDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight mb-2">{ex.name}</h3>
                    
                    <div className="flex items-center justify-center gap-2">
                      {hasLastNote && (
                        <button 
                          onClick={() => setShowPrevNote(showPrevNote === ex.id ? null : ex.id)}
                          className={`p-1.5 rounded-full transition-all border flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${showPrevNote === ex.id ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'}`}
                        >
                          <History className="w-3 h-3" />
                          Last Note
                        </button>
                      )}
                      <button 
                        onClick={() => setShowNoteInput(isNoteActive ? null : ex.id)}
                        className={`p-1.5 rounded-full transition-all border flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${notes[ex.id] ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'}`}
                      >
                        <StickyNote className="w-3 h-3" />
                        Add Note
                      </button>
                    </div>
                  </div>

                  {showPrevNote === ex.id && stats?.lastNote && (
                    <div className="mb-4 animate-in slide-in-from-top-2 duration-200 bg-amber-950/20 border border-amber-900/50 rounded-xl p-3 flex gap-3">
                      <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[8px] font-black text-amber-500 uppercase block mb-1">Previous Session Feedback</span>
                        <p className="text-xs text-amber-200/80 leading-relaxed italic">"{stats.lastNote}"</p>
                      </div>
                    </div>
                  )}

                  {isNoteActive && (
                    <div className="mb-4 animate-in slide-in-from-top-2 duration-200">
                      <textarea
                        autoFocus
                        placeholder="Add a note for this exercise..."
                        className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[80px] text-slate-200"
                        value={notes[ex.id] || ''}
                        onChange={(e) => setNotes({ ...notes, [ex.id]: e.target.value })}
                      />
                    </div>
                  )}

                  {!isNoteActive && !showPrevNote && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 space-y-2 pr-1">
                      <div className="grid grid-cols-[3rem_1fr_1fr_2.5rem] gap-2 items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 pb-1 sticky top-0 bg-slate-900 z-10">
                        <span>Set</span><span className="text-center">Weight</span><span className="text-center">Reps</span><span></span>
                      </div>
                      {sets.map((set, setIdx) => (
                        <div key={setIdx} className="grid grid-cols-[3rem_1fr_1fr_2.5rem] gap-2 items-center bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                          <div className="text-sm font-bold text-slate-400 text-center">{setIdx + 1}</div>
                          <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-800">
                            <button onClick={() => updateSetData(ex.id, setIdx, 'weight', -2.5)} className="p-1 hover:bg-slate-800 rounded"><Minus className="w-3 h-3 text-slate-400" /></button>
                            <span className="text-sm font-bold text-white">{set.weight}<span className="text-[8px] ml-0.5 text-slate-500">kg</span></span>
                            <button onClick={() => updateSetData(ex.id, setIdx, 'weight', 2.5)} className="p-1 hover:bg-slate-800 rounded"><Plus className="w-3 h-3 text-emerald-500" /></button>
                          </div>
                          <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-800">
                            <button onClick={() => updateSetData(ex.id, setIdx, 'reps', -1)} className="p-1 hover:bg-slate-800 rounded"><Minus className="w-3 h-3 text-slate-400" /></button>
                            <span className="text-sm font-bold text-white">{set.reps}</span>
                            <button onClick={() => updateSetData(ex.id, setIdx, 'reps', 1)} className="p-1 hover:bg-slate-800 rounded"><Plus className="w-3 h-3 text-emerald-500" /></button>
                          </div>
                          <button onClick={() => {
                            setLiveSessionData(prev => ({ ...prev, [ex.id]: prev[ex.id].filter((_, idx) => idx !== setIdx) }));
                          }} className="flex items-center justify-center p-2 text-slate-600 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => {
                        setLiveSessionData(prev => {
                          const s = [...prev[ex.id]];
                          s.push({ ...(s[s.length-1] || { weight: 0, reps: 0 }) });
                          return { ...prev, [ex.id]: s };
                        });
                      }} className="w-full py-2.5 border border-dashed border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-1.5"><Plus className="w-3 h-3" />Add Set</button>
                    </div>
                  )}

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 mb-4 mt-auto">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Historical Progress</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-[8px] font-bold uppercase text-emerald-400">1RM: {stats?.oneRM.length ? `${stats.oneRM[stats.oneRM.length-1]}kg` : '-'}</div>
                      </div>
                    </div>
                    {stats && stats.oneRM.length > 0 ? (
                      <div className="flex gap-2">
                        <div className="flex-1"><Sparkline data={stats.oneRM} color="#10b981" /></div>
                        <div className="flex-1"><Sparkline data={stats.volume} color="#3b82f6" /></div>
                      </div>
                    ) : <div className="h-[30px] flex items-center justify-center text-[10px] text-slate-700 font-bold uppercase italic tracking-widest">Initial Data Pending</div>}
                  </div>

                  <button onClick={() => toggleComplete(ex.id)} className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95 border-2 ${isCompleted ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    <CheckCircle className={`w-6 h-6 ${isCompleted ? 'fill-white text-emerald-600' : ''}`} />
                    {isCompleted ? 'EXERCISE DONE' : 'MARK COMPLETE'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 flex items-center justify-between gap-4">
        <button onClick={handlePrev} disabled={currentIndex === 0} className={`p-3 rounded-xl transition-all ${currentIndex === 0 ? 'text-slate-800' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'}`}><ChevronLeft className="w-6 h-6" /></button>
        <div className="flex gap-1.5">{sortedExercises.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-800'}`} />)}</div>
        {currentIndex === totalExercises - 1 ? (
          <button onClick={() => setShowSummary(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95">End Workout</button>
        ) : <button onClick={handleNext} className="p-3 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"><ChevronRight className="w-6 h-6" /></button>}
      </div>
    </div>
  );
};

export default ActiveWorkout;